import Link from "next/link";
import { MinimalHeader } from "@/components/layout/minimal-header";
import { SiteFooter } from "@/components/layout/site-footer";
import type { LegalDocument } from "@/content/legal.en";

/** Long-form legal layout shared by the privacy and terms pages. */
export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <>
      <MinimalHeader
        action={
          <Link
            href="/"
            className="h-10 rounded-full border border-paper/20 px-4 text-[0.8125rem] leading-10 transition-colors hover:border-paper/60"
          >
            Back to site
          </Link>
        }
      />
      <main id="main">
        <div className="bg-ink text-paper">
          <div className="shell pb-14 pt-32 lg:pb-20 lg:pt-44">
            <p className="type-eyebrow text-mute">{doc.updated}</p>
            <h1 className="type-h1 mt-6">{doc.title}</h1>
          </div>
        </div>

        <div className="on-paper bg-paper text-ink">
          <div className="shell grid gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
            <aside className="lg:col-span-4">
              <p className="rounded-md border border-dashed border-ink/35 p-5 font-mono text-[0.75rem] leading-relaxed text-ink/75 lg:sticky lg:top-10">
                {doc.draftNotice}
              </p>
            </aside>

            <article className="lg:col-span-7 lg:col-start-6">
              <p className="type-lead text-ink/85">{doc.intro}</p>
              {doc.sections.map((section) => (
                <section key={section.title} className="mt-12 border-t border-ink/15 pt-8">
                  <h2 className="type-h3">{section.title}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mt-4 max-w-[68ch] leading-relaxed text-ink/80">
                      {paragraph}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="mt-4 max-w-[68ch] space-y-3 leading-relaxed text-ink/80">
                      {section.list.map((item) => (
                        <li key={item} className="flex gap-4">
                          <span className="mt-[0.7em] size-1 shrink-0 rounded-full bg-ink/50" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
      <SiteFooter compact />
    </>
  );
}
