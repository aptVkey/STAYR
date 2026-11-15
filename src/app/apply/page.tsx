import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ApplicationForm } from "@/components/funnel/application-form";
import { MinimalHeader } from "@/components/layout/minimal-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp, RevealLines } from "@/components/ui/reveal";
import { images } from "@/config/images";
import { content } from "@/content";

const t = content.apply;

export const metadata: Metadata = {
  title: "Apply for a Growth Partnership",
  description: t.body,
  alternates: { canonical: "/apply" },
};

export default function ApplyPage() {
  return (
    <>
      <MinimalHeader
        note={t.eyebrow}
        action={
          <Link
            href="/"
            className="h-10 rounded-full border border-paper/20 px-4 text-[0.8125rem] leading-10 transition-colors hover:border-paper/60"
          >
            Back to site
          </Link>
        }
      />

      <main id="main" className="bg-ink text-paper">
        <div className="shell grid gap-12 pb-24 pt-28 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-40">
          {/* Context */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <FadeUp immediate delay={0.1}>
                <Eyebrow live className="text-lime">
                  {t.eyebrow}
                </Eyebrow>
              </FadeUp>
              <RevealLines
                as="h1"
                immediate
                delay={0.2}
                lines={t.headline}
                accent={1}
                accentClassName="text-lime"
                className="type-h2 mt-7 text-balance lg:text-[clamp(2.5rem,4.4vw,4.25rem)]"
              />
              <FadeUp immediate delay={0.5}>
                <p className="mt-7 max-w-[42ch] text-[1.0625rem] leading-relaxed text-paper/75">
                  {t.body}
                </p>

                <p className="type-eyebrow mb-4 mt-12 text-mute">{t.stepsLabel}</p>
                <ol className="border-t border-paper/12">
                  {t.steps.map((step, i) => (
                    <li
                      key={step}
                      className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-paper/12 py-4 text-[0.9375rem] leading-snug text-paper/85"
                    >
                      <span className="font-mono text-[0.75rem] text-lime">0{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>

                <div className="relative mt-10 hidden aspect-[16/7] overflow-hidden lg:block">
                  <Image
                    src={images.apply.src}
                    alt={images.apply.alt}
                    fill
                    sizes="40vw"
                    className="object-cover"
                    style={{ objectPosition: images.apply.position }}
                  />
                  <div className="absolute inset-0 bg-ink/25" />
                </div>
              </FadeUp>
            </div>
          </div>

          {/* Form */}
          <FadeUp immediate delay={0.4} y={32} className="lg:col-span-6 lg:col-start-7">
            <div className="relative bg-surface p-6 ring-1 ring-paper/10 sm:p-10 lg:p-12">
              <span className="absolute left-6 top-0 h-0.5 w-12 bg-lime sm:left-10 lg:left-12" aria-hidden />
              <ApplicationForm />
            </div>
          </FadeUp>
        </div>
      </main>

      <SiteFooter compact />
    </>
  );
}
