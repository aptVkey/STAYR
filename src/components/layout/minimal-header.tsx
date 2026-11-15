import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

/**
 * Stripped-back header for funnel pages (case study, application, legal):
 * the logo, a short context note and at most one action.
 */
export function MinimalHeader({
  note,
  action,
}: {
  note?: string;
  action?: ReactNode;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-40 text-paper">
      <div className="shell flex h-16 items-center justify-between gap-6 lg:h-20">
        <div className="flex items-center gap-5">
          <Link href="/" aria-label="STAYR — home" className="py-2">
            <Logo />
          </Link>
          {note && (
            <span className="type-eyebrow hidden items-center gap-3 text-paper/50 sm:flex">
              <span className="h-3 w-px bg-paper/25" aria-hidden />
              {note}
            </span>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
