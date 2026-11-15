"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { DrawLine, EASE, FadeUp, RevealLines } from "@/components/ui/reveal";
import { content } from "@/content";

const t = content.problem;
const VIEWPORT = { once: true, margin: "0px 0px -18% 0px" } as const;

export function Problem() {
  return (
    <section id="problem" className="on-paper relative bg-paper text-ink">
      <div className="shell pb-20 pt-24 lg:pb-32 lg:pt-40">
        <Eyebrow index="01" className="text-slate">
          {t.eyebrow}
        </Eyebrow>

        <RevealLines
          lines={t.headline}
          accent={1}
          accentClassName="text-slate"
          className="type-h1 mt-8 max-w-[19ch] text-balance"
        />

        <div className="mt-16 grid gap-12 lg:mt-28 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <FadeUp className="lg:sticky lg:top-32">
              <p className="type-lead max-w-[36ch] text-ink/85">{t.intro}</p>
            </FadeUp>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <p className="type-eyebrow mb-6 text-slate">{t.challengesLabel}</p>
            <ol>
              {t.challenges.map((item, i) => (
                <li key={item.title}>
                  <DrawLine className="text-ink" delay={i * 0.05} />
                  <FadeUp
                    delay={i * 0.05}
                    className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-6 md:grid-cols-[4rem_1fr_1fr] md:gap-x-8 md:py-7"
                  >
                    <span className="type-eyebrow pt-1.5 text-slate">0{i + 1}</span>
                    <h3 className="text-[1.25rem] font-medium leading-[1.15] tracking-[-0.025em] md:text-[1.375rem]">
                      {item.title}
                    </h3>
                    <p className="col-start-2 mt-2 text-[0.9375rem] leading-relaxed text-slate md:col-start-3 md:mt-0.5">
                      {item.body}
                    </p>
                  </FadeUp>
                </li>
              ))}
            </ol>
            <DrawLine className="text-ink" />
          </div>
        </div>
      </div>

      {/* The contrast: what gets reported vs what gets banked */}
      <div className="shell pb-24 lg:pb-40">
        <div className="grid overflow-hidden md:grid-cols-2">
          {/* Old thinking */}
          <div className="bg-paper-2 p-6 sm:p-10 lg:p-14">
            <p className="type-eyebrow text-slate">{t.contrast.fromLabel}</p>
            <ul className="mt-8 lg:mt-12">
              {t.contrast.pairs.map((pair, i) => (
                <li
                  key={pair.from}
                  className="flex h-[4.25rem] items-center border-t border-ink/10 sm:h-24 lg:h-32"
                >
                  <span className="relative inline-block text-[clamp(1.5rem,3.6vw,3.5rem)] font-medium leading-none tracking-[-0.04em] text-ink/35">
                    {pair.from}
                    <motion.span
                      aria-hidden
                      className="absolute -inset-x-2 top-[54%] h-[0.06em] min-h-[2px] origin-left bg-ink/70"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={VIEWPORT}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.16 }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Performance thinking */}
          <div className="relative bg-ink p-6 text-paper sm:p-10 lg:p-14">
            <p className="type-eyebrow flex items-center gap-3 text-lime">
              <span className="size-1.5 rounded-full bg-lime" aria-hidden />
              {t.contrast.toLabel}
            </p>
            <ul className="mt-8 lg:mt-12">
              {t.contrast.pairs.map((pair, i) => (
                <motion.li
                  key={pair.to}
                  className="flex h-[4.25rem] items-center gap-4 overflow-hidden border-t border-paper/12 sm:h-24 lg:h-32"
                  initial="hide"
                  whileInView="show"
                  viewport={VIEWPORT}
                >
                  <motion.span
                    aria-hidden
                    className="hidden text-lime sm:block"
                    variants={{ hide: { x: -24, opacity: 0 }, show: { x: 0, opacity: 1 } }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.5 + i * 0.16 }}
                  >
                    <ArrowRight className="size-6 lg:size-8" strokeWidth={1.25} />
                  </motion.span>
                  <span className="block overflow-hidden py-2">
                    <motion.span
                      className="block text-[clamp(1.5rem,3.6vw,3.5rem)] font-medium leading-none tracking-[-0.04em]"
                      variants={{ hide: { y: "120%" }, show: { y: 0 } }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.55 + i * 0.16 }}
                    >
                      {pair.to}
                    </motion.span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
