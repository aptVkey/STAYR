"use client";

import { RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type CSSProperties } from "react";
import { OptinButton } from "@/components/funnel/optin-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE, FadeUp, RevealLines } from "@/components/ui/reveal";
import { content } from "@/content";
import { cn } from "@/lib/cn";
import {
  formatEuro,
  formatEuroPrecise,
  formatInt,
  formatPercent,
} from "@/lib/format";

const t = content.revenue;

/**
 * Illustrative acquisition model. Starting values are neutral examples the
 * visitor is expected to change — they are not benchmarks or client data.
 */
const DEFAULTS = {
  spend: 10000,
  cpc: 0.9,
  landingRate: 0.3,
  engineRate: 0.03,
  cancelRate: 0.18,
  bookingValue: 480,
};
type Model = typeof DEFAULTS;
type StageId = (typeof t.stages)[number]["id"];

const CONTROLS: Record<
  StageId,
  { key: keyof Model; min: number; max: number; step: number; format: (v: number) => string }
> = {
  investment: { key: "spend", min: 2000, max: 60000, step: 500, format: formatEuro },
  click: { key: "cpc", min: 0.2, max: 4, step: 0.05, format: formatEuroPrecise },
  landing: { key: "landingRate", min: 0.05, max: 0.7, step: 0.01, format: (v) => formatPercent(v, 0) },
  engine: { key: "engineRate", min: 0.005, max: 0.1, step: 0.0025, format: (v) => formatPercent(v, 2) },
  confirmed: { key: "cancelRate", min: 0, max: 0.5, step: 0.01, format: (v) => formatPercent(v, 0) },
  revenue: { key: "bookingValue", min: 100, max: 2500, step: 10, format: formatEuro },
};

function compute(m: Model) {
  const clicks = m.spend / m.cpc;
  const visits = clicks * m.landingRate;
  const bookings = visits * m.engineRate;
  const confirmed = bookings * (1 - m.cancelRate);
  const grossRevenue = bookings * m.bookingValue;
  const netRevenue = confirmed * m.bookingValue;
  return {
    clicks,
    visits,
    bookings,
    confirmed,
    netRevenue,
    conversionRate: clicks > 0 ? bookings / clicks : 0,
    costPerBooking: bookings > 0 ? m.spend / bookings : 0,
    cac: confirmed > 0 ? m.spend / confirmed : 0,
    contribution: netRevenue - m.spend,
    reportedRoas: grossRevenue / m.spend,
    netRoas: netRevenue / m.spend,
  };
}

export function Revenue() {
  const [model, setModel] = useState<Model>(DEFAULTS);
  const [active, setActive] = useState<StageId>("landing");
  const r = useMemo(() => compute(model), [model]);

  const activeIndex = t.stages.findIndex((stage) => stage.id === active);
  const stage = t.stages[activeIndex];
  const control = CONTROLS[active];
  const value = model[control.key];
  const fill = ((value - control.min) / (control.max - control.min)) * 100;
  const changed = (Object.keys(DEFAULTS) as Array<keyof Model>).some(
    (key) => model[key] !== DEFAULTS[key],
  );

  const stageValue: Record<StageId, string> = {
    investment: formatEuro(model.spend),
    click: `${formatInt(r.clicks)} ${t.units.clicks}`,
    landing: `${formatInt(r.visits)} ${t.units.visits}`,
    engine: `${formatInt(r.bookings)} ${t.units.bookings}`,
    confirmed: `${formatInt(r.confirmed)} ${t.units.confirmed}`,
    revenue: formatEuro(r.netRevenue),
  };

  const metrics: Array<{ label: string; note: string; value: string; tone?: "good" | "bad" }> = [
    { ...t.metrics.conversionRate, value: formatPercent(r.conversionRate, 2) },
    { ...t.metrics.costPerBooking, value: formatEuro(r.costPerBooking) },
    { ...t.metrics.revenue, value: formatEuro(r.netRevenue) },
    { ...t.metrics.cancellation, value: formatPercent(model.cancelRate, 0) },
    { ...t.metrics.cac, value: formatEuro(r.cac) },
    {
      ...t.metrics.contribution,
      value: formatEuro(r.contribution),
      tone: r.contribution >= 0 ? "good" : "bad",
    },
  ];

  return (
    <section id="economics" className="relative bg-ink text-paper">
      <div className="shell py-24 lg:py-40">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Eyebrow index="02" className="text-mute">
              {t.eyebrow}
            </Eyebrow>
            <RevealLines
              lines={t.headline}
              accent={1}
              accentClassName="text-lime"
              className="type-h1 mt-8"
            />
          </div>
          <FadeUp className="lg:col-span-4">
            <p className="type-lead max-w-[30ch] text-paper/80">{t.body}</p>
          </FadeUp>
        </div>

        {/* Journey rail */}
        <FadeUp className="mt-16 lg:mt-24">
          <p className="type-eyebrow mb-5 text-mute">{t.hint}</p>
          <ol className="grid grid-cols-2 border-l border-t border-paper/12 md:grid-cols-3 lg:grid-cols-6">
            {t.stages.map((item, i) => {
              const isActive = item.id === active;
              return (
                <li key={item.id} className="border-b border-r border-paper/12">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(item.id)}
                    className={cn(
                      "group relative flex h-full w-full flex-col p-4 text-left transition-colors duration-300 sm:p-5",
                      isActive ? "bg-surface" : "hover:bg-surface/50",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 top-0 h-0.5 origin-left bg-lime transition-transform duration-500 ease-(--ease-expo)",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "type-eyebrow transition-colors",
                          isActive ? "text-lime" : "text-mute",
                        )}
                      >
                        0{i + 1}
                      </span>
                      {i < t.stages.length - 1 && (
                        <span
                          aria-hidden
                          className="motion-decor flow-line h-px flex-1 text-paper/35"
                        />
                      )}
                    </span>
                    <span className="mt-6 text-[0.9375rem] font-medium tracking-[-0.01em] text-paper/90 sm:mt-10 sm:text-base">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 font-mono text-[0.8125rem] tabular-nums tracking-tight transition-colors",
                        isActive ? "text-lime" : "text-mute",
                      )}
                    >
                      {stageValue[item.id]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </FadeUp>

        {/* Lever + economics */}
        <div className="grid gap-px bg-paper/12 lg:grid-cols-12">
          <div className="flex flex-col bg-surface p-6 sm:p-9 lg:col-span-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="type-eyebrow text-lime">
                  0{activeIndex + 1} — {stage.label}
                </p>
                <p className="mt-5 min-h-[7.5em] text-[1.0625rem] leading-relaxed text-paper/85 sm:min-h-[6em] lg:min-h-[7.5em]">
                  {stage.insight}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-auto pt-8">
              <div className="flex items-end justify-between gap-4">
                <label htmlFor="model-lever" className="type-eyebrow max-w-[22ch] leading-relaxed text-mute">
                  {stage.control}
                </label>
                <output
                  htmlFor="model-lever"
                  className="font-mono text-[1.75rem] leading-none tabular-nums tracking-tight"
                >
                  {control.format(value)}
                </output>
              </div>
              <input
                id="model-lever"
                type="range"
                className="range mt-4"
                min={control.min}
                max={control.max}
                step={control.step}
                value={value}
                aria-valuetext={control.format(value)}
                style={{ "--fill": `${fill}%` } as CSSProperties}
                onChange={(event) =>
                  setModel((current) => ({
                    ...current,
                    [control.key]: Number(event.target.value),
                  }))
                }
              />
              <div className="mt-1 flex items-center justify-between font-mono text-[0.6875rem] text-mute">
                <span>{control.format(control.min)}</span>
                <button
                  type="button"
                  onClick={() => setModel(DEFAULTS)}
                  disabled={!changed}
                  className="flex items-center gap-1.5 uppercase tracking-[0.14em] transition-opacity hover:text-paper disabled:opacity-0"
                >
                  <RotateCcw className="size-3" aria-hidden />
                  Reset
                </button>
                <span>{control.format(control.max)}</span>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-paper/12 lg:col-span-7">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col bg-ink p-5 sm:p-7">
                <dt className="type-eyebrow leading-relaxed text-mute">{metric.label}</dt>
                <dd
                  className={cn(
                    "mt-auto pt-6 font-mono text-[clamp(1.5rem,2.6vw,2.5rem)] leading-none tabular-nums tracking-[-0.04em]",
                    metric.tone === "good" && "text-lime",
                    metric.tone === "bad" && "text-danger",
                  )}
                >
                  {metric.value}
                </dd>
                <dd className="mt-2 text-[0.75rem] leading-snug text-mute">{metric.note}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-4 font-mono text-[0.6875rem] leading-relaxed text-mute">
          {t.disclaimer}
        </p>

        {/* ROAS is not incrementality */}
        <FadeUp className="mt-16 grid gap-10 border-t border-paper/12 pt-10 lg:mt-24 lg:grid-cols-12 lg:pt-14">
          <div className="lg:col-span-6">
            <h3 className="type-h3 max-w-[18ch] text-balance">{t.roas.title}</h3>
            <p className="mt-5 max-w-[52ch] leading-relaxed text-mute">{t.roas.body}</p>
            <OptinButton placement="revenue" variant="outline" className="mt-8">
              {content.cta.methodology}
            </OptinButton>
          </div>

          <ol className="grid grid-cols-3 gap-3 self-end lg:col-span-6 lg:gap-4">
            {[
              { label: t.roas.reported, value: `${r.reportedRoas.toFixed(1)}×`, height: "100%", tone: "bg-paper/12" },
              {
                label: t.roas.net,
                value: `${r.netRoas.toFixed(1)}×`,
                height: `${Math.max(12, Math.min(100, (r.netRoas / r.reportedRoas) * 100))}%`,
                tone: "bg-lime/85",
              },
              { label: t.roas.incremental, value: "?", height: "46%", tone: "dashed" },
            ].map((bar) => (
              <li key={bar.label} className="flex flex-col">
                <div className="flex h-40 items-end lg:h-52" aria-hidden>
                  <div
                    className={cn(
                      "w-full transition-[height] duration-500 ease-(--ease-expo)",
                      bar.tone === "dashed"
                        ? "border border-dashed border-paper/35"
                        : bar.tone,
                    )}
                    style={{ height: bar.height }}
                  />
                </div>
                <p className="mt-4 font-mono text-[1.5rem] leading-none tabular-nums tracking-tight lg:text-[1.75rem]">
                  {bar.value}
                </p>
                <p className="mt-2 text-[0.75rem] leading-snug text-mute">
                  {bar.label}
                  {bar.tone === "dashed" && (
                    <span className="mt-0.5 block text-paper/70">{t.roas.incrementalValue}</span>
                  )}
                </p>
              </li>
            ))}
          </ol>
        </FadeUp>
      </div>
    </section>
  );
}
