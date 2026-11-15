import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { requestMeta, sendMeta, sendTikTok } from "@/lib/conversions";
import { getTracking } from "@/lib/settings";

/**
 * POST — send one test "Lead" event to Meta or TikTok with the saved
 * credentials and return the platform's answer. With a test event code
 * saved, it appears in the platform's Test Events view only.
 */
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { platform?: unknown };
  const settings = await getTracking();
  const meta = requestMeta(request);
  const ctx = {
    eventId: `test-${randomUUID()}`,
    ip: meta.ip,
    userAgent: meta.userAgent,
    url: new URL("/", request.url).toString().split("?")[0],
  };

  const result =
    body.platform === "meta"
      ? await sendMeta(settings, "lead", ctx)
      : body.platform === "tiktok"
        ? await sendTikTok(settings, "lead", ctx)
        : null;

  if (!result) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 422 });
  return NextResponse.json({ ok: result.ok, status: result.status, detail: result.detail });
}
