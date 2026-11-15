import "server-only";

import { query, run, str } from "@/lib/db";

/**
 * Admin-managed settings, stored in the database.
 *
 * Public IDs (pixel / measurement IDs) are exposed to the browser through
 * /api/config. Access tokens never leave the server: the admin API only
 * reports whether one is saved.
 */

export type TrackingSettings = {
  meta: {
    pixelId: string;
    capiToken: string;
    testEventCode: string;
  };
  google: {
    gtmId: string;
    ga4Id: string;
    adsId: string;
    labelOptin: string;
    labelApplication: string;
    labelCall: string;
  };
  tiktok: {
    pixelId: string;
    eventsToken: string;
    testEventCode: string;
  };
  /** Send a SHA-256 hash of the lead's email with server-side events. */
  advancedMatching: boolean;
};

export type DayHours = Array<[string, string]>;

export type BookingSettings = {
  enabled: boolean;
  timezone: string;
  durationMin: number;
  bufferMin: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  /** Keyed by ISO weekday: 1 = Monday … 7 = Sunday. */
  weekly: Record<string, DayHours>;
  meetingLink: string;
};

const env = (name: string) => process.env[name]?.trim() ?? "";

const TRACKING_DEFAULTS = (): TrackingSettings => ({
  meta: { pixelId: env("NEXT_PUBLIC_META_PIXEL_ID"), capiToken: "", testEventCode: "" },
  google: {
    gtmId: env("NEXT_PUBLIC_GTM_ID"),
    ga4Id: env("NEXT_PUBLIC_GA4_ID"),
    adsId: env("NEXT_PUBLIC_GOOGLE_ADS_ID"),
    labelOptin: env("NEXT_PUBLIC_GOOGLE_ADS_LABEL_OPTIN"),
    labelApplication: env("NEXT_PUBLIC_GOOGLE_ADS_LABEL_APPLICATION"),
    labelCall: env("NEXT_PUBLIC_GOOGLE_ADS_LABEL_CALL"),
  },
  tiktok: { pixelId: "", eventsToken: "", testEventCode: "" },
  advancedMatching: false,
});

const WORKDAY: DayHours = [
  ["10:00", "12:30"],
  ["14:00", "17:30"],
];

export const BOOKING_DEFAULTS: BookingSettings = {
  enabled: true,
  timezone: "Europe/Lisbon",
  durationMin: 30,
  bufferMin: 15,
  minNoticeHours: 12,
  maxDaysAhead: 21,
  weekly: { "1": WORKDAY, "2": WORKDAY, "3": WORKDAY, "4": WORKDAY, "5": WORKDAY, "6": [], "7": [] },
  meetingLink: "",
};

async function read<T>(key: string): Promise<Partial<T>> {
  const rows = await query<{ value: string }>("SELECT value FROM settings WHERE key = ?", [key]);
  if (!rows[0]) return {};
  try {
    return JSON.parse(str(rows[0].value)) as Partial<T>;
  } catch {
    return {};
  }
}

async function write(key: string, value: unknown) {
  await run(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, JSON.stringify(value), Date.now()],
  );
}

export async function getTracking(): Promise<TrackingSettings> {
  const base = TRACKING_DEFAULTS();
  const saved = await read<TrackingSettings>("tracking");
  return {
    meta: { ...base.meta, ...saved.meta },
    google: { ...base.google, ...saved.google },
    tiktok: { ...base.tiktok, ...saved.tiktok },
    advancedMatching: saved.advancedMatching ?? base.advancedMatching,
  };
}

export const saveTracking = (value: TrackingSettings) => write("tracking", value);

export async function getBooking(): Promise<BookingSettings> {
  const saved = await read<BookingSettings>("booking");
  return { ...BOOKING_DEFAULTS, ...saved, weekly: { ...BOOKING_DEFAULTS.weekly, ...saved.weekly } };
}

export const saveBooking = (value: BookingSettings) => write("booking", value);

/** Admin sessions carry this number; raising it signs every session out. */
export async function getSessionVersion(): Promise<number> {
  const saved = await read<{ version: number }>("admin_session");
  return Number(saved.version) || 1;
}

export async function bumpSessionVersion() {
  await write("admin_session", { version: (await getSessionVersion()) + 1 });
}

/** Random per-install salt for the anonymous visitor hash. */
export async function getVisitorSalt(): Promise<string> {
  const saved = await read<{ salt: string }>("visitor_salt");
  if (saved.salt) return saved.salt;
  const salt = crypto.randomUUID() + crypto.randomUUID();
  await write("visitor_salt", { salt });
  return salt;
}

/* ── Sanitising admin input ──────────────────────────────────── */

const id = (value: unknown, pattern: RegExp, max = 40) => {
  const v = typeof value === "string" ? value.trim().slice(0, max) : "";
  return pattern.test(v) ? v : "";
};
const text = (value: unknown, max = 400) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/**
 * Merge admin input into the saved tracking settings. A blank token field
 * keeps the stored token; `clear*` flags remove it.
 */
export function mergeTracking(current: TrackingSettings, input: Record<string, unknown>): TrackingSettings {
  const meta = (input.meta ?? {}) as Record<string, unknown>;
  const google = (input.google ?? {}) as Record<string, unknown>;
  const tiktok = (input.tiktok ?? {}) as Record<string, unknown>;
  const token = (next: unknown, clear: unknown, existing: string) =>
    clear === true ? "" : text(next) || existing;

  return {
    meta: {
      pixelId: id(meta.pixelId, /^\d{5,20}$/),
      capiToken: token(meta.capiToken, meta.clearCapiToken, current.meta.capiToken),
      testEventCode: id(meta.testEventCode, /^[A-Za-z0-9_-]{1,40}$/),
    },
    google: {
      gtmId: id(google.gtmId, /^GTM-[A-Z0-9]{4,12}$/i).toUpperCase(),
      ga4Id: id(google.ga4Id, /^G-[A-Z0-9]{4,16}$/i).toUpperCase(),
      adsId: id(google.adsId, /^AW-\d{6,16}$/i).toUpperCase(),
      labelOptin: id(google.labelOptin, /^[A-Za-z0-9_-]{4,40}$/),
      labelApplication: id(google.labelApplication, /^[A-Za-z0-9_-]{4,40}$/),
      labelCall: id(google.labelCall, /^[A-Za-z0-9_-]{4,40}$/),
    },
    tiktok: {
      pixelId: id(tiktok.pixelId, /^[A-Z0-9]{10,30}$/i).toUpperCase(),
      eventsToken: token(tiktok.eventsToken, tiktok.clearEventsToken, current.tiktok.eventsToken),
      testEventCode: id(tiktok.testEventCode, /^[A-Za-z0-9_-]{1,40}$/),
    },
    advancedMatching: input.advancedMatching === true,
  };
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function sanitizeBooking(input: Record<string, unknown>): BookingSettings {
  const clamp = (value: unknown, min: number, max: number, fallback: number) => {
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  const d = BOOKING_DEFAULTS;

  let timezone = text(input.timezone, 60) || d.timezone;
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    timezone = d.timezone;
  }

  const weekly: Record<string, DayHours> = {};
  const raw = (input.weekly ?? {}) as Record<string, unknown>;
  for (const day of ["1", "2", "3", "4", "5", "6", "7"]) {
    const ranges = Array.isArray(raw[day]) ? (raw[day] as unknown[]) : [];
    weekly[day] = ranges
      .filter(
        (r): r is [string, string] =>
          Array.isArray(r) && TIME.test(String(r[0])) && TIME.test(String(r[1])) && String(r[0]) < String(r[1]),
      )
      .slice(0, 4)
      .map((r) => [r[0], r[1]]);
  }

  const link = text(input.meetingLink, 300);
  return {
    enabled: input.enabled !== false,
    timezone,
    durationMin: clamp(input.durationMin, 15, 120, d.durationMin),
    bufferMin: clamp(input.bufferMin, 0, 120, d.bufferMin),
    minNoticeHours: clamp(input.minNoticeHours, 0, 168, d.minNoticeHours),
    maxDaysAhead: clamp(input.maxDaysAhead, 1, 90, d.maxDaysAhead),
    weekly,
    meetingLink: /^https:\/\/\S+$/.test(link) ? link : "",
  };
}
