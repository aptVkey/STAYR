"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { useFunnel } from "@/components/providers/funnel-provider";
import { EASE } from "@/components/ui/reveal";
import { content } from "@/content";

/**
 * Mobile-only floating call to action. Appears once the hero has scrolled
 * away and steps aside near the page end, where the final CTA takes over.
 */
export function MobileCta() {
  const { scrollY, scrollYProgress } = useScroll();
  const { openOptin, optinOpen } = useFunnel();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const pastHero = y > window.innerHeight * 0.9;
    const nearEnd = scrollYProgress.get() > 0.93;
    setVisible(pastHero && !nearEnd);
  });

  return (
    <AnimatePresence>
      {visible && !optinOpen && (
        <motion.div
          className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => openOptin("mobile_sticky")}
            className="flex h-14 w-full items-center justify-between rounded-full bg-ink/90 pl-5 pr-2 text-left text-paper shadow-[0_16px_48px_-8px_rgb(0_0_0/0.55)] ring-1 ring-paper/15 backdrop-blur-xl"
          >
            <span className="flex flex-col leading-tight">
              <span className="type-eyebrow text-[0.5625rem] text-lime">
                {content.optin.eyebrow}
              </span>
              <span className="text-[0.9375rem] font-medium">{content.cta.unlock}</span>
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-lime text-ink" aria-hidden>
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
