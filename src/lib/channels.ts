/**
 * Traffic channel classification, from campaign parameters, ad click IDs and
 * the referring host. Shared by the collector and the CRM.
 */

export const CHANNELS = [
  "Paid Social",
  "Paid Search",
  "Organic Search",
  "Organic Social",
  "Email",
  "Referral",
  "Direct",
] as const;
export type Channel = (typeof CHANNELS)[number];

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|baidu|brave)\./i;
const SOCIAL =
  /(^|\.)(facebook|instagram|fb|tiktok|linkedin|lnkd|youtube|youtu|twitter|x|t|pinterest|reddit|threads)\.[a-z.]+$/i;
const SOCIAL_SOURCE =
  /^(facebook|fb|instagram|ig|meta|tiktok|linkedin|youtube|twitter|x|pinterest|reddit|threads)$/i;
const PAID_MEDIUM = /^(cpc|ppc|paid|paidsocial|paid_social|paid-social|paidsearch|cpm|cpv|display|ads?)$/i;

export type TrafficInput = Partial<
  Record<
    | "utm_source"
    | "utm_medium"
    | "utm_campaign"
    | "gclid"
    | "gbraid"
    | "wbraid"
    | "fbclid"
    | "ttclid"
    | "msclkid"
    | "referrer",
    string
  >
>;

export function hostOf(referrer: string | undefined) {
  if (!referrer) return "";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function classifyTraffic(input: TrafficInput) {
  const source = (input.utm_source ?? "").trim().toLowerCase();
  const medium = (input.utm_medium ?? "").trim().toLowerCase();
  const campaign = (input.utm_campaign ?? "").trim();
  const host = hostOf(input.referrer);

  let channel: Channel = "Direct";
  let resolved = source || host;

  if (input.gclid || input.gbraid || input.wbraid || input.msclkid) {
    channel = "Paid Search";
    resolved ||= input.msclkid ? "bing" : "google";
  } else if (input.ttclid) {
    channel = "Paid Social";
    resolved ||= "tiktok";
  } else if (PAID_MEDIUM.test(medium)) {
    channel = SOCIAL_SOURCE.test(source) || medium.includes("social") ? "Paid Social" : "Paid Search";
  } else if (input.fbclid && (PAID_MEDIUM.test(medium) || !host)) {
    channel = "Paid Social";
    resolved ||= "facebook";
  } else if (medium === "email" || source === "newsletter") {
    channel = "Email";
  } else if (medium === "social" || SOCIAL_SOURCE.test(source) || SOCIAL.test(host)) {
    channel = "Organic Social";
  } else if (medium === "organic" || SEARCH.test(host)) {
    channel = "Organic Search";
  } else if (source || host) {
    channel = "Referral";
  }

  return {
    channel,
    source: resolved.slice(0, 80),
    medium: medium.slice(0, 40),
    campaign: campaign.slice(0, 120),
  };
}
