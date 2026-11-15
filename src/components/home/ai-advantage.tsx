"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE, FadeUp, RevealLines } from "@/components/ui/reveal";
import { content } from "@/content";
import { cn } from "@/lib/cn";

const t = content.ai;

/** Connector curves from the idea (left, centre) to four outputs (right). */
const BRANCH_Y = [12.5, 37.5, 62.5, 87.5];

export function AiAdvantage() {
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = t.tabs[tab];

  const onTabKey = (event: KeyboardEvent, index: number) => {
    const last = t.tabs.length - 1;
    let next = index;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="ai" className="relative overflow-hidden bg-ink text-paper">
      <div className="shell py-24 lg:py-40">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Eyebrow index="05" className="text-mute">
              {t.eyebrow}
            </Eyebrow>
            <RevealLines
              lines={t.headline}
              accent={1}
              accentClassName="text-lime"
              className="type-h1 mt-8 text-balance"
            />
          </div>
          <FadeUp className="lg:col-span-4">
            <p className="max-w-[40ch] text-[1.0625rem] leading-relaxed text-paper/75">{t.body}</p>
          </FadeUp>
        </div>

        {/* One idea → many outputs */}
        <FadeUp className="mt-16 lg:mt-24">
          <div
            role="tablist"
            aria-label={t.eyebrow}
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
          >
            {t.tabs.map((item, i) => {
              const selected = i === tab;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[i] = node;
                  }}
                  role="tab"
                  type="button"
                  id={`ai-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls="ai-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(i)}
                  onKeyDown={(event) => onTabKey(event, i)}
                  className={cn(
                    "relative h-11 shrink-0 rounded-full px-5 text-[0.9375rem] transition-colors duration-300",
                    selected ? "text-ink" : "text-paper/70 ring-1 ring-inset ring-paper/15 hover:text-paper hover:ring-paper/40",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="ai-tab-pill"
                      className="absolute inset-0 rounded-full bg-lime"
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div
            id="ai-panel"
            role="tabpanel"
            aria-labelledby={`ai-tab-${current.id}`}
            className="mt-6 grid gap-6 bg-surface p-5 ring-1 ring-paper/10 sm:p-8 lg:grid-cols-[0.82fr_0.36fr_1.1fr] lg:gap-0 lg:p-12"
          >
            {/* The idea */}
            <div className="flex flex-col justify-center">
              <div className="relative bg-ink p-6 ring-1 ring-paper/12 sm:p-8">
                <span className="absolute -top-px left-6 h-0.5 w-10 bg-lime sm:left-8" aria-hidden />
                <p className="type-eyebrow text-mute">{t.ideaLabel}</p>
                <p className="accent-serif mt-6 text-[clamp(2rem,3.6vw,3.25rem)] leading-[0.98]">
                  “{t.idea}”
                </p>
                <p className="type-eyebrow mt-8 leading-relaxed text-paper/40">{t.ideaMeta}</p>
              </div>
            </div>

            {/* Connectors */}
            <div className="relative hidden lg:block" aria-hidden>
              {/* Revealed with a clip wipe: dash-based drawing does not survive
                  a stretched (non-uniform) viewBox. */}
              <motion.svg
                key={current.id}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 size-full"
                fill="none"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                {BRANCH_Y.map((y) => (
                  <path
                    key={y}
                    d={`M0,50 C55,50 45,${y} 100,${y}`}
                    stroke="var(--color-lime)"
                    strokeOpacity="0.7"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </motion.svg>
              <span className="type-eyebrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 py-1 text-mute">
                {t.becomes}
              </span>
            </div>
            <p className="type-eyebrow flex items-center gap-3 text-mute lg:hidden">
              <span className="h-6 w-px bg-lime" aria-hidden />
              {t.becomes} — {current.count}
            </p>

            {/* Outputs */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={current.id}
                className="grid gap-3 lg:grid-rows-4"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                {current.items.map((item, i) => (
                  <motion.li
                    key={item.tag}
                    className="flex flex-col justify-center bg-ink px-5 py-4 ring-1 ring-paper/10 lg:px-6"
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.18 + i * 0.07 }}
                  >
                    <p className="type-eyebrow text-lime/90">{item.tag}</p>
                    <p className="mt-2 text-[1.0625rem] leading-snug tracking-[-0.015em] text-paper/95">
                      {item.text}
                    </p>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
          <p className="mt-4 max-w-[80ch] font-mono text-[0.6875rem] leading-relaxed text-mute">
            {t.disclaimer}
          </p>
        </FadeUp>

        {/* Who decides what */}
        <FadeUp className="mt-16 lg:mt-24">
          <p className="type-eyebrow mb-6 text-mute">{t.workflowLabel}</p>
          <ol className="grid border-l border-paper/12 sm:grid-cols-5 sm:border-l-0 sm:border-t">
            {t.workflow.map((item, i) => {
              const human = item.by.includes("Operator");
              return (
                <li
                  key={item.step}
                  className="relative py-4 pl-6 sm:py-0 sm:pl-0 sm:pr-6 sm:pt-6"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-[0.3125rem] top-6 size-2.5 rounded-full sm:-top-[0.3125rem] sm:left-0",
                      human ? "bg-lime" : "bg-surface-2 ring-1 ring-paper/40",
                    )}
                  />
                  <p className="type-eyebrow text-paper/40">0{i + 1}</p>
                  <p className="mt-2 text-[1.0625rem] font-medium leading-tight tracking-[-0.02em]">
                    {item.step}
                  </p>
                  <p className={cn("mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em]", human ? "text-lime" : "text-mute")}>
                    {item.by}
                  </p>
                </li>
              );
            })}
          </ol>
        </FadeUp>
      </div>
    </section>
  );
}
