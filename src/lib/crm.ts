import "server-only";

import { randomUUID } from "node:crypto";
import { classifyTraffic } from "@/lib/channels";
import { batch, num, query, run, str, type Row } from "@/lib/db";

/**
 * CRM: contacts, pipeline stage and an activity timeline.
 *
 *   mql       opted in to the case study or applied
 *   sql       booked a strategy call
 *   customer  closed (set by you in the admin)
 *   lost      closed-lost (set by you in the admin)
 */

export const STAGES = ["mql", "sql", "customer", "lost"] as const;
export type Stage = (typeof STAGES)[number];
export const isStage = (value: unknown): value is Stage => STAGES.includes(value as Stage);

export type ActivityType =
  | "optin"
  | "application"
  | "booking"
  | "booking_status"
  | "stage"
  | "note"
  | "created";

export type Contact = {
  id: string;
  email: string;
  name: string;
  company: string;
  website: string;
  country: string;
  businessType: string;
  properties: string;
  budget: string;
  objective: string;
  stage: Stage;
  dealValue: number;
  marketingConsent: boolean;
  adConsent: boolean;
  channel: string;
  source: string;
  campaign: string;
  attribution: Record<string, string>;
  createdAt: number;
  updatedAt: number;
  mqlAt: number | null;
  sqlAt: number | null;
  wonAt: number | null;
  lostAt: number | null;
};

const nullable = (value: unknown) => (value == null ? null : Number(value));

export function toContact(row: Row): Contact {
  let attribution: Record<string, string> = {};
  try {
    attribution = JSON.parse(str(row.attribution)) as Record<string, string>;
  } catch {
    /* keep empty */
  }
  return {
    id: str(row.id),
    email: str(row.email),
    name: str(row.name),
    company: str(row.company),
    website: str(row.website),
    country: str(row.country),
    businessType: str(row.business_type),
    properties: str(row.properties),
    budget: str(row.budget),
    objective: str(row.objective),
    stage: isStage(row.stage) ? row.stage : "mql",
    dealValue: num(row.deal_value),
    marketingConsent: num(row.marketing_consent) === 1,
    adConsent: num(row.ad_consent) === 1,
    channel: str(row.channel),
    source: str(row.source),
    campaign: str(row.campaign),
    attribution,
    createdAt: num(row.created_at),
    updatedAt: num(row.updated_at),
    mqlAt: nullable(row.mql_at),
    sqlAt: nullable(row.sql_at),
    wonAt: nullable(row.won_at),
    lostAt: nullable(row.lost_at),
  };
}

export async function addActivity(
  contactId: string,
  type: ActivityType,
  data: Record<string, unknown> = {},
  ts = Date.now(),
) {
  await run("INSERT INTO activities (contact_id, ts, type, data) VALUES (?, ?, ?, ?)", [
    contactId,
    ts,
    type,
    JSON.stringify(data),
  ]);
}

export type ContactInput = {
  email: string;
  name?: string;
  company?: string;
  website?: string;
  country?: string;
  businessType?: string;
  properties?: string;
  budget?: string;
  objective?: string;
  marketingConsent?: boolean;
  adConsent?: boolean;
  attribution?: Record<string, string>;
  /** Stage this touchpoint qualifies the contact for. Never demotes. */
  reach: "mql" | "sql";
};

const RANK: Record<Stage, number> = { lost: 0, mql: 1, sql: 2, customer: 3 };

/** Create the contact, or enrich the existing one with the same email. */
export async function upsertContact(input: ContactInput): Promise<{ contact: Contact; created: boolean }> {
  const now = Date.now();
  const email = input.email.trim().toLowerCase();
  const existing = (await query("SELECT * FROM contacts WHERE email = ?", [email]))[0];

  if (!existing) {
    const id = randomUUID();
    const traffic = classifyTraffic(input.attribution ?? {});
    await run(
      `INSERT INTO contacts (id, email, name, company, website, country, business_type, properties,
         budget, objective, stage, marketing_consent, ad_consent, channel, source, campaign,
         attribution, created_at, updated_at, mql_at, sql_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        email,
        input.name ?? "",
        input.company ?? "",
        input.website ?? "",
        input.country ?? "",
        input.businessType ?? "",
        input.properties ?? "",
        input.budget ?? "",
        input.objective ?? "",
        input.reach,
        input.marketingConsent ? 1 : 0,
        input.adConsent ? 1 : 0,
        traffic.channel,
        traffic.source,
        traffic.campaign,
        JSON.stringify(input.attribution ?? {}),
        now,
        now,
        now,
        input.reach === "sql" ? now : null,
      ],
    );
    const row = (await query("SELECT * FROM contacts WHERE id = ?", [id]))[0];
    return { contact: toContact(row), created: true };
  }

  const current = toContact(existing);
  // Public forms are unauthenticated: anyone can type someone else's email.
  // They may fill a blank field but never overwrite stored data; what each
  // submission said is kept on the timeline (see addActivity callers).
  const keep = (next: string | undefined, old: string) => old || next?.trim() || "";
  const advance = input.reach === "sql" && RANK[current.stage] < RANK.sql;
  const stage: Stage = advance ? "sql" : current.stage;

  await run(
    `UPDATE contacts SET name = ?, company = ?, website = ?, country = ?, business_type = ?,
       properties = ?, budget = ?, objective = ?, stage = ?, marketing_consent = ?, ad_consent = ?,
       updated_at = ?, sql_at = ?, lost_at = ?
     WHERE id = ?`,
    [
      keep(input.name, current.name),
      keep(input.company, current.company),
      keep(input.website, current.website),
      keep(input.country, current.country),
      keep(input.businessType, current.businessType),
      keep(input.properties, current.properties),
      keep(input.budget, current.budget),
      keep(input.objective, current.objective),
      stage,
      current.marketingConsent || input.marketingConsent ? 1 : 0,
      current.adConsent || input.adConsent ? 1 : 0,
      now,
      advance ? (current.sqlAt ?? now) : current.sqlAt,
      advance ? null : current.lostAt,
      current.id,
    ],
  );
  if (advance) await addActivity(current.id, "stage", { from: current.stage, to: "sql", by: "system" }, now);
  const row = (await query("SELECT * FROM contacts WHERE id = ?", [current.id]))[0];
  return { contact: toContact(row), created: false };
}

/** Move a contact to a stage (admin action) and keep the funnel timestamps coherent. */
export async function setStage(contact: Contact, stage: Stage) {
  if (contact.stage === stage) return;
  const now = Date.now();
  let { sqlAt, wonAt, lostAt } = contact;
  if (stage === "mql") {
    sqlAt = null;
    wonAt = null;
    lostAt = null;
  } else if (stage === "sql") {
    sqlAt ??= now;
    wonAt = null;
    lostAt = null;
  } else if (stage === "customer") {
    sqlAt ??= now;
    wonAt ??= now;
    lostAt = null;
  } else {
    wonAt = null;
    lostAt = now;
  }
  await run(
    "UPDATE contacts SET stage = ?, sql_at = ?, won_at = ?, lost_at = ?, updated_at = ? WHERE id = ?",
    [stage, sqlAt, wonAt, lostAt, now, contact.id],
  );
  await addActivity(contact.id, "stage", { from: contact.stage, to: stage, by: "admin" }, now);
}

export async function getContact(id: string) {
  const row = (await query("SELECT * FROM contacts WHERE id = ?", [id]))[0];
  return row ? toContact(row) : null;
}

export async function deleteContact(id: string) {
  await batch([
    { sql: "DELETE FROM activities WHERE contact_id = ?", args: [id] },
    { sql: "DELETE FROM bookings WHERE contact_id = ?", args: [id] },
    { sql: "DELETE FROM contacts WHERE id = ?", args: [id] },
  ]);
}
