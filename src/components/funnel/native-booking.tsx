"use client";

import { ArrowLeft, CalendarPlus, Check, CircleAlert, LoaderCircle, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { buttonClass, ButtonInner } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { content } from "@/content";
import { adContext, newEventId, track } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { cn } from "@/lib/cn";

const t = content.vsl.booking.native;
const v = content.validation;

type Day = { date: string; slots: number[] };
type Loaded = { state: "loading" | "error" | "ready"; days: Day[]; durationMin: number };
type Confirmed = { start: number; end: number; meetingLink: string };

const localTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const fmt = (instant: number, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", options).format(new Date(instant));

/** Group UTC slots by the visitor's own calendar day. */
function byLocalDay(days: Day[]) {
  const groups = new Map<string, number[]>();
  for (const slot of days.flatMap((day) => day.slots)) {
    const key = fmt(slot, { year: "numeric", month: "2-digit", day: "2-digit" });
    groups.set(key, [...(groups.get(key) ?? []), slot]);
  }
  return [...groups.values()];
}

const icsStamp = (instant: number) =>
  new Date(instant).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function icsHref(booking: Confirmed) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//STAYR//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.start}@stayr`,
    `DTSTAMP:${icsStamp(booking.start)}`,
    `DTSTART:${icsStamp(booking.start)}`,
    `DTEND:${icsStamp(booking.end)}`,
    `SUMMARY:${t.calendarTitle}`,
    ...(booking.meetingLink ? [`LOCATION:${booking.meetingLink}`, `URL:${booking.meetingLink}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

/**
 * Built-in strategy-call scheduler. Availability and the booking itself are
 * handled by /api/booking; `strategy_call_confirmed` fires only once the
 * server has stored the booking.
 */
export function NativeBooking({ placement }: { placement: string }) {
  const uid = useId();
  const [data, setData] = useState<Loaded>({ state: "loading", days: [], durationMin: 30 });
  const [reload, setReload] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [step, setStep] = useState<"pick" | "details">("pick");
  const [values, setValues] = useState({ name: "", email: "", company: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [hp, setHp] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/booking/slots", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("unavailable"))))
      .then((json: { days: Day[]; durationMin: number }) => {
        if (!cancelled) setData({ state: "ready", days: json.days ?? [], durationMin: json.durationMin ?? 30 });
      })
      .catch(() => {
        if (!cancelled) setData({ state: "error", days: [], durationMin: 30 });
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const days = useMemo(() => byLocalDay(data.days), [data.days]);
  const [tz] = useState(localTz);
  const active = days[Math.min(dayIndex, Math.max(days.length - 1, 0))] ?? [];

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || slot === null) return;

    const input = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      company: values.company.trim(),
      notes: values.notes.trim(),
    };
    const found: Record<string, string> = {};
    if (!input.name) found.name = v.required;
    if (!input.email) found.email = v.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) found.email = v.email;
    if (!input.company) found.company = v.required;
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }

    setBusy(true);
    setFormError(null);
    const eventId = newEventId();
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...input,
          start: slot,
          timezone: tz,
          placement,
          hp,
          attribution: getAttribution(),
          ad: adContext(eventId),
        }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        booking?: Confirmed;
      };
      if (!response.ok || !json.ok || !json.booking) {
        if (json.error === "slot_taken") {
          setFormError(t.slotTaken);
          setSlot(null);
          setStep("pick");
          setReload((n) => n + 1);
        } else {
          setFormError(t.error);
        }
        return;
      }
      setConfirmed(json.booking);
      // A stored booking is the confirmation.
      track("strategy_call_confirmed", { placement }, { once: true, eventId });
    } catch {
      setFormError(t.error);
    } finally {
      setBusy(false);
    }
  };

  if (confirmed) {
    return (
      <div className="bg-ink p-6 ring-1 ring-lime/40 sm:p-9" role="status">
        <p className="type-eyebrow flex items-center gap-3 text-lime">
          <span className="grid size-5 place-items-center rounded-full bg-lime text-ink">
            <Check className="size-3" strokeWidth={2.5} aria-hidden />
          </span>
          {t.doneEyebrow}
        </p>
        <p className="mt-6 text-[1.75rem] font-medium leading-tight tracking-[-0.035em]">{t.doneTitle}</p>
        <p className="mt-4 text-[1.125rem] tracking-[-0.01em]">
          {fmt(confirmed.start, { weekday: "long", day: "numeric", month: "long" })}
          <span className="text-mute"> · </span>
          {fmt(confirmed.start, { hour: "2-digit", minute: "2-digit" })}–
          {fmt(confirmed.end, { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="mt-1 font-mono text-[0.75rem] text-mute">{tz}</p>
        <p className="mt-5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-paper/75">{t.doneBody}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href={icsHref(confirmed)} download="stayr-strategy-call.ics" className={buttonClass("lime", "md")}>
            <ButtonInner variant="lime" size="md" icon={<CalendarPlus className="size-4" strokeWidth={1.75} />}>
              {t.addToCalendar}
            </ButtonInner>
          </a>
          {confirmed.meetingLink && (
            <a
              href={confirmed.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[0.9375rem] text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper"
            >
              <Video className="size-4" aria-hidden />
              {t.joinLink}
            </a>
          )}
        </div>
      </div>
    );
  }

  if (data.state !== "ready" || days.length === 0) {
    return (
      <div className="bg-ink p-6 ring-1 ring-paper/12 sm:p-9">
        <p className="flex items-center gap-3 text-[0.9375rem] text-paper/75" role="status">
          {data.state === "loading" && <LoaderCircle className="size-4 animate-spin text-lime" aria-hidden />}
          {data.state === "loading" ? t.loading : data.state === "error" ? t.unavailable : t.none}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-ink p-6 ring-1 ring-paper/12 sm:p-9">
      {step === "pick" ? (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="type-eyebrow text-lime">{t.pickDay}</p>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-mute">
              {data.durationMin} {t.duration}
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label={t.pickDay}
            className="-mx-6 mt-5 flex gap-2 overflow-x-auto px-6 pb-2 pt-px sm:-mx-9 sm:px-9"
          >
            {days.map((slots, i) => {
              const selected = i === dayIndex;
              return (
                <button
                  key={slots[0]}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setDayIndex(i);
                    setSlot(null);
                  }}
                  className={cn(
                    "flex w-[4.25rem] shrink-0 flex-col items-center rounded-md py-3 ring-1 transition-colors",
                    selected ? "bg-lime text-ink ring-lime" : "ring-paper/15 hover:ring-paper/45",
                  )}
                >
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] opacity-70">
                    {fmt(slots[0], { weekday: "short" })}
                  </span>
                  <span className="mt-1 text-[1.375rem] font-medium leading-none tracking-[-0.04em]">
                    {fmt(slots[0], { day: "numeric" })}
                  </span>
                  <span className="mt-1 text-[0.6875rem] opacity-70">{fmt(slots[0], { month: "short" })}</span>
                </button>
              );
            })}
          </div>

          <p className="type-eyebrow mt-7 text-lime">{t.pickTime}</p>
          <div role="radiogroup" aria-label={t.pickTime} className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {active.map((start) => {
              const selected = slot === start;
              return (
                <button
                  key={start}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSlot(start)}
                  className={cn(
                    "h-11 rounded-md text-[0.9375rem] tabular-nums ring-1 transition-colors",
                    selected ? "bg-lime font-medium text-ink ring-lime" : "ring-paper/15 hover:ring-paper/45",
                  )}
                >
                  {fmt(start, { hour: "2-digit", minute: "2-digit" })}
                </button>
              );
            })}
          </div>
          <p className="mt-4 font-mono text-[0.6875rem] text-mute">
            {t.timezone} {tz}
          </p>

          <div aria-live="polite">
            {formError && (
              <p className="mt-5 flex items-start gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger ring-1 ring-danger/25">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {formError}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={slot === null}
            onClick={() => {
              setFormError(null);
              setStep("details");
              track("strategy_call_click", { placement }, { once: true });
            }}
            className={buttonClass("lime", "lg", "mt-7")}
          >
            <ButtonInner variant="lime">{t.continue}</ButtonInner>
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <button
            type="button"
            onClick={() => setStep("pick")}
            className="inline-flex items-center gap-2 text-[0.8125rem] text-mute transition-colors hover:text-paper"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t.back}
          </button>
          {slot !== null && (
            <p className="mt-4 text-[1.25rem] font-medium tracking-[-0.03em]">
              {fmt(slot, { weekday: "long", day: "numeric", month: "long" })}
              <span className="text-mute"> · </span>
              {fmt(slot, { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <p className="type-eyebrow mb-5 mt-7 text-lime">{t.detailsTitle}</p>

          <div className="absolute -left-[9999px] size-px overflow-hidden" aria-hidden>
            <label>
              Leave this field empty
              <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
            </label>
          </div>

          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <Field id={`${uid}-name`} label={t.name} error={errors.name}>
              <TextInput
                id={`${uid}-name`}
                autoComplete="name"
                value={values.name}
                error={Boolean(errors.name)}
                disabled={busy}
                required
                onChange={(e) => setValues((s) => ({ ...s, name: e.target.value }))}
              />
            </Field>
            <Field id={`${uid}-email`} label={t.email} error={errors.email}>
              <TextInput
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={values.email}
                error={Boolean(errors.email)}
                disabled={busy}
                required
                onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
              />
            </Field>
            <Field id={`${uid}-company`} label={t.company} error={errors.company}>
              <TextInput
                id={`${uid}-company`}
                autoComplete="organization"
                value={values.company}
                error={Boolean(errors.company)}
                disabled={busy}
                required
                onChange={(e) => setValues((s) => ({ ...s, company: e.target.value }))}
              />
            </Field>
            <Field id={`${uid}-notes`} label={t.notes} optional={t.optional}>
              <TextInput
                id={`${uid}-notes`}
                maxLength={1000}
                value={values.notes}
                disabled={busy}
                onChange={(e) => setValues((s) => ({ ...s, notes: e.target.value }))}
              />
            </Field>
          </div>

          <div aria-live="polite">
            {formError && (
              <p className="mb-4 flex items-start gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger ring-1 ring-danger/25">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {formError}
              </p>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" disabled={busy} className={buttonClass("lime", "lg")}>
              <ButtonInner
                variant="lime"
                icon={busy ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
              >
                {busy ? t.confirming : t.confirm}
              </ButtonInner>
            </button>
            <p className="max-w-[36ch] text-[0.75rem] leading-relaxed text-mute">
              {t.privacy}{" "}
              <Link
                href="/privacy"
                className="text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper"
              >
                {content.consent.link}
              </Link>
              .
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
