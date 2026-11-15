"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { OptinButton } from "@/components/funnel/optin-button";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp, RevealLines } from "@/components/ui/reveal";
import { images } from "@/config/images";
import { content } from "@/content";

const t = content.finalCta;

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-14%", "0%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);

  return (
    <section
      ref={ref}
      id="final"
      className="grain relative flex min-h-svh flex-col justify-end overflow-hidden bg-ink text-paper"
    >
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <Image
          src={images.finalCta.src}
          alt={images.finalCta.alt}
          fill
          sizes="100vw"
          quality={90}
          className="object-cover"
          style={{ objectPosition: images.finalCta.position }}
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_0%,rgb(12_17_27/0.78)_40%,rgb(12_17_27/0.35)_100%)]"
      />

      <div className="shell relative z-10 pb-12 pt-40 lg:pb-20">
        <Eyebrow live className="text-paper/80">
          {t.eyebrow}
        </Eyebrow>
        <RevealLines
          lines={t.headline}
          accent={2}
          accentClassName="text-lime"
          className="type-hero mt-7 text-balance"
        />
        <FadeUp className="mt-10 grid gap-8 border-t border-paper/15 pt-8 lg:grid-cols-12 lg:items-end">
          <p className="type-lead max-w-[36ch] text-paper/85 lg:col-span-5">{t.body}</p>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-7 lg:justify-end">
            <OptinButton placement="final_cta">{content.cta.unlock}</OptinButton>
            <ButtonLink href="/apply" variant="outline">
              {content.cta.applyGrowth}
            </ButtonLink>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
