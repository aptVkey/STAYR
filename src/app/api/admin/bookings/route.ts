import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { toBooking } from "@/lib/booking";
import { query, str } from "@/lib/db";

/** GET — every strategy call, newest first, with the contact it belongs to. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const rows = await query(
    `SELECT b.*, c.name AS contact_name, c.email AS contact_email, c.company AS contact_company
     FROM bookings b JOIN contacts c ON c.id = b.contact_id
     ORDER BY b.start_ts DESC LIMIT 500`,
  );
  return NextResponse.json({
    ok: true,
    now: Date.now(),
    bookings: rows.map((row) => ({
      ...toBooking(row),
      contact: {
        name: str(row.contact_name),
        email: str(row.contact_email),
        company: str(row.contact_company),
      },
    })),
  });
}
