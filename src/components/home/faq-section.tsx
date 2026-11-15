import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { textLinkClass } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp, RevealLines } from "@/components/ui/reveal";
import { content } from "@/content";
import { FaqList } from "./faq";

const t = content.faq;

export function FaqSection() {
  return (
    <section id="faq" className="on-paper relative bg-paper-2 text-ink">
      <div className="shell grid gap-12 py-24 lg:grid-cols-12 lg:gap-8 lg:py-40">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Eyebrow index="09" className="text-slate">
              {t.eyebrow}
            </Eyebrow>
            <RevealLines
              lines={t.headline}
              accent={1}
              accentClassName="text-slate"
              className="type-h1 mt-8"
            />
            <FadeUp className="mt-8">
              <p className="max-w-[34ch] text-[1.0625rem] leading-relaxed text-ink/75">{t.body}</p>
              <Link href="/apply" className={textLinkClass("mt-8 text-[0.9375rem]")}>
                {content.cta.apply}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </FadeUp>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <FaqList items={t.items} />
        </div>
      </div>
    </section>
  );
}
