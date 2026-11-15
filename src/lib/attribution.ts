"use client";

/**
 * Campaign attribution.
 *
 * Captures UTM parameters and ad-platform click IDs from the landing URL and
 * keeps them for the browser session so they can be attached to a lead or
 * application at submission time. Attribution is sent to our own backend
 * with the form — it is never forwarded to analytics events.
 */

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  landing_path?: string;
  referrer?: string;
  captured_at?: string;
};

const KEY = "stayr_attribution_v1";
const PARAMS = [
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
] as const;

let memory: Attribution | null = null;

function read(): Attribution | null {
  if (memory) return memory;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) memory = JSON.parse(raw) as Attribution;
  } catch {
    /* ignore */
  }
  return memory;
}

function write(value: Attribution) {
  memory = value;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep in memory for this page */
  }
}

/** Call once per page load. Newer campaign parameters replace older ones. */
export function captureAttribution() {
  if (typeof window === "undefined") return;

  const search = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {};
  for (const key of PARAMS) {
    const value = search.get(key);
    if (value) fromUrl[key] = value.slice(0, 200);
  }

  const existing = read();
  const hasCampaign = Object.keys(fromUrl).length > 0;
  if (existing && !hasCampaign) return;

  let referrer: string | undefined;
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      // Only external referrers, and never their query strings.
      if (ref.host !== window.location.host) {
        referrer = `${ref.origin}${ref.pathname}`.slice(0, 300);
      }
    }
  } catch {
    /* ignore malformed referrers */
  }

  write({
    ...fromUrl,
    landing_path: window.location.pathname,
    referrer,
    captured_at: new Date().toISOString(),
  });
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  return read() ?? {};
}
