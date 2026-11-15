import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { addActivity, isStage, toContact, upsertContact, setStage } from "@/lib/crm";
import { num, query, str } from "@/lib/db";
import { clean, isEmail } from "@/lib/validation";

const csvCell = (value: unknown) => {
  let text = String(value ?? "");
  // Neutralise spreadsheet formulas in exported, visitor-supplied text.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

/** GET — every contact (JSON, or CSV with ?format=csv). POST — add one by hand. */
export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const rows = await query(
    `SELECT c.*,
       (SELECT MIN(start_ts) FROM bookings b
          WHERE b.contact_id = c.id AND b.status = 'confirmed' AND b.start_ts > ?) AS next_call
     FROM contacts c ORDER BY c.updated_at DESC LIMIT 2000`,
    [Date.now()],
  );
  const contacts = rows.map((row) => ({
    ...toContact(row),
    nextCall: row.next_call == null ? null : num(row.next_call),
    demo: num(row.demo) === 1,
  }));

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const header = [
      "name", "email", "company", "website", "country", "stage", "deal_value_eur", "channel",
      "source", "campaign", "business_type", "properties", "budget", "objective",
      "marketing_consent", "created_at",
    ];
    const lines = contacts.map((c) =>
      [
        c.name, c.email, c.company, c.website, c.country, c.stage, c.dealValue, c.channel,
        c.source, c.campaign, c.businessType, c.properties, c.budget, c.objective,
        c.marketingConsent ? "yes" : "no", new Date(c.createdAt).toISOString(),
      ]
        .map(csvCell)
        .join(","),
    );
    return new NextResponse([header.join(","), ...lines].join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="stayr-contacts.csv"`,
      },
    });
  }

  return NextResponse.json({ ok: true, contacts });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = clean(body.email, 254).toLowerCase();
  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, error: "email" }, { status: 422 });
  }
  const existing = await query("SELECT id FROM contacts WHERE email = ?", [email]);
  if (existing[0]) {
    return NextResponse.json({ ok: false, error: "exists", id: str(existing[0].id) }, { status: 409 });
  }

  const { contact } = await upsertContact({
    email,
    name: clean(body.name, 120),
    company: clean(body.company, 120),
    website: clean(body.website, 300),
    reach: "mql",
  });
  await addActivity(contact.id, "created", { by: "admin" });
  if (isStage(body.stage) && body.stage !== "mql") await setStage(contact, body.stage);
  return NextResponse.json({ ok: true, id: contact.id });
}
