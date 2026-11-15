import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, createSessionToken, isAdmin, sessionCookie } from "@/lib/admin/auth";
import { clientKey, rateLimited } from "@/lib/leads";

/** GET — session status. POST — sign in with the admin password. */
export async function GET(request: Request) {
  return NextResponse.json({ configured: adminConfigured(), authenticated: await isAdmin(request) });
}

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (rateLimited(`admin-login:${clientKey(request)}`, 5, 5 * 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  if (typeof body.password !== "string" || !checkPassword(body.password)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie(await createSessionToken()));
  return response;
}
