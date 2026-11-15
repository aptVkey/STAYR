import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { BookCallLink, BookingEmbed } from "@/components/funnel/booking-embed";
import { StickyBook } from "@/components/funnel/sticky-book";
import { TrackView } from "@/components/funnel/track-view";
import { VideoPlayer } from "@/components/funnel/video-player";
import { FaqList } from "@/components/home/faq";
import { PricingPlans } from "@/components/home/partnership";
import { MinimalHeader } from "@/components/layout/minimal-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { textLinkClass } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { DrawLine, FadeUp, RevealLines } from "@/components/ui/reveal";
import { content } from "@/content";

const t = content.vsl;

export const metadata: Metadata = {
  title: "Your Case Study",
  description: t.subtitle,
  // Gated funnel step: keep it out of search results.
  robots: { index: false, follow: false },
  alternates: { canonical: "/case-study" },
};

const engines = [
  content.system.engines.creative,
  content.system.engines.conversion,
  content.system.engines.media,
];

export default function CaseStudyPage() {
  const faqItems = t.faqPick.map((index) => content.faq.items[index]);

  return (
    <>
      <TrackView event="case_study_view" />
      <MinimalHeader
        note={t.headerNote}
        action={
          <BookCallLink
            placement="case_study_header"
            className="hidden h-10 items-center gap-2 rounded-full border border-paper/20 px-4 text-[0.8125rem] transition-colors hover:border-paper/60 sm:inline-flex"
          >
            {content.cta.bookCall}
            <ArrowDown className="size-3.5" aria-hidden />
          </BookCallLink>
        }
      />

      <main id="main">
        {/* ── Presentation ─────────────────────────────────────── */}
        <section className="grain relative overflow-hidden bg-ink-deep text-paper">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[30rem] h-[70rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(217_255_112/0.07),transparent)]"
          />
          <div className="shell relative z-10 pb-16 pt-24 lg:pb-24 lg:pt-32">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
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
                  className="type-h2 mt-6 text-balance"
                />
              </div>
              <FadeUp immediate delay={0.55} className="lg:col-span-4">
                <p className="max-w-[40ch] text-[1.0625rem] leading-relaxed text-paper/75">
                  {t.subtitle}
                </p>
              </FadeUp>
            </div>

            {/* Width is capped by viewport height so the player and its controls
                are never taller than the screen. */}
            <FadeUp
              immediate
              delay={0.7}
              y={40}
              className="mx-auto mt-9 w-full max-w-[max(36rem,calc((100svh-15rem)*16/9))] lg:mt-12"
            >
              <VideoPlayer />
            </FadeUp>

            {/* Chapter outline */}
            <div className="mt-12 lg:mt-16">
              <p className="type-eyebrow mb-5 text-mute">{t.chaptersLabel}</p>
              <ol className="grid border-t border-paper/12 sm:grid-cols-2 lg:grid-cols-4">
                {t.chapters.map((chapter, i) => (
                  <li
                    key={chapter.title}
                    className="border-b border-paper/12 py-5 sm:pr-6 lg:py-6"
                  >
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-lime">
                      Part 0{i + 1}
                    </p>
                    <p className="mt-2.5 text-[1.125rem] font-medium tracking-[-0.025em]">
                      {chapter.title}
                    </p>
                    <p className="mt-1.5 text-[0.875rem] leading-snug text-mute">{chapter.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Key takeaways ────────────────────────────────────── */}
        <section className="on-paper bg-paper text-ink">
          <div className="shell grid gap-12 py-24 lg:grid-cols-12 lg:gap-8 lg:py-36">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <Eyebrow index="01" className="text-slate">
                  {t.takeaways.eyebrow}
                </Eyebrow>
                <RevealLines
                  lines={t.takeaways.headline}
                  accent={1}
                  accentClassName="text-slate"
                  className="type-h2 mt-7"
                />
              </div>
            </div>
            <ol className="lg:col-span-7 lg:col-start-6">
              {t.takeaways.items.map((item, i) => (
                <li key={item.title}>
                  <DrawLine className="text-ink" />
                  <FadeUp className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-7 sm:grid-cols-[4rem_1fr] sm:gap-x-8 lg:py-9">
                    <span className="type-eyebrow pt-2 text-slate">0{i + 1}</span>
                    <div>
                      <h3 className="type-h3 max-w-[24ch] text-balance">{item.title}</h3>
                      <p className="mt-3 max-w-[56ch] leading-relaxed text-slate">{item.body}</p>
                    </div>
                  </FadeUp>
                </li>
              ))}
              <DrawLine className="text-ink" />
            </ol>
          </div>
        </section>

        {/* ── Evidence (placeholders until verified data exists) ── */}
        <section className="on-paper bg-paper-2 text-ink">
          <div className="shell py-24 lg:py-36">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <Eyebrow index="02" className="text-slate">
                  {t.evidence.eyebrow}
                </Eyebrow>
                <RevealLines
                  lines={t.evidence.headline}
                  accent={1}
                  accentClassName="text-slate"
                  className="type-h2 mt-7"
                />
              </div>
              <FadeUp className="lg:col-span-4 lg:col-start-9">
                <p className="leading-relaxed text-ink/75">{t.evidence.body}</p>
              </FadeUp>
            </div>

            <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
              {t.evidence.items.map((item, i) => (
                <li
                  key={item.label}
                  className="flex min-h-[13rem] flex-col rounded-md border border-dashed border-ink/30 p-6"
                >
                  <p className="flex items-center justify-between gap-3">
                    <span className="type-eyebrow text-slate">0{i + 1}</span>
                    <span className="rounded-full bg-ink/8 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink/70">
                      {t.evidence.badge}
                    </span>
                  </p>
                  <p className="mt-auto pt-8 text-[1.375rem] font-medium tracking-[-0.03em]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[0.875rem] leading-snug text-slate">{item.hint}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── The three-engine system ──────────────────────────── */}
        <section className="bg-ink text-paper">
          <div className="shell py-24 lg:py-36">
            <Eyebrow index="03" className="text-mute">
              {t.engines.eyebrow}
            </Eyebrow>
            <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
              <RevealLines
                lines={t.engines.headline}
                accent={1}
                accentClassName="text-lime"
                className="type-h1 lg:col-span-8"
              />
              <FadeUp className="lg:col-span-4">
                <p className="leading-relaxed text-paper/75">{t.engines.body}</p>
              </FadeUp>
            </div>

            <ol className="mt-14 border-t border-paper/12 lg:mt-20">
              {engines.map((engine) => (
                <li key={engine.id} className="border-b border-paper/12">
                  <FadeUp className="grid gap-x-8 gap-y-4 py-8 lg:grid-cols-12 lg:py-11">
                    <p className="type-eyebrow text-lime lg:col-span-2 lg:pt-2">
                      Engine {engine.index}
                    </p>
                    <h3 className="type-h3 lg:col-span-4">{engine.name}</h3>
                    <div className="lg:col-span-6">
                      <p className="text-[1.125rem] leading-snug tracking-[-0.015em] text-paper/90">
                        {engine.title}
                      </p>
                      <p className="mt-3 max-w-[56ch] leading-relaxed text-mute">{engine.body}</p>
                    </div>
                  </FadeUp>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Partnership overview ─────────────────────────────── */}
        <section className="bg-surface text-paper">
          <div className="shell grid gap-12 py-24 lg:grid-cols-12 lg:gap-8 lg:py-36">
            <div className="lg:col-span-5">
              <Eyebrow index="04" className="text-mute">
                {t.partnership.eyebrow}
              </Eyebrow>
              <RevealLines
                lines={t.partnership.headline}
                accent={1}
                accentClassName="text-lime"
                className="type-h2 mt-7"
              />
              <FadeUp className="mt-7">
                <p className="max-w-[44ch] leading-relaxed text-paper/75">{t.partnership.body}</p>
                <ul className="mt-8 grid gap-x-6 gap-y-2.5 text-[0.9375rem] text-paper/85 sm:grid-cols-2">
                  {content.partnership.included.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-1 size-3.5 shrink-0 text-lime" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeUp>
            </div>
            <FadeUp className="lg:col-span-6 lg:col-start-7">
              <PricingPlans tone="ink" />
              <p className="mt-5 text-[0.875rem] leading-relaxed text-mute">
                {content.partnership.exclusions} {content.partnership.scope}
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="on-paper bg-paper text-ink">
          <div className="shell grid gap-12 py-24 lg:grid-cols-12 lg:gap-8 lg:py-36">
            <div className="lg:col-span-4">
              <Eyebrow index="05" className="text-slate">
                {content.faq.eyebrow}
              </Eyebrow>
              <RevealLines
                lines={t.faqHeadline}
                accent={1}
                accentClassName="text-slate"
                className="type-h2 mt-7"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FaqList items={faqItems} />
            </div>
          </div>
        </section>

        {/* ── Strategy call ────────────────────────────────────── */}
        <section id="book" className="grain relative overflow-hidden bg-ink-deep text-paper">
          <div className="shell relative z-10 grid gap-12 py-24 lg:grid-cols-12 lg:gap-8 lg:py-40">
            <div className="lg:col-span-6">
              <Eyebrow live className="text-lime">
                {t.booking.eyebrow}
              </Eyebrow>
              <RevealLines
                lines={t.booking.headline}
                accent={1}
                accentClassName="text-lime"
                className="type-h1 mt-7 text-balance"
              />
              <FadeUp className="mt-8">
                <p className="type-lead max-w-[42ch] text-paper/80">{t.booking.body}</p>
              </FadeUp>
            </div>

            <FadeUp className="lg:col-span-5 lg:col-start-8">
              <p className="type-eyebrow mb-4 text-mute">{t.booking.expectLabel}</p>
              <ul className="mb-8 border-t border-paper/12">
                {t.booking.expect.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-4 border-b border-paper/12 py-3.5 text-[1.0625rem] text-paper/90"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-lime" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <BookingEmbed placement="case_study_booking" />

              <p className="mt-6 text-[0.9375rem] text-mute">
                {t.booking.alt}{" "}
                <Link href="/apply" className={textLinkClass("text-paper")}>
                  {t.booking.altLink}
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </p>
            </FadeUp>
          </div>
        </section>
      </main>

      <SiteFooter compact />
      <StickyBook />
    </>
  );
}
