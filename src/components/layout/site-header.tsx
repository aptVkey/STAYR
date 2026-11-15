"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OptinButton } from "@/components/funnel/optin-button";
import { useFunnel } from "@/components/providers/funnel-provider";
import { buttonClass, ButtonInner } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { EASE } from "@/components/ui/reveal";
import { content } from "@/content";
import { cn } from "@/lib/cn";

const t = content.nav;

/** Homepage header: transparent over the hero, solid once scrolling. */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const { openOptin } = useFunnel();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setSolid(y > 24);
    setHidden(y > 720 && y > previous);
  });

  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 text-paper transition-[background-color,border-color,backdrop-filter] duration-500",
          solid || menuOpen
            ? "border-b border-paper/10 bg-ink/80 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden && !menuOpen ? "-100%" : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
          <Link href="/" aria-label="STAYR — home" className="relative z-10 py-2">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9 text-[0.875rem] text-paper/75">
              {t.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative py-2 transition-colors hover:text-paper after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-lime after:transition-transform after:duration-500 after:ease-(--ease-expo) hover:after:scale-x-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/apply"
              className="hidden h-10 items-center rounded-full px-4 text-[0.875rem] text-paper/80 transition-colors hover:text-paper sm:inline-flex"
            >
              {t.apply}
            </Link>
            <OptinButton placement="header" size="md" className="max-sm:hidden">
              {t.caseStudy}
            </OptinButton>

            <button
              type="button"
              className="relative z-10 flex h-10 items-center gap-3 rounded-full border border-paper/20 pl-4 pr-3 text-[0.8125rem] lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span>{menuOpen ? t.close : t.menu}</span>
              <span className="relative block h-2.5 w-4" aria-hidden>
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300",
                    menuOpen && "translate-y-[5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300",
                    menuOpen && "-translate-y-[4px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink px-5 pb-8 pt-24 text-paper lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto">
              <ul>
                {t.links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    className="border-b border-paper/10"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-baseline justify-between py-4 text-[2rem] font-medium leading-none tracking-[-0.04em]"
                    >
                      {link.label}
                      <span className="type-eyebrow opacity-40">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="grid gap-3 pt-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
            >
              <button
                type="button"
                className={buttonClass("lime", "lg", "w-full")}
                onClick={() => {
                  setMenuOpen(false);
                  openOptin("mobile_menu");
                }}
              >
                <ButtonInner variant="lime">{content.cta.unlock}</ButtonInner>
              </button>
              <Link
                href="/apply"
                onClick={() => setMenuOpen(false)}
                className={buttonClass("outline", "lg", "w-full")}
              >
                <ButtonInner variant="outline">{content.cta.apply}</ButtonInner>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
