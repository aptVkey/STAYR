"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE, FadeUp, RevealLines } from "@/components/ui/reveal";
import { images } from "@/config/images";
import { content } from "@/content";
import { cn } from "@/lib/cn";

const t = content.operators;

export function Operators() {
  const [active, setActive] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-9%", "9%"]);

  return (
    <section id="approach" className="on-paper relative bg-paper text-ink">
      <div className="shell py-24 lg:py-40">
        <Eyebrow index="04" className="text-slate">
          {t.eyebrow}
        </Eyebrow>
        <RevealLines
          lines={t.headline}
          accent={1}
          accentClassName="text-slate"
          className="type-h1 mt-8 text-balance"
        />

        <div className="mt-14 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          {/* Photography with the governing equation */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div
                ref={imageRef}
                className="relative aspect-[4/5] overflow-hidden bg-paper-2 lg:aspect-[4/5.2]"
              >
                <motion.div className="absolute -inset-y-[10%] inset-x-0" style={{ y: imageY }}>
                  <Image
                    src={images.operators.src}
                    alt={images.operators.alt}
                    fill
                    sizes="(min-width: 1024px) 90vw, 200vw"
                    quality={90}
                    className="object-cover"
                    style={{ objectPosition: images.operators.position }}
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-paper sm:p-8">
                  <p className="font-mono text-[clamp(1.125rem,2vw,1.625rem)] tracking-[-0.03em]">
                    {t.formula}
                  </p>
                  <p className="type-eyebrow mt-3 text-paper/65">{t.formulaNote}</p>
                </div>
              </div>
              <FadeUp className="mt-8">
                <p className="type-lead max-w-[40ch] text-ink/85">{t.body}</p>
              </FadeUp>
            </div>
          </div>

          {/* Operating glossary */}
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="type-eyebrow mb-5 max-w-[34ch] leading-relaxed text-slate">
              {t.listLabel}
            </p>
            <ul className="border-t border-ink/15">
              {t.terms.map((item, i) => {
                const open = active === i;
                return (
                  <li key={item.term} className="border-b border-ink/15">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`term-${i}`}
                      onClick={() => setActive(open ? -1 : i)}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-4 text-left sm:grid-cols-[3rem_1fr_auto] lg:py-5"
                    >
                      <span className="type-eyebrow text-slate">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span
                          className={cn(
                            "text-[clamp(1.5rem,2.7vw,2.375rem)] font-medium leading-none tracking-[-0.04em] transition-colors duration-300",
                            open ? "text-ink" : "text-ink/40 group-hover:text-ink",
                          )}
                        >
                          {item.term}
                        </span>
                        <span
                          className={cn(
                            "text-[0.8125rem] text-slate transition-opacity duration-300",
                            open ? "opacity-100" : "hidden",
                          )}
                        >
                          {item.full}
                        </span>
                      </span>
                      <Plus
                        aria-hidden
                        strokeWidth={1.5}
                        className={cn(
                          "size-5 self-center text-slate transition-transform duration-500 ease-(--ease-expo)",
                          open && "rotate-45 text-ink",
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={`term-${i}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-[52ch] pb-6 pl-[3rem] pr-8 text-[1rem] leading-relaxed text-ink/75 sm:pl-[3.75rem]">
                            {item.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
