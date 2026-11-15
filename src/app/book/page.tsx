import type { Metadata } from "next";
import { BookingEmbed } from "@/components/funnel/booking-embed";
import { MinimalHeader } from "@/components/layout/minimal-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { content } from "@/content";

const t = content.vsl.booking;

export const metadata: Metadata = {
  title: "Book a Growth Strategy Call",
  description: t.body,
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <>
      <MinimalHeader />
      <main id="main" className="bg-ink text-paper">
        <div className="shell grid gap-12 pb-24 pt-32 lg:grid-cols-12 lg:gap-8 lg:pb-32 lg:pt-40">
          <div className="lg:col-span-5">
            <p className="type-eyebrow text-lime">{t.eyebrow}</p>
            <h1 className="type-h2 mt-6 text-balance">
              {t.headline[0]} <span className="accent-serif text-lime">{t.headline[1]}</span>
            </h1>
            <p className="type-lead mt-6 max-w-[40ch] text-paper/75">{t.body}</p>
            <p className="type-eyebrow mb-4 mt-10 text-mute">{t.expectLabel}</p>
            <ul className="border-t border-paper/12">
              {t.expect.map((item) => (
                <li key={item} className="border-b border-paper/12 py-3.5 text-[1.0625rem] tracking-[-0.01em]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <BookingEmbed placement="book_page" />
          </div>
        </div>
      </main>
      <SiteFooter compact />
    </>
  );
}
