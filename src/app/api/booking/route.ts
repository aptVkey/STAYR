import { after, NextResponse } from "next/server";
import { createBooking, SlotUnavailableError } from "@/lib/booking";
import { parseAdContext, requestMeta, sendConversion } from "@/lib/conversions";
import { addActivity, upsertContact } from "@/lib/crm";
import { clientKey, notifyWebhook, rateLimited, sanitizeAttribution } from "@/lib/leads";
import { getBooking } from "@/lib/settings";
import { clean, isEmail } from "@/lib/validation";

/**
 * POST /api/booking — reserve a strategy call.
 * Creates (or updates) the contact, moves it to SQL and stores the booking.
 */
export async function POST(request: Request) {
  if (rateLimited(`booking:${clientKey(request)}`, 6)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (clean(body.hp)) return NextResponse.json({ ok: true, mode: "ignored" });

  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const company = clean(body.company, 120);
  const notes = clean(body.notes, 1000);
  const start = Number(body.start);

  const fields: Record<string, string> = {};
  if (!name) fields.name = "required";
  if (!email) fields.email = "required";
  else if (!isEmail(email)) fields.email = "email";
  if (!company) fields.company = "required";
  if (Object.keys(fields).length || !Number.isFinite(start)) {
    return NextResponse.json({ ok: false, error: "validation", fields }, { status: 422 });
  }

  const ad = parseAdContext(body.ad);
  const attribution = sanitizeAttribution(body.attribution);

  try {
    const settings = await getBooking();
    if (!settings.enabled) {
      return NextResponse.json({ ok: false, error: "disabled" }, { status: 409 });
    }

    const { contact } = await upsertContact({
      email,
      name,
      company,
      adConsent: ad.consent,
      attribution,
      reach: "mql",
    });
    const booking = await createBooking(settings, {
      contactId: contact.id,
      start,
      visitorTz: clean(body.timezone, 60),
      notes,
    });
    // Only a stored booking qualifies the contact as SQL.
    await upsertContact({ email, adConsent: ad.consent, reach: "sql" });
    await addActivity(contact.id, "booking", {
      bookingId: booking.id,
      start: booking.start,
      end: booking.end,
      placement: clean(body.placement, 60),
      ...(notes ? { notes } : {}),
    });

    after(async () => {
      await notifyWebhook("strategy_call_booked", {
        id: booking.id,
        type: "strategy_call_booked",
        start: new Date(booking.start).toISOString(),
        end: new Date(booking.end).toISOString(),
        fields: { name, email, company, notes },
        attribution,
      });
      if (ad.consent) {
        const meta = requestMeta(request);
        await sendConversion("schedule", {
          eventId: ad.eventId,
          email,
          ip: meta.ip,
          userAgent: meta.userAgent,
          url: ad.url,
          fbp: ad.fbp,
          fbc: ad.fbc,
          ttp: ad.ttp,
          ttclid: attribution.ttclid,
        });
      }
    });

    return NextResponse.json({
      ok: true,
      booking: {
        id: booking.id,
        start: booking.start,
        end: booking.end,
        meetingLink: settings.meetingLink,
        timezone: settings.timezone,
      },
    });
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return NextResponse.json({ ok: false, error: "slot_taken" }, { status: 409 });
    }
    console.error("[booking] could not create booking:", error);
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }
}
