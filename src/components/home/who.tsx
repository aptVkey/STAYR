"use client";

import Image from "next/image";
import { useState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp, RevealLines } from "@/components/ui/reveal";
import { images } from "@/config/images";
import { content } from "@/content";
import { cn } from "@/lib/cn";

const t = content.who;

export function Who() {
  const [active, setActive] = useState(3);

  return (
    <section id="who" className="on-paper relative bg-paper text-ink">
      <div className="shell pt-24 lg:pt-40">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow index="06" className="text-slate">
              {t.eyebrow}
            </Eyebrow>
            <RevealLines
              lines={t.headline}
              accent={1}
              accentClassName="text-slate"
              className="type-h1 mt-8"
            />
          </div>
          <FadeUp className="lg:col-span-4 lg:col-start-9">
            <p className="type-eyebrow mb-4 text-slate">{t.idealLabel}</p>
            <p className="type-lead text-ink/85">{t.ideal}</p>
          </FadeUp>
        </div>
      </div>

      {/* Desktop: expanding gallery. Mobile: swipeable rail. */}
      <FadeUp className="pb-24 pt-14 lg:pb-40 lg:pt-20">
        <ul
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:px-8 lg:shell lg:h-[min(72vh,42rem)] lg:snap-none lg:gap-2 lg:overflow-visible"
          onMouseLeave={() => setActive(3)}
        >
          {t.segments.map((segment, i) => {
            const image = images.segments[segment.id as keyof typeof images.segments];
            const open = active === i;
            return (
              <li
                key={segment.id}
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cn(
                  "group relative aspect-[3/4] w-[74vw] max-w-[22rem] shrink-0 snap-center overflow-hidden bg-ink text-paper",
                  "lg:aspect-auto lg:w-auto lg:max-w-none lg:shrink lg:basis-0 lg:transition-[flex-grow] lg:duration-700 lg:ease-(--ease-expo)",
                  open ? "lg:grow-[4.2]" : "lg:grow",
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 70vw, 160vw"
                  className={cn(
                    "object-cover transition-[transform,filter] duration-[1200ms] ease-(--ease-expo)",
                    open
                      ? "lg:scale-100 lg:grayscale-0"
                      : "lg:scale-110 lg:grayscale lg:brightness-75",
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-ink/30" />

                <span className="type-eyebrow absolute left-5 top-5 text-paper/80">
                  0{i + 1}
                </span>

                {/* Collapsed label (desktop) */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-6 left-5 hidden origin-bottom-left -rotate-90 translate-x-4 whitespace-nowrap text-[1.0625rem] font-medium tracking-[-0.02em] transition-opacity duration-300 lg:block",
                    open ? "opacity-0" : "opacity-100 delay-200",
                  )}
                >
                  {segment.name}
                </span>

                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 p-5 transition-[opacity,transform] duration-500 ease-(--ease-expo) lg:w-[min(30rem,40vw)] lg:p-8",
                    open
                      ? "lg:translate-y-0 lg:opacity-100 lg:delay-200"
                      : "lg:translate-y-4 lg:opacity-0",
                  )}
                >
                  <h3 className="text-[1.625rem] font-medium leading-none tracking-[-0.035em] lg:text-[2.25rem]">
                    {segment.name}
                  </h3>
                  <p className="mt-3 max-w-[34ch] text-[0.9375rem] leading-snug text-paper/75">
                    {segment.note}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </FadeUp>
    </section>
  );
}
