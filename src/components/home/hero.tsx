"use client";

import { ArrowDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { OptinButton } from "@/components/funnel/optin-button";
import { buttonClass, ButtonInner } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE, FadeUp, RevealLines } from "@/components/ui/reveal";
import { images } from "@/config/images";
import { content } from "@/content";
import { track } from "@/lib/analytics";

const t = content.hero;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="grain relative flex h-svh min-h-[42rem] flex-col overflow-hidden bg-ink text-paper"
    >
      {/* Photography: slow settle on load, parallax on scroll */}
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.16, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ scale: { duration: 2.6, ease: EASE }, opacity: { duration: 1.2 } }}
        >
          <Image
            src={images.hero.src}
            alt={images.hero.alt}
            fill
            preload
            sizes="100vw"
            quality={90}
            className="object-cover"
            style={{ objectPosition: images.hero.position }}
          />
        </motion.div>
      </motion.div>

      {/* Legibility: weighted to the bottom-left where the type sits */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_2%,rgb(12_17_27/0.72)_34%,rgb(12_17_27/0.18)_66%,rgb(12_17_27/0.5)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_100%,rgb(12_17_27/0.75),transparent_60%)]"
      />

      <motion.div
        className="shell relative z-10 flex flex-1 flex-col justify-end pb-7 pt-28 lg:pb-10"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <FadeUp immediate delay={0.3}>
          <Eyebrow live className="text-paper/85">
            {t.eyebrow}
          </Eyebrow>
        </FadeUp>

        <RevealLines
          as="h1"
          immediate
          delay={0.45}
          lines={t.headline}
          accent={1}
          accentClassName="text-lime"
          className="type-hero mt-5 text-balance lg:mt-7"
        />

        <div className="mt-8 grid gap-8 border-t border-paper/15 pt-6 lg:mt-12 lg:grid-cols-12 lg:items-end lg:pt-8">
          <FadeUp immediate delay={0.95} className="lg:col-span-6">
            <p className="type-lead max-w-[34ch] text-paper/85">{t.body}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <OptinButton placement="hero">{content.cta.unlock}</OptinButton>
              <a
                href="#system"
                onClick={() => track("hero_cta_click", { cta: "explore_system" })}
                className={buttonClass("outline", "lg")}
              >
                <ButtonInner
                  variant="outline"
                  icon={<ArrowDown className="size-4" strokeWidth={1.75} />}
                >
                  {content.cta.explore}
                </ButtonInner>
              </a>
            </div>
          </FadeUp>

          <FadeUp
            immediate
            delay={1.1}
            className="hidden lg:col-span-4 lg:col-start-9 lg:block"
          >
            <ul className="space-y-1 text-right text-[1.0625rem] leading-snug tracking-[-0.01em] text-paper/90">
              {t.credibility.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="type-eyebrow mt-5 text-right text-paper/45">{t.markets}</p>
          </FadeUp>
        </div>

        {/* Mobile credibility line */}
        <FadeUp immediate delay={1.15} className="mt-6 lg:hidden">
          <p className="type-eyebrow leading-relaxed text-paper/55">
            {t.credibility.join(" ")}
          </p>
        </FadeUp>
      </motion.div>
    </section>
  );
}
