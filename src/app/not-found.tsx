import { MinimalHeader } from "@/components/layout/minimal-header";
import { ButtonLink } from "@/components/ui/button";
import { content } from "@/content";

const t = content.notFound;

export default function NotFound() {
  return (
    <>
      <MinimalHeader />
      <main id="main" className="grid min-h-dvh place-items-center bg-ink text-paper">
        <div className="shell py-32 text-center">
          <p className="type-eyebrow text-lime">{t.eyebrow}</p>
          <h1 className="type-h1 mt-6">
            {t.headline[0]} <span className="accent-serif text-lime">{t.headline[1]}</span>
          </h1>
          <p className="type-lead mx-auto mt-6 max-w-[40ch] text-paper/75">{t.body}</p>
          <ButtonLink href="/" className="mt-10">
            {t.cta}
          </ButtonLink>
        </div>
      </main>
    </>
  );
}
