import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin/auth";
import { bumpSessionVersion } from "@/lib/settings";

/** Signs out every admin session, on every device. */
export async function POST(request: Request) {
  if (await isAdmin(request)) await bumpSessionVersion();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: ADMIN_COOKIE, value: "", maxAge: 0, path: "/" });
  return response;
}
