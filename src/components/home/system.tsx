"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  type MotionValue,
} from "motion/react";
import { useRef, useSyncExternalStore, type ComponentType } from "react";
import { OptinButton } from "@/components/funnel/optin-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp, RevealLines } from "@/components/ui/reveal";
import { content } from "@/content";
import { ConversionVisual, CreativeVisual, MediaVisual } from "./engine-visuals";

const t = content.system;
type EngineId = keyof typeof t.engines;
type Engine = {
  id: string;
  index: string;
  name: string;
  title: string;
  body: string;
  capabilities: string[];
};

const ORDER: EngineId[] = ["creative", "conversion", "media"];
const ENGINES: Array<Engine & { id: EngineId }> = ORDER.map((id) => ({ ...t.engines[id], id }));

const VISUALS: Record<EngineId, ComponentType<{ progress: MotionValue<number>; compact?: boolean }>> = {
  creative: CreativeVisual,
  conversion: ConversionVisual,
  media: MediaVisual,
};

const DESKTOP_QUERY = "(min-width: 1024px)";
function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(DESKTOP_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

/**
 * One engine. On desktop the chapter pins while its visual plays through
 * with scroll; on mobile the visual animates as it passes through the
 * viewport. With reduced motion the visual is shown in its final state.
 */
function Chapter({ engine, pinned }: { engine: Engine & { id: EngineId }; pinned: boolean }) {
  const chapterRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: pinProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: passProgress } = useScroll({
    target: visualRef,
    offset: ["start 0.92", "start 0.12"],
  });
  const smooth = useSpring(pinned ? pinProgress : passProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.35,
  });
  const complete = useMotionValue(1);
  const progress = reduce ? complete : smooth;

  const Visual = VISUALS[engine.id];

  return (
    <div ref={chapterRef} className="relative lg:h-[230vh]">
      <div className="shell lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
        <div className="grid w-full gap-10 py-14 lg:grid-cols-12 lg:gap-8 lg:py-0">
          {/* Copy */}
          <div className="relative lg:col-span-5 lg:pl-8">
            <motion.span
              aria-hidden
              className="absolute inset-y-0 left-0 hidden w-px origin-top bg-lime lg:block"
              style={{ scaleY: progress }}
            />
            <span aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-paper/10 lg:block" />

            <p className="type-eyebrow flex items-center gap-3 text-lime">
              <span>Engine {engine.index}</span>
              <span className="h-px w-8 bg-lime/50" aria-hidden />
              <span className="text-paper/70">{engine.name}</span>
            </p>
            <h3 className="type-h2 mt-6 max-w-[13ch] text-balance">{engine.title}</h3>
            <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-relaxed text-mute">
              {engine.body}
            </p>

            <p className="type-eyebrow mb-4 mt-10 text-paper/40">{t.capabilitiesLabel}</p>
            <ul className="grid grid-cols-1 gap-x-6 border-t border-paper/10 text-[0.875rem] text-paper/85 sm:grid-cols-2">
              {engine.capabilities.map((capability) => (
                <li
                  key={capability}
                  className="flex items-center gap-3 border-b border-paper/10 py-2.5"
                >
                  <span className="size-1 shrink-0 rounded-full bg-lime" aria-hidden />
                  {capability}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual stage */}
          <div className="lg:col-span-7">
            <div
              ref={visualRef}
              className="relative aspect-[4/5] w-full overflow-hidden bg-ink p-4 ring-1 ring-paper/10 sm:aspect-[5/4] sm:p-8 lg:aspect-auto lg:h-[min(76vh,44rem)]"
            >
              <Visual progress={progress} compact={!pinned} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function System() {
  const isDesktop = useIsDesktop();

  return (
    <section id="system" className="relative bg-surface text-paper">
      {/* Intro */}
      <div className="shell pb-10 pt-24 lg:pb-24 lg:pt-40">
        <Eyebrow index="03" className="text-mute">
          {t.eyebrow}
        </Eyebrow>
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
          <RevealLines
            lines={t.headline}
            accent={1}
            accentClassName="text-lime"
            className="type-hero lg:col-span-7"
          />
          <FadeUp className="lg:col-span-4 lg:col-start-9">
            <p className="type-lead text-paper/80">{t.body}</p>
            <ol className="mt-8 border-t border-paper/12">
              {ENGINES.map((engine) => (
                <li
                  key={engine.id}
                  className="flex items-baseline justify-between border-b border-paper/12 py-3"
                >
                  <span className="text-[1.0625rem] font-medium tracking-[-0.02em]">
                    {engine.name}
                  </span>
                  <span className="type-eyebrow text-mute">{engine.index}</span>
                </li>
              ))}
            </ol>
          </FadeUp>
        </div>
      </div>

      {/* Chapters — keyed so the scroll source resets when the layout switches */}
      {ENGINES.map((engine) => (
        <Chapter
          key={`${engine.id}-${isDesktop ? "pinned" : "flow"}`}
          engine={engine}
          pinned={isDesktop}
        />
      ))}

      {/* Closing statement */}
      <div className="shell pb-24 pt-16 lg:pb-40 lg:pt-32">
        <div className="border-t border-paper/12 pt-12 lg:pt-20">
          <RevealLines
            lines={t.closing}
            accent={1}
            accentClassName="text-lime"
            className="type-h1 max-w-[18ch] text-balance"
          />
          <FadeUp className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="type-lead max-w-[40ch] text-paper/75">{t.closingBody}</p>
            <OptinButton placement="system">{content.cta.unlock}</OptinButton>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
