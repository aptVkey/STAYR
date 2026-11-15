import { connection, NextResponse } from "next/server";
import { getBooking, getTracking } from "@/lib/settings";

/**
 * GET /api/config — the public part of the admin settings: tag IDs the
 * browser needs to load the pixels, and whether native booking is on.
 * Access tokens are never included.
 */
export async function GET() {
  // Read at request time: settings change in the admin without a rebuild.
  await connection();
  try {
    const [tracking, booking] = await Promise.all([getTracking(), getBooking()]);
    return NextResponse.json(
      {
        gtmId: tracking.google.gtmId,
        ga4Id: tracking.google.ga4Id,
        googleAdsId: tracking.google.adsId,
        googleAdsLabels: {
          optin_submit: tracking.google.labelOptin,
          application_submit: tracking.google.labelApplication,
          strategy_call_confirmed: tracking.google.labelCall,
        },
        metaPixelId: tracking.meta.pixelId,
        tiktokPixelId: tracking.tiktok.pixelId,
        nativeBooking: booking.enabled,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("[config] could not read settings:", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
