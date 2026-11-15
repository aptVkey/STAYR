import "server-only";

import { createHmac } from "node:crypto";
import { addActivity, upsertContact } from "@/lib/crm";

/**
 * Lead delivery.
 *
 * Every form on the site produces a lead and hands it to `deliverLead`,
 * which stores it in the built-in CRM (see src/lib/crm.ts and src/lib/db.ts)
 * and records the touchpoint on the contact's timeline.
 *
 * If LEAD_WEBHOOK_URL is set, a copy is also POSTed there as JSON (Make,
 * Zapier, n8n, another CRM). The CRM is the source of truth: a failing
 * webhook is logged and never loses the lead.
 *
 * If the database cannot be written, delivery throws and the visitor is told
 * their details were not saved.
 */

export type LeadType = "case_study_optin" | "partnership_application";

export type LeadInput = {
  type: LeadType;
  fields: Record<string, string>;
  consent: {
    /** Separate, optional, unchecked-by-default marketing opt-in. */
    marketing: boolean;
    /** Advertising / analytics consent given in the cookie banner. */
    advertising: boolean;
    privacyNoticeVersion: string;
  };
  attribution: Record<string, string>;
  source: {
    /** Which CTA / page the submission came from. */
    placement: string;
    locale: string;
  };
};

export const PRIVACY_NOTICE_VERSION = "draft-2026-11";

async function forwardToWebhook(event: string, payload: unknown) {
  const url = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!url) return;
  const secret = process.env.LEAD_WEBHOOK_SECRET?.trim();
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-stayr-event": event,
  };
  if (secret) {
    headers["x-stayr-signature"] = createHmac("sha256", secret).update(body).digest("hex");
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) console.error(`[leads] webhook responded with ${response.status} for ${event}`);
  } catch (error) {
    console.error(`[leads] webhook failed for ${event}:`, error);
  }
}

/** Notify the optional webhook about something that happened in the funnel. */
export const notifyWebhook = forwardToWebhook;

export async function deliverLead(input: LeadInput): Promise<{ id: string; mode: "database" }> {
  const f = input.fields;
  const { contact } = await upsertContact({
    email: f.email,
    name: f.fullName || f.firstName,
    company: f.company,
    website: f.website,
    country: f.country,
    businessType: f.businessType,
    properties: f.properties,
    budget: f.budget,
    objective: f.objective,
    marketingConsent: input.consent.marketing,
    adConsent: input.consent.advertising,
    attribution: input.attribution,
    reach: "mql",
  });

  await addActivity(contact.id, input.type === "case_study_optin" ? "optin" : "application", {
    placement: input.source.placement,
    locale: input.source.locale,
    privacyNoticeVersion: input.consent.privacyNoticeVersion,
    marketingConsent: input.consent.marketing,
    ...(f.message ? { message: f.message } : {}),
    ...(input.type === "partnership_application"
      ? { budget: f.budget, objective: f.objective, properties: f.properties, businessType: f.businessType }
      : {}),
  });

  await forwardToWebhook(input.type, {
    id: contact.id,
    type: input.type,
    createdAt: new Date().toISOString(),
    fields: input.fields,
    consent: input.consent,
    attribution: input.attribution,
    source: input.source,
  });

  return { id: contact.id, mode: "database" };
}

/* ── Helpers shared by the API routes ────────────────────────── */

const ATTRIBUTION_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "ttclid",
  "msclkid",
  "landing_path",
  "referrer",
  "captured_at",
]);

/** Keep only known attribution keys with short string values. */
export function sanitizeAttribution(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!value || typeof value !== "object") return out;
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (ATTRIBUTION_KEYS.has(key) && typeof raw === "string" && raw) {
      out[key] = raw.slice(0, 300);
    }
  }
  return out;
}

/**
 * Best-effort, in-memory rate limit. Good enough to blunt accidental
 * double-submits and naive bots on a single instance; put a real limiter
 * (edge / WAF / Redis) in front of this for production traffic.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimited(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}
