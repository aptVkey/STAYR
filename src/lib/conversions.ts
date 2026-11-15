import "server-only";

import { createHash } from "node:crypto";
import { getTracking, type TrackingSettings } from "@/lib/settings";

/**
 * Server-side conversion events: Meta Conversions API and TikTok Events API.
 *
 * Sent only when the visitor granted advertising consent. Each event carries
 * the same `eventId` the browser pixel used, so the platforms de-duplicate.
 * The lead's email is included (SHA-256 hashed) only when "advanced
 * matching" is switched on in the admin.
 */

export type ConversionName = "lead" | "application" | "schedule" | "purchase";

const META_EVENT: Record<ConversionName, string> = {
  lead: "Lead",
  application: "SubmitApplication",
  schedule: "Schedule",
  purchase: "Purchase",
};
const TIKTOK_EVENT: Record<ConversionName, string> = {
  lead: "Lead",
  application: "SubmitApplication",
  schedule: "Schedule",
  purchase: "Purchase",
};

export type ConversionContext = {
  eventId: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  fbp?: string;
  fbc?: string;
  ttp?: string;
  ttclid?: string;
  /** For purchases: deal value in EUR. */
  value?: number;
  /** "website" for browser-originated events, "system_generated" for CRM updates. */
  source?: "website" | "system_generated";
  eventTime?: number;
};

export type SendResult = { platform: "meta" | "tiktok"; ok: boolean; status: number; detail: string };

const sha256 = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

const META_API = "https://graph.facebook.com/v23.0";
const TIKTOK_API = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

async function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  const detail = (await response.text()).slice(0, 600);
  return { status: response.status, ok: response.ok, detail };
}

export async function sendMeta(
  settings: TrackingSettings,
  name: ConversionName,
  ctx: ConversionContext,
): Promise<SendResult | null> {
  const { pixelId, capiToken, testEventCode } = settings.meta;
  if (!pixelId || !capiToken) return null;

  const userData: Record<string, unknown> = {};
  if (ctx.ip) userData.client_ip_address = ctx.ip;
  if (ctx.userAgent) userData.client_user_agent = ctx.userAgent;
  if (ctx.fbp) userData.fbp = ctx.fbp;
  if (ctx.fbc) userData.fbc = ctx.fbc;
  if (settings.advancedMatching && ctx.email) userData.em = [sha256(ctx.email)];

  const event: Record<string, unknown> = {
    event_name: META_EVENT[name],
    event_time: Math.floor((ctx.eventTime ?? Date.now()) / 1000),
    event_id: ctx.eventId,
    action_source: ctx.source ?? "website",
    user_data: userData,
  };
  if (ctx.url) event.event_source_url = ctx.url;
  if (name === "purchase") event.custom_data = { currency: "EUR", value: ctx.value ?? 0 };

  try {
    const result = await post(`${META_API}/${pixelId}/events`, {
      data: [event],
      access_token: capiToken,
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
    });
    return { platform: "meta", ...result };
  } catch (error) {
    return { platform: "meta", ok: false, status: 0, detail: String(error) };
  }
}

export async function sendTikTok(
  settings: TrackingSettings,
  name: ConversionName,
  ctx: ConversionContext,
): Promise<SendResult | null> {
  const { pixelId, eventsToken, testEventCode } = settings.tiktok;
  if (!pixelId || !eventsToken) return null;

  const user: Record<string, unknown> = {};
  if (ctx.ip) user.ip = ctx.ip;
  if (ctx.userAgent) user.user_agent = ctx.userAgent;
  if (ctx.ttp) user.ttp = ctx.ttp;
  if (ctx.ttclid) user.ttclid = ctx.ttclid;
  if (settings.advancedMatching && ctx.email) user.email = sha256(ctx.email);

  const event: Record<string, unknown> = {
    event: TIKTOK_EVENT[name],
    event_time: Math.floor((ctx.eventTime ?? Date.now()) / 1000),
    event_id: ctx.eventId,
    user,
  };
  if (ctx.url) event.page = { url: ctx.url };
  if (name === "purchase") event.properties = { currency: "EUR", value: ctx.value ?? 0 };

  try {
    const result = await post(
      TIKTOK_API,
      {
        event_source: "web",
        event_source_id: pixelId,
        data: [event],
        ...(testEventCode ? { test_event_code: testEventCode } : {}),
      },
      { "Access-Token": eventsToken },
    );
    // TikTok answers 200 with an error code in the body.
    let ok = result.ok;
    try {
      ok = ok && (JSON.parse(result.detail) as { code?: number }).code === 0;
    } catch {
      ok = false;
    }
    return { platform: "tiktok", ...result, ok };
  } catch (error) {
    return { platform: "tiktok", ok: false, status: 0, detail: String(error) };
  }
}

/** Fire a conversion to every configured platform. Never throws. */
export async function sendConversion(name: ConversionName, ctx: ConversionContext) {
  try {
    const settings = await getTracking();
    const results = await Promise.all([sendMeta(settings, name, ctx), sendTikTok(settings, name, ctx)]);
    for (const result of results) {
      if (result && !result.ok) {
        console.error(`[conversions] ${result.platform} ${name} failed (${result.status}): ${result.detail}`);
      }
    }
    return results.filter((r): r is SendResult => r !== null);
  } catch (error) {
    console.error("[conversions] could not send", name, error);
    return [];
  }
}

/* ── Reading the ad context a browser sends with a form ──────── */

const short = (value: unknown, pattern: RegExp, max = 300) => {
  const v = typeof value === "string" ? value.trim().slice(0, max) : "";
  return pattern.test(v) ? v : undefined;
};

export type AdContext = {
  consent: boolean;
  eventId: string;
  fbp?: string;
  fbc?: string;
  ttp?: string;
  url?: string;
};

/** Parse the `ad` object posted by the forms. Unknown input → no consent. */
export function parseAdContext(value: unknown): AdContext {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    consent: raw.consent === true,
    eventId: short(raw.eventId, /^[A-Za-z0-9-]{8,64}$/) ?? crypto.randomUUID(),
    fbp: short(raw.fbp, /^fb\.\d\.\d+\.\d+$/),
    fbc: short(raw.fbc, /^fb\.\d\.\d+\.[A-Za-z0-9_-]+$/),
    ttp: short(raw.ttp, /^[A-Za-z0-9_-]{8,80}$/),
    url: short(raw.url, /^https?:\/\/[^\s?#]+$/),
  };
}

export function requestMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ip: forwarded || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent")?.slice(0, 400) || undefined,
  };
}
