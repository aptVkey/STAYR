import { Check } from "lucide-react";
import { OptinButton } from "@/components/funnel/optin-button";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp, RevealLines } from "@/components/ui/reveal";
import { site } from "@/config/site";
import { content } from "@/content";
import { formatEuro } from "@/lib/format";

const t = content.partnership;
const { annual, monthly, termMonths } = site.pricing;

/** Pricing cards, shared with the case study page. */
export function PricingPlans({ tone = "paper" }: { tone?: "paper" | "ink" }) {
  const onInk = tone === "ink";
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {/* Annual */}
      <article className="relative flex flex-col bg-ink p-7 text-paper ring-1 ring-paper/10 sm:p-8">
        <span className="absolute left-7 top-0 h-0.5 w-12 bg-lime sm:left-8" aria-hidden />
        <h3 className="type-eyebrow text-lime">{t.plans.annual.name}</h3>
        <p className="mt-10 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="whitespace-nowrap text-[clamp(2.5rem,3.9vw,3.5rem)] font-medium leading-none tracking-[-0.05em]">
            {formatEuro(annual)}
          </span>
          <span className="whitespace-nowrap text-[0.9375rem] text-mute">{t.plans.annual.unit}</span>
        </p>
        <p className="mt-4 text-[1.0625rem] font-medium tracking-[-0.01em]">{t.plans.annual.terms}</p>
        <p className="mt-1 text-[0.9375rem] leading-snug text-mute">{t.plans.annual.detail}</p>
        <p className="mt-auto border-t border-paper/12 pt-4 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-mute max-sm:mt-8 sm:mt-10">
          {formatEuro(annual)} total · {formatEuro(monthly * termMonths - annual)} less than monthly
        </p>
      </article>

      {/* Monthly */}
      <article
        className={
          onInk
            ? "flex flex-col bg-surface p-7 text-paper ring-1 ring-paper/10 sm:p-8"
            : "flex flex-col bg-paper p-7 text-ink ring-1 ring-ink/15 sm:p-8"
        }
      >
        <h3 className={onInk ? "type-eyebrow text-mute" : "type-eyebrow text-slate"}>
          {t.plans.monthly.name}
        </h3>
        <p className="mt-10 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="whitespace-nowrap text-[clamp(2.5rem,3.9vw,3.5rem)] font-medium leading-none tracking-[-0.05em]">
            {formatEuro(monthly)}
          </span>
          <span className={onInk ? "whitespace-nowrap text-[0.9375rem] text-mute" : "whitespace-nowrap text-[0.9375rem] text-slate"}>
            {t.plans.monthly.unit}
          </span>
        </p>
        <p className="mt-4 text-[1.0625rem] font-medium tracking-[-0.01em]">{t.plans.monthly.terms}</p>
        <p className={onInk ? "mt-1 text-[0.9375rem] leading-snug text-mute" : "mt-1 text-[0.9375rem] leading-snug text-slate"}>
          {t.plans.monthly.detail}
        </p>
        <p
          className={
            onInk
              ? "mt-auto border-t border-paper/12 pt-4 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-mute max-sm:mt-8 sm:mt-10"
              : "mt-auto border-t border-ink/12 pt-4 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate max-sm:mt-8 sm:mt-10"
          }
        >
          {formatEuro(monthly * termMonths)} total over {termMonths} months
        </p>
      </article>
    </div>
  );
}

export function Partnership() {
  return (
    <section id="partnership" className="on-paper relative bg-paper text-ink">
      <div className="shell py-24 lg:py-40">
        <Eyebrow index="08" className="text-slate">
          {t.eyebrow}
        </Eyebrow>
        <RevealLines
          lines={t.headline}
          accent={1}
          accentClassName="text-slate"
          className="type-h1 mt-8 max-w-[17ch] text-balance"
        />

        <div className="mt-14 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          {/* Scope */}
          <div className="lg:col-span-5">
            <FadeUp>
              <p className="type-lead max-w-[38ch] text-ink/85">{t.body}</p>
            </FadeUp>
            <p className="type-eyebrow mb-4 mt-12 text-slate">{t.includedLabel}</p>
            <ul className="border-t border-ink/15">
              {t.included.map((item, i) => (
                <li key={item}>
                  <FadeUp
                    delay={i * 0.03}
                    y={12}
                    className="flex items-center gap-4 border-b border-ink/15 py-3.5"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink text-lime">
                      <Check className="size-3" strokeWidth={2.5} aria-hidden />
                    </span>
                    <span className="text-[1.0625rem] tracking-[-0.01em]">{item}</span>
                  </FadeUp>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[48ch] text-[0.875rem] leading-relaxed text-slate">{t.scope}</p>
          </div>

          {/* Pricing */}
          <div className="lg:col-span-6 lg:col-start-7">
            <FadeUp className="lg:sticky lg:top-28">
              <PricingPlans />
              <p className="mt-5 text-[0.875rem] leading-relaxed text-slate">{t.exclusions}</p>
              <p className="mt-2 max-w-[56ch] text-[0.875rem] leading-relaxed text-slate">
                {t.selective}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/apply" variant="ink">
                  {content.cta.apply}
                </ButtonLink>
                <OptinButton placement="partnership" variant="outline-ink">
                  {content.cta.ourMethodology}
                </OptinButton>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
