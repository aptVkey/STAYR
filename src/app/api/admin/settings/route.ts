import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getBooking,
  getTracking,
  mergeTracking,
  sanitizeBooking,
  saveBooking,
  saveTracking,
  type TrackingSettings,
} from "@/lib/settings";

const hint = (token: string) => (token ? `••••${token.slice(-4)}` : "");

/** Tracking settings as the admin sees them: tokens are never returned. */
const redact = (t: TrackingSettings) => ({
  meta: { pixelId: t.meta.pixelId, testEventCode: t.meta.testEventCode, capiTokenHint: hint(t.meta.capiToken) },
  google: t.google,
  tiktok: {
    pixelId: t.tiktok.pixelId,
    testEventCode: t.tiktok.testEventCode,
    eventsTokenHint: hint(t.tiktok.eventsToken),
  },
  advancedMatching: t.advancedMatching,
});

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const [tracking, booking] = await Promise.all([getTracking(), getBooking()]);
  return NextResponse.json({ ok: true, tracking: redact(tracking), booking });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (body.tracking && typeof body.tracking === "object") {
    const next = mergeTracking(await getTracking(), body.tracking as Record<string, unknown>);
    await saveTracking(next);
  }
  if (body.booking && typeof body.booking === "object") {
    await saveBooking(sanitizeBooking(body.booking as Record<string, unknown>));
  }

  const [tracking, booking] = await Promise.all([getTracking(), getBooking()]);
  return NextResponse.json({ ok: true, tracking: redact(tracking), booking });
}
