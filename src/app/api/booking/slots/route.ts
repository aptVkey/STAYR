import { connection, NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking";
import { getBooking } from "@/lib/settings";

/** GET /api/booking/slots — open strategy-call slots, as UTC timestamps. */
export async function GET() {
  await connection();
  try {
    const settings = await getBooking();
    const days = await getAvailability(settings);
    return NextResponse.json(
      {
        enabled: settings.enabled,
        timezone: settings.timezone,
        durationMin: settings.durationMin,
        days,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("[booking] could not load slots:", error);
    return NextResponse.json({ enabled: false, days: [] }, { status: 503 });
  }
}
