import "server-only";

import { randomUUID } from "node:crypto";
import { num, query, run, str } from "@/lib/db";
import type { BookingSettings } from "@/lib/settings";

/**
 * Native strategy-call scheduling: slot generation in the business time
 * zone, minus existing bookings (with a buffer) and the minimum notice.
 */

/** Offset (ms) of `timeZone` from UTC at the given instant. */
function tzOffset(instant: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** UTC instant of a wall-clock time in `timeZone`. */
export function zonedToUtc(date: string, time: string, timeZone: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - tzOffset(guess, timeZone);
  return guess - tzOffset(first, timeZone);
}

/** Calendar date (YYYY-MM-DD) of an instant in `timeZone`. */
export function dateInZone(instant: number, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(instant),
  );
}

const addDays = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

/** ISO weekday (1 = Monday … 7 = Sunday) of a calendar date. */
const weekday = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() || 7;
};

export type DaySlots = { date: string; slots: number[] };

export async function getAvailability(settings: BookingSettings, now = Date.now()): Promise<DaySlots[]> {
  if (!settings.enabled) return [];

  const duration = settings.durationMin * 60_000;
  const buffer = settings.bufferMin * 60_000;
  const earliest = now + settings.minNoticeHours * 3_600_000;
  const today = dateInZone(now, settings.timezone);
  const horizon = zonedToUtc(addDays(today, settings.maxDaysAhead + 1), "00:00", settings.timezone);

  const taken = (
    await query("SELECT start_ts, end_ts FROM bookings WHERE status = 'confirmed' AND end_ts > ? AND start_ts < ?", [
      now - buffer,
      horizon + buffer,
    ])
  ).map((row) => ({ start: num(row.start_ts) - buffer, end: num(row.end_ts) + buffer }));

  const days: DaySlots[] = [];
  for (let i = 0; i <= settings.maxDaysAhead; i++) {
    const date = addDays(today, i);
    const ranges = settings.weekly[String(weekday(date))] ?? [];
    const slots: number[] = [];
    for (const [from, to] of ranges) {
      const end = zonedToUtc(date, to, settings.timezone);
      for (let start = zonedToUtc(date, from, settings.timezone); start + duration <= end; start += duration) {
        if (start < earliest) continue;
        if (taken.some((b) => start < b.end && start + duration > b.start)) continue;
        slots.push(start);
      }
    }
    if (slots.length) days.push({ date, slots });
  }
  return days;
}

export type Booking = {
  id: string;
  contactId: string;
  start: number;
  end: number;
  status: "confirmed" | "completed" | "no_show" | "cancelled";
  visitorTz: string;
  notes: string;
  createdAt: number;
};

export const BOOKING_STATUSES = ["confirmed", "completed", "no_show", "cancelled"] as const;

export function toBooking(row: Record<string, unknown>): Booking {
  return {
    id: str(row.id),
    contactId: str(row.contact_id),
    start: num(row.start_ts),
    end: num(row.end_ts),
    status: str(row.status) as Booking["status"],
    visitorTz: str(row.visitor_tz),
    notes: str(row.notes),
    createdAt: num(row.created_at),
  };
}

export class SlotUnavailableError extends Error {}

/** Reserve a slot. Re-checks availability so two visitors cannot take the same time. */
export async function createBooking(
  settings: BookingSettings,
  input: { contactId: string; start: number; visitorTz: string; notes: string },
): Promise<Booking> {
  const days = await getAvailability(settings);
  if (!days.some((day) => day.slots.includes(input.start))) throw new SlotUnavailableError();

  const id = randomUUID();
  const now = Date.now();
  const end = input.start + settings.durationMin * 60_000;
  await run(
    `INSERT INTO bookings (id, contact_id, start_ts, end_ts, status, visitor_tz, notes, created_at)
     VALUES (?, ?, ?, ?, 'confirmed', ?, ?, ?)`,
    [id, input.contactId, input.start, end, input.visitorTz, input.notes, now],
  );
  return {
    id,
    contactId: input.contactId,
    start: input.start,
    end,
    status: "confirmed",
    visitorTz: input.visitorTz,
    notes: input.notes,
    createdAt: now,
  };
}
