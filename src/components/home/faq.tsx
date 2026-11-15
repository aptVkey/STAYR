"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { EASE } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

/** Accessible single-open accordion. Works on light and dark surfaces. */
export function FaqList({
  items,
  tone = "paper",
  defaultOpen = 0,
}: {
  items: ReadonlyArray<{ q: string; a: string }>;
  tone?: "paper" | "ink";
  defaultOpen?: number;
}) {
  const uid = useId();
  const [open, setOpen] = useState(defaultOpen);
  const onInk = tone === "ink";

  return (
    <ul className={cn("border-t", onInk ? "border-paper/15" : "border-ink/15")}>
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <li key={item.q} className={cn("border-b", onInk ? "border-paper/15" : "border-ink/15")}>
            <h3>
              <button
                type="button"
                id={`${uid}-q-${i}`}
                aria-expanded={expanded}
                aria-controls={`${uid}-a-${i}`}
                onClick={() => setOpen(expanded ? -1 : i)}
                className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-5 text-left sm:grid-cols-[3.5rem_1fr_auto] lg:py-6"
              >
                <span className={cn("type-eyebrow", onInk ? "text-mute" : "text-slate")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[clamp(1.125rem,1.7vw,1.5rem)] font-medium leading-snug tracking-[-0.025em]">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-9 shrink-0 place-items-center self-center rounded-full transition-[background-color,color,transform] duration-500 ease-(--ease-expo)",
                    expanded
                      ? onInk
                        ? "rotate-45 bg-lime text-ink"
                        : "rotate-45 bg-ink text-lime"
                      : onInk
                        ? "bg-paper/8 text-paper group-hover:bg-paper/15"
                        : "bg-ink/5 text-ink group-hover:bg-ink/10",
                  )}
                >
                  <Plus className="size-4" strokeWidth={1.75} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={`${uid}-a-${i}`}
                  role="region"
                  aria-labelledby={`${uid}-q-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p
                    className={cn(
                      "max-w-[62ch] pb-7 pl-[3rem] pr-4 text-[1rem] leading-relaxed sm:pl-[4.25rem] sm:pr-12",
                      onInk ? "text-paper/75" : "text-ink/75",
                    )}
                  >
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
