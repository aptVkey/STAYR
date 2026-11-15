"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE, FadeUp, RevealLines } from "@/components/ui/reveal";
import { content } from "@/content";
import { cn } from "@/lib/cn";

const t = content.process;
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const spanLabel = ([from, to]: readonly number[]) =>
  `${t.monthLabel}s ${String(from).padStart(2, "0")}–${String(to).padStart(2, "0")}`;

export function Process() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const phase = t.phases[active];

  const onKey = (event: KeyboardEvent, index: number) => {
    const last = t.phases.length - 1;
    let next = index;
    if (event.key === "ArrowRight") next = Math.min(last, index + 1);
    else if (event.key === "ArrowLeft") next = Math.max(0, index - 1);
    else return;
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <section id="process" className="relative bg-surface text-paper">
      <div className="shell py-24 lg:py-40">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow index="07" className="text-mute">
              {t.eyebrow}
            </Eyebrow>
            <RevealLines
              lines={t.headline}
              accent={1}
              accentClassName="text-lime"
              className="type-h1 mt-8"
            />
          </div>
          <FadeUp className="lg:col-span-4 lg:col-start-9">
            <p className="text-[1.0625rem] leading-relaxed text-paper/75">{t.body}</p>
          </FadeUp>
        </div>

        {/* Desktop: interactive 12-month track */}
        <FadeUp className="mt-24 hidden lg:block">
          <div className="grid grid-cols-12" aria-hidden>
            {MONTHS.map((month) => {
              const inPhase = month >= phase.span[0] && month <= phase.span[1];
              return (
                <span
                  key={month}
                  className={cn(
                    "border-l border-paper/12 pb-3 pl-2 font-mono text-[0.6875rem] transition-colors duration-300",
                    inPhase ? "text-lime" : "text-paper/35",
                  )}
                >
                  {String(month).padStart(2, "0")}
                </span>
              );
            })}
          </div>

          <div role="tablist" aria-label={t.eyebrow} className="grid grid-cols-12 gap-y-0">
            {t.phases.map((item, i) => {
              const selected = i === active;
              return (
                <button
                  key={item.name}
                  ref={(node) => {
                    refs.current[i] = node;
                  }}
                  role="tab"
                  type="button"
                  id={`phase-tab-${i}`}
                  aria-selected={selected}
                  aria-controls="phase-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onKeyDown={(event) => onKey(event, i)}
                  style={{ gridColumn: `${item.span[0]} / ${item.span[1] + 1}` }}
                  className="group relative border-l border-paper/12 pb-8 pl-2 pr-3 pt-5 text-left"
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-paper/10" aria-hidden />
                  {selected && (
                    <motion.span
                      layoutId="phase-bar"
                      className="absolute inset-x-0 top-0 h-1 bg-lime"
                      transition={{ duration: 0.6, ease: EASE }}
                      aria-hidden
                    />
                  )}
                  <span className={cn("type-eyebrow transition-colors", selected ? "text-lime" : "text-mute")}>
                    Phase {item.index}
                  </span>
                  <span
                    className={cn(
                      "mt-3 block text-[clamp(1.5rem,2.3vw,2.25rem)] font-medium leading-none tracking-[-0.04em] transition-colors duration-300",
                      selected ? "text-paper" : "text-paper/40 group-hover:text-paper/80",
                    )}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="phase-panel"
            role="tabpanel"
            aria-labelledby={`phase-tab-${active}`}
            className="min-h-[15rem] bg-ink p-10 ring-1 ring-paper/10 xl:p-14"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={phase.name}
                className="grid grid-cols-12 gap-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div className="col-span-5">
                  <p className="type-eyebrow text-mute">{spanLabel(phase.span)}</p>
                  <p className="type-h3 mt-5 max-w-[22ch] text-balance">{phase.body}</p>
                </div>
                <div className="col-span-6 col-start-7">
                  <p className="type-eyebrow mb-4 text-mute">{t.focusLabel}</p>
                  <ul className="border-t border-paper/12">
                    {phase.focus.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-4 border-b border-paper/12 py-3.5 text-[1.0625rem] text-paper/90"
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-lime" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeUp>

        {/* Mobile: vertical timeline, everything visible */}
        <ol className="mt-14 border-l border-paper/15 lg:hidden">
          {t.phases.map((item, i) => (
            <li key={item.name} className="relative pb-10 pl-6 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[0.3125rem] top-1 size-2.5 rounded-full bg-lime ring-4 ring-surface"
              />
              <FadeUp delay={i * 0.04}>
                <p className="type-eyebrow text-lime">
                  Phase {item.index} <span className="text-mute">· {spanLabel(item.span)}</span>
                </p>
                <h3 className="mt-3 text-[1.75rem] font-medium leading-none tracking-[-0.04em]">
                  {item.name}
                </h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-paper/75">{item.body}</p>
                <ul className="mt-4 space-y-2 text-[0.9375rem] text-paper/85">
                  {item.focus.map((focus) => (
                    <li key={focus} className="flex gap-3">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-paper/50" aria-hidden />
                      {focus}
                    </li>
                  ))}
                </ul>
              </FadeUp>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-[70ch] font-mono text-[0.6875rem] leading-relaxed text-mute lg:mt-5">
          {t.note}
        </p>
      </div>
    </section>
  );
}
