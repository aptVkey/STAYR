import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { BOOKING_STATUSES, toBooking } from "@/lib/booking";
import { addActivity } from "@/lib/crm";
import { query, run } from "@/lib/db";

/** PATCH — mark a call as completed, no-show, cancelled or confirmed again. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as { status?: unknown };
  const status = BOOKING_STATUSES.find((s) => s === body.status);
  if (!status) return NextResponse.json({ ok: false, error: "status" }, { status: 422 });

  const row = (await query("SELECT * FROM bookings WHERE id = ?", [id]))[0];
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const booking = toBooking(row);

  if (booking.status !== status) {
    await run("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    await addActivity(booking.contactId, "booking_status", {
      bookingId: id,
      start: booking.start,
      from: booking.status,
      to: status,
    });
  }
  return NextResponse.json({ ok: true });
}
