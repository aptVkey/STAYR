"use client";

import { Lock, Play } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { OptinButton, OptinTrigger } from "@/components/funnel/optin-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Logo } from "@/components/ui/logo";
import { FadeUp, RevealLines } from "@/components/ui/reveal";
import { images } from "@/config/images";
import { content } from "@/content";

const t = content.caseStudy;

/**
 * The primary conversion section. The thumbnail and the button both open
 * the opt-in — nothing here links to the video directly.
 */
export function CaseStudyTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [28, 6]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.25, 1.04]);

  return (
    <section id="case-study" className="grain relative overflow-hidden bg-ink-deep text-paper">
      {/* A single restrained glow behind the film frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(217_255_112/0.09),transparent)]"
      />

      <div className="shell relative z-10 py-24 lg:py-40">
        <div className="flex flex-col items-center text-center">
          <Eyebrow live className="text-lime">
            {t.eyebrow}
          </Eyebrow>
          <RevealLines
            lines={t.headline}
            accent={1}
            accentClassName="text-lime"
            className="type-h1 mt-8 text-balance"
          />
          <FadeUp className="mt-8">
            <p className="type-lead mx-auto max-w-[52ch] text-paper/75">{t.body}</p>
          </FadeUp>
        </div>

        {/* Film frame */}
        <div ref={ref} className="mt-14 lg:mt-20">
          <motion.div style={{ scale }} className="origin-top will-change-transform">
            <OptinTrigger
              placement="case_study_thumbnail"
              aria-label={`${t.thumb.play} — ${t.thumb.locked}`}
              className="group relative block aspect-[4/5] w-full overflow-hidden bg-surface text-left sm:aspect-video"
            >
              <motion.span
                className="absolute inset-0 block overflow-hidden"
                style={{ borderRadius: radius }}
              >
                <motion.span className="absolute inset-0 block" style={{ scale: imageScale }}>
                  <Image
                    src={images.caseStudy.src}
                    alt=""
                    fill
                    sizes="(min-width: 1536px) 1440px, (min-width: 640px) 100vw, 190vw"
                    quality={90}
                    className="object-cover transition-transform duration-[1600ms] ease-(--ease-expo) group-hover:scale-[1.04]"
                    style={{ objectPosition: images.caseStudy.position }}
                  />
                </motion.span>
                <span className="absolute inset-0 bg-[linear-gradient(to_top,rgb(7_10_17/0.92)_0%,rgb(7_10_17/0.3)_45%,rgb(7_10_17/0.45)_100%)]" />

                {/* Top bar */}
                <span className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-8">
                  <Logo className="text-lg sm:text-xl" />
                  <span className="type-eyebrow flex items-center gap-2 rounded-full bg-ink-deep/65 px-3 py-2 backdrop-blur-sm">
                    <Lock className="size-3 text-lime" aria-hidden />
                    <span className="max-sm:hidden">{t.thumb.locked}</span>
                    <span className="sm:hidden">{t.thumb.meta}</span>
                  </span>
                </span>

                {/* Play */}
                <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center sm:size-28">
                  <span className="motion-decor ring-pulse absolute inset-0 rounded-full border border-lime/60" />
                  <span className="absolute inset-0 rounded-full bg-lime transition-transform duration-500 ease-(--ease-expo) group-hover:scale-110" />
                  <Play className="relative ml-1 size-7 fill-ink text-ink sm:size-9" aria-hidden />
                </span>

                {/* Title block */}
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 sm:p-8 lg:p-12">
                  <span className="block">
                    <span className="type-eyebrow block text-paper/60">{t.thumb.kicker}</span>
                    <span className="mt-3 block max-w-[16ch] text-[clamp(1.5rem,3.4vw,3.25rem)] font-medium leading-[0.98] tracking-[-0.04em]">
                      {t.thumb.title}
                    </span>
                  </span>
                  <span className="type-eyebrow hidden shrink-0 text-paper/60 sm:block">
                    {t.thumb.meta}
                  </span>
                </span>

                {/* Frame marks */}
                {["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "left-3 bottom-3 border-l border-b", "right-3 bottom-3 border-r border-b"].map(
                  (position) => (
                    <span
                      key={position}
                      aria-hidden
                      className={`absolute size-4 border-paper/40 ${position}`}
                    />
                  ),
                )}
              </motion.span>
            </OptinTrigger>
          </motion.div>
        </div>

        {/* What you'll learn + CTA */}
        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="type-eyebrow mb-6 text-mute">{t.learnLabel}</p>
            <ol className="border-t border-paper/12">
              {t.learn.map((item, i) => (
                <FadeUp key={item} delay={i * 0.06}>
                  <li className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-paper/12 py-5 sm:grid-cols-[5rem_1fr]">
                    <span className="font-mono text-[0.8125rem] text-lime">0{i + 1}</span>
                    <span className="text-[clamp(1.125rem,1.8vw,1.5rem)] leading-snug tracking-[-0.02em]">
                      {item}
                    </span>
                  </li>
                </FadeUp>
              ))}
            </ol>
          </div>

          <FadeUp className="flex flex-col justify-end lg:col-span-4 lg:col-start-9">
            <OptinButton placement="case_study_section" className="w-full sm:w-auto sm:self-start">
              {content.cta.unlockFree}
            </OptinButton>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-mute">{t.microcopy}</p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
