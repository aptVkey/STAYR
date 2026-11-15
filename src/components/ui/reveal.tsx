"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";

export const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

type HeadingTag = "h1" | "h2" | "h3" | "p" | "div";

/**
 * Headline that reveals line by line from behind a mask.
 * `accent` picks which line(s) are set in the serif italic accent face.
 */
export function RevealLines({
  lines,
  as: Tag = "h2",
  className,
  accent,
  accentClassName,
  delay = 0,
  immediate = false,
}: {
  lines: ReactNode[];
  as?: HeadingTag;
  className?: string;
  accent?: number | number[];
  accentClassName?: string;
  delay?: number;
  /** Animate on mount instead of when scrolled into view (hero). */
  immediate?: boolean;
}) {
  const accents = accent === undefined ? [] : Array.isArray(accent) ? accent : [accent];

  // The lines start fully clipped by their masks, so they can never report
  // themselves as "in view". Visibility is observed on the heading instead.
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const shown = immediate || inView;

  return (
    <Tag ref={ref as Ref<never>} className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="-mb-[0.14em] block overflow-hidden pb-[0.14em] pr-[0.08em]"
        >
          <motion.span
            className={cn(
              "block will-change-transform",
              accents.includes(i) && "accent-serif",
              accents.includes(i) && accentClassName,
            )}
            initial={{ y: "112%" }}
            animate={{ y: shown ? 0 : "112%" }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.1 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Fade + rise for supporting content. */
export function FadeUp({
  children,
  className,
  delay = 0,
  y = 24,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  immediate?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(immediate
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: VIEWPORT })}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** A hairline that draws itself from the left. */
export function DrawLine({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      aria-hidden
      className={cn("block h-px origin-left bg-current/15", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, ease: EASE, delay }}
    />
  );
}
