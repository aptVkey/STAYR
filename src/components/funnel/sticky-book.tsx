"use client";

import { ArrowDown } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { BookCallLink } from "@/components/funnel/booking-embed";
import { EASE } from "@/components/ui/reveal";
import { content } from "@/content";

/**
 * Case study page: a slim bar that keeps the strategy call one tap away
 * once the video is behind the viewer, and steps aside at the booking block.
 */
export function StickyBook() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const book = document.getElementById("book");
    const beforeBooking = book
      ? book.getBoundingClientRect().top > window.innerHeight * 0.85
      : true;
    setVisible(y > window.innerHeight * 1.1 && beforeBooking);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-2xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <BookCallLink
            placement="case_study_sticky"
            className="flex h-14 items-center justify-between gap-4 rounded-full bg-ink/90 pl-6 pr-2 text-paper shadow-[0_16px_48px_-8px_rgb(0_0_0/0.6)] ring-1 ring-paper/15 backdrop-blur-xl"
          >
            <span className="truncate text-[0.9375rem]">
              <span className="text-paper/60 max-sm:hidden">{content.vsl.sticky} </span>
              <span className="font-medium">{content.cta.bookCall}</span>
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-ink" aria-hidden>
              <ArrowDown className="size-4" strokeWidth={1.75} />
            </span>
          </BookCallLink>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
