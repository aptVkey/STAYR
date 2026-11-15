"use client";

/**
 * Funnel analytics.
 *
 *  - Built-in analytics: page views and funnel events go to our own
 *    cookieless collector (/api/collect) — event name and page only.
 *  - Third-party tags are consent-gated: nothing loads or is sent to Google,
 *    Meta or TikTok until the visitor accepts. Events fired before a decision
 *    are held in memory and flushed on acceptance, or dropped on decline.
 *  - No personal identifiers: params are filtered against a deny-list before
 *    leaving this module.
 *  - De-duplicated: `once` events fire a single time per page load.
 *  - Single source of truth: when GTM is configured only the dataLayer is
 *    used; otherwise GA4 / Google Ads / Meta / TikTok are called directly.
 *  - Tag IDs come from the admin (see src/lib/runtime-config.ts).
 */

import { getAttribution } from "@/lib/attribution";
import {
  getRuntimeConfig,
  hasTags,
  onRuntimeConfig,
  type RuntimeConfig,
} from "@/lib/runtime-config";

export type FunnelEvent =
  | "homepage_view"
  | "hero_cta_click"
  | "optin_modal_open"
  | "optin_submit"
  | "case_study_view"
  | "vsl_play"
  | "vsl_25_percent"
  | "vsl_50_percent"
  | "vsl_75_percent"
  | "vsl_complete"
  | "application_start"
  | "application_submit"
  | "strategy_call_click"
  | "strategy_call_confirmed";

export type ConsentState = "unknown" | "granted" | "denied";

type Params = Record<string, string | number | boolean | undefined>;
type Queued = { name: FunnelEvent; params: Params; eventId?: string };

type Stub = ((...args: unknown[]) => void) & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Stub;
    _fbq?: Stub;
    ttq?: Stub & unknown[];
    TiktokAnalyticsObject?: string;
  }
}

const CONSENT_KEY = "stayr_consent_v1";
const PII_KEYS =
  /^(e-?mail|name|first_?name|last_?name|full_?name|phone|company|website|url|message|address|ip)$/i;

let consent: ConsentState = "unknown";
const queue: Queued[] = [];
const fired = new Set<string>();
const listeners = new Set<(state: ConsentState) => void>();
let tagsLoaded = false;

const isDev = process.env.NODE_ENV !== "production";

function sanitize(params: Params): Params {
  const out: Params = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || PII_KEYS.test(key)) continue;
    // Defensive: never forward anything that looks like an email address.
    if (typeof value === "string" && /@.+\./.test(value)) continue;
    out[key] = value;
  }
  return out;
}

/* ── First-party collector (cookieless, no consent needed) ───── */

const COLLECTED = new Set<string>([
  "hero_cta_click",
  "optin_modal_open",
  "optin_submit",
  "vsl_play",
  "vsl_25_percent",
  "vsl_50_percent",
  "vsl_75_percent",
  "vsl_complete",
  "application_start",
  "application_submit",
  "strategy_call_click",
  "strategy_call_confirmed",
]);

function collect(type: string, placement?: string) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return;
  const body = JSON.stringify({ type, path, placement, attribution: getAttribution() });
  try {
    if (navigator.sendBeacon?.("/api/collect", body)) return;
  } catch {
    /* fall through to fetch */
  }
  void fetch("/api/collect", { method: "POST", body, keepalive: true }).catch(() => undefined);
}

let lastPageview = "";

/** Record a page view in the built-in analytics, once per route visit. */
export function trackPageview() {
  if (typeof window === "undefined" || lastPageview === window.location.pathname) return;
  lastPageview = window.location.pathname;
  collect("pageview");
}

/* ── Third-party tags (loaded only after consent) ────────────── */

const script = (src: string) => {
  const el = document.createElement("script");
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
};

function loadTags(c: RuntimeConfig) {
  if (tagsLoaded || !hasTags(c)) return;
  tagsLoaded = true;
  window.dataLayer = window.dataLayer || [];

  if (c.gtmId) {
    // GTM owns every tag: nothing else is loaded directly.
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    script(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(c.gtmId)}`);
    return;
  }

  const gtagId = c.ga4Id || c.googleAdsId;
  if (gtagId) {
    window.gtag = function gtag() {
      // gtag.js expects the raw `arguments` object in the dataLayer.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("consent", "default", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    if (c.ga4Id) window.gtag("config", c.ga4Id);
    if (c.googleAdsId) window.gtag("config", c.googleAdsId);
    script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`);
  }

  if (c.metaPixelId && !window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) (fbq.callMethod as (...a: unknown[]) => void)(...args);
      else (fbq.queue as unknown[]).push(args);
    } as Stub;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    script("https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", c.metaPixelId);
    fbq("track", "PageView");
  }

  if (c.tiktokPixelId && !window.ttq) {
    window.TiktokAnalyticsObject = "ttq";
    const ttq = [] as unknown as Stub & unknown[];
    for (const method of ["page", "track", "identify", "load"]) {
      ttq[method] = (...args: unknown[]) => {
        ttq.push([method, ...args]);
      };
    }
    ttq._i = { [c.tiktokPixelId]: [] };
    ttq._t = { [c.tiktokPixelId]: Date.now() };
    ttq._o = { [c.tiktokPixelId]: {} };
    window.ttq = ttq;
    script(
      `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(c.tiktokPixelId)}&lib=ttq`,
    );
    (ttq.page as () => void)();
  }
}

const META_STANDARD: Partial<Record<FunnelEvent, string>> = {
  optin_submit: "Lead",
  application_submit: "SubmitApplication",
  strategy_call_confirmed: "Schedule",
};
const TIKTOK_STANDARD: Partial<Record<FunnelEvent, string>> = {
  optin_submit: "Lead",
  application_submit: "SubmitApplication",
  strategy_call_confirmed: "Schedule",
  case_study_view: "ViewContent",
};

function dispatch({ name, params, eventId }: Queued) {
  const c = getRuntimeConfig();
  window.dataLayer = window.dataLayer || [];

  if (c.gtmId) {
    window.dataLayer.push({ event: name, ...params, ...(eventId ? { event_id: eventId } : {}) });
    return;
  }

  if (c.ga4Id && window.gtag) window.gtag("event", name, params);

  const adsLabel = c.googleAdsLabels[name];
  if (c.googleAdsId && adsLabel && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: `${c.googleAdsId}/${adsLabel}`,
      ...(eventId ? { transaction_id: eventId } : {}),
    });
  }

  if (c.metaPixelId && window.fbq) {
    const standard = META_STANDARD[name];
    // The shared eventID lets Meta de-duplicate against the server-side event.
    if (standard) window.fbq("track", standard, {}, eventId ? { eventID: eventId } : {});
    else window.fbq("trackCustom", name, params);
  }

  if (c.tiktokPixelId && window.ttq) {
    const standard = TIKTOK_STANDARD[name];
    if (standard) {
      (window.ttq.track as (...a: unknown[]) => void)(standard, {}, eventId ? { event_id: eventId } : {});
    }
  }
}

/** Load tags and flush held events once consent and configuration are both in. */
function flush() {
  const c = getRuntimeConfig();
  if (consent !== "granted" || !c.loaded) return;
  loadTags(c);
  queue.splice(0, queue.length).forEach(dispatch);
}

onRuntimeConfig(flush);

/** IDs the server needs to mirror a conversion through the platform APIs. */
export function adContext(eventId: string) {
  const cookie = (name: string) =>
    typeof document === "undefined"
      ? undefined
      : document.cookie
          .split("; ")
          .find((part) => part.startsWith(`${name}=`))
          ?.slice(name.length + 1);
  return {
    consent: consent === "granted",
    eventId,
    ...(consent === "granted"
      ? {
          fbp: cookie("_fbp"),
          fbc: cookie("_fbc"),
          ttp: cookie("_ttp"),
          url: `${window.location.origin}${window.location.pathname}`,
        }
      : {}),
  };
}

export const newEventId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

/**
 * Track a funnel event.
 * @param options.once fire at most once per page load (keyed by event name,
 *                     or by `options.key` when several variants exist).
 * @param options.eventId shared with the server-side conversion for de-duplication.
 */
export function track(
  name: FunnelEvent,
  params: Params = {},
  options: { once?: boolean; key?: string; eventId?: string } = {},
) {
  if (typeof window === "undefined") return;

  if (options.once) {
    const key = options.key ?? name;
    if (fired.has(key)) return;
    fired.add(key);
  }

  const safe = sanitize(params);

  if (isDev) {
    console.info(
      `%c[analytics]%c ${name}`,
      "color:#9bbf2f;font-weight:600",
      "color:inherit",
      safe,
      `(consent: ${consent})`,
    );
  }

  if (COLLECTED.has(name)) {
    collect(name, typeof safe.placement === "string" ? safe.placement : undefined);
  }

  if (consent === "denied") return;
  const config = getRuntimeConfig();
  if (config.loaded && !hasTags(config)) return;
  queue.push({ name, params: safe, eventId: options.eventId });
  flush();
}

export function getConsent(): ConsentState {
  return consent;
}

/** Read a stored decision. Call once on the client at start-up. */
export function loadStoredConsent(): ConsentState {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "granted" || stored === "denied") {
      applyConsent(stored, false);
    }
  } catch {
    /* storage unavailable — consent stays unknown for this visit */
  }
  return consent;
}

export function setConsent(state: Exclude<ConsentState, "unknown">) {
  applyConsent(state, true);
}

function applyConsent(
  state: Exclude<ConsentState, "unknown">,
  persist: boolean,
) {
  consent = state;
  if (persist) {
    try {
      window.localStorage.setItem(CONSENT_KEY, state);
    } catch {
      /* ignore */
    }
  }

  // Google Consent Mode v2 signal (no-op if gtag is not present).
  window.dataLayer = window.dataLayer || [];
  const value = state === "granted" ? "granted" : "denied";
  window.dataLayer.push([
    "consent",
    "update",
    {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    },
  ]);
  window.gtag?.("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });

  if (state === "granted") flush();
  else queue.length = 0;

  listeners.forEach((fn) => fn(state));
}

export function onConsentChange(fn: (state: ConsentState) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
