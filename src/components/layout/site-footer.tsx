import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { site } from "@/config/site";
import { content } from "@/content";
import { cn } from "@/lib/cn";

const t = content.footer;

/** A real value, or a visibly marked placeholder — never an invented detail. */
function Detail({ value, placeholder }: { value: string | null; placeholder: string }) {
  if (value) return <span>{value}</span>;
  return (
    <span className="inline-block rounded-sm border border-dashed border-paper/25 px-2 py-1 font-mono text-[0.6875rem] leading-tight text-paper/45">
      {placeholder}
    </span>
  );
}

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className={cn("shell", compact ? "pt-14" : "pt-20 lg:pt-28")}>
        {!compact && (
          <div className="grid gap-12 border-b border-paper/10 pb-16 lg:grid-cols-12 lg:pb-24">
            <div className="lg:col-span-5">
              <Logo className="text-[1.75rem]" />
              <p className="mt-6 max-w-[38ch] text-[0.9375rem] leading-relaxed text-mute">
                {t.description}
              </p>
              <p className="accent-serif mt-8 text-[1.75rem] leading-tight text-paper">
                {t.statement}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-7">
              <div>
                <h2 className="type-eyebrow mb-5 text-paper/45">{t.columns.explore}</h2>
                <ul className="space-y-3 text-[0.9375rem]">
                  {content.nav.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-paper/80 transition-colors hover:text-lime">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/apply" className="text-paper/80 transition-colors hover:text-lime">
                      {content.cta.apply}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="type-eyebrow mb-5 text-paper/45">{t.columns.contact}</h2>
                <ul className="space-y-3 text-[0.9375rem]">
                  <li>
                    {site.contact.email ? (
                      <a
                        href={`mailto:${site.contact.email}`}
                        className="text-paper/80 transition-colors hover:text-lime"
                      >
                        {site.contact.email}
                      </a>
                    ) : (
                      <Detail value={null} placeholder={t.placeholders.email} />
                    )}
                  </li>
                  <li>
                    {site.contact.linkedin ? (
                      <a
                        href={site.contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-paper/80 transition-colors hover:text-lime"
                      >
                        LinkedIn
                      </a>
                    ) : (
                      <Detail value={null} placeholder={t.placeholders.linkedin} />
                    )}
                  </li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h2 className="type-eyebrow mb-5 text-paper/45">{t.columns.company}</h2>
                <ul className="space-y-3 text-[0.9375rem] text-paper/80">
                  <li>
                    <Detail value={site.company.legalName} placeholder={t.placeholders.legalName} />
                  </li>
                  <li>
                    <Detail
                      value={site.company.registeredAddress}
                      placeholder={t.placeholders.address}
                    />
                  </li>
                  <li>
                    <Detail
                      value={site.company.vatNumber ?? site.company.registrationNumber}
                      placeholder={t.placeholders.registration}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 py-7 text-[0.8125rem] text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.copyrightYear} {site.name}. {t.rights}
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy" className="transition-colors hover:text-paper">
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-paper">
                {t.terms}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the viewport edge */}
      {!compact && (
        <div aria-hidden className="pointer-events-none select-none overflow-hidden pb-16 lg:pb-0">
          <p className="-mb-[0.19em] whitespace-nowrap text-center text-[27.5vw] font-semibold leading-[0.8] tracking-[-0.075em] text-paper/[0.045]">
            STAYR
          </p>
        </div>
      )}
    </footer>
  );
}
