import { after, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { toBooking } from "@/lib/booking";
import { sendConversion } from "@/lib/conversions";
import { deleteContact, getContact, isStage, setStage } from "@/lib/crm";
import { num, query, run, str } from "@/lib/db";
import { clean } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** GET — contact with timeline and calls. PATCH — edit. DELETE — erase. */
export async function GET(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  const contact = await getContact(id);
  if (!contact) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const [activities, bookings] = await Promise.all([
    query("SELECT * FROM activities WHERE contact_id = ? ORDER BY ts DESC, id DESC LIMIT 200", [id]),
    query("SELECT * FROM bookings WHERE contact_id = ? ORDER BY start_ts DESC", [id]),
  ]);

  return NextResponse.json({
    ok: true,
    contact,
    activities: activities.map((row) => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(str(row.data)) as Record<string, unknown>;
      } catch {
        /* keep empty */
      }
      return { id: num(row.id), ts: num(row.ts), type: str(row.type), data };
    }),
    bookings: bookings.map(toBooking),
  });
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  const contact = await getContact(id);
  if (!contact) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const text = (key: string, current: string, max = 200) =>
    typeof body[key] === "string" ? clean(body[key], max) : current;
  const dealValue =
    body.dealValue === undefined
      ? contact.dealValue
      : Math.max(0, Math.min(100_000_000, Math.round(Number(body.dealValue)) || 0));

  await run(
    `UPDATE contacts SET name = ?, company = ?, website = ?, country = ?, deal_value = ?, updated_at = ?
     WHERE id = ?`,
    [
      text("name", contact.name, 120),
      text("company", contact.company, 120),
      text("website", contact.website, 300),
      text("country", contact.country, 80),
      dealValue,
      Date.now(),
      id,
    ],
  );

  if (isStage(body.stage) && body.stage !== contact.stage) {
    await setStage(contact, body.stage);
    // Closed-won: report the sale to the ad platforms, if this person agreed
    // to advertising measurement when they entered the funnel.
    if (body.stage === "customer" && contact.adConsent && !contact.wonAt) {
      after(() =>
        sendConversion("purchase", {
          eventId: `won-${contact.id}`,
          email: contact.email,
          value: dealValue,
          ttclid: contact.attribution.ttclid,
          source: "system_generated",
        }),
      );
    }
  }

  return NextResponse.json({ ok: true, contact: await getContact(id) });
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  await deleteContact(id);
  return NextResponse.json({ ok: true });
}
