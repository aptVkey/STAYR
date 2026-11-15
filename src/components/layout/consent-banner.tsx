"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { EASE } from "@/components/ui/reveal";
import { content } from "@/content";
import { getConsent, onConsentChange, setConsent } from "@/lib/analytics";
import {
  getRuntimeConfig,
  getServerRuntimeConfig,
  hasTags,
  onRuntimeConfig,
} from "@/lib/runtime-config";

const t = content.consent;

/**
 * Consent banner.
 *
 * Shown only when at least one analytics / advertising tag is configured in
 * the admin (there is nothing to consent to otherwise). The tags themselves
 * are loaded by src/lib/analytics.ts, and only after the visitor accepts.
 */
export function ConsentBanner() {
  // The stored decision is loaded once by <FunnelProvider>; this component
  // only subscribes to it. Nothing renders on the server.
  const consent = useSyncExternalStore(
    onConsentChange,
    getConsent,
    () => "loading" as const,
  );

  const config = useSyncExternalStore(onRuntimeConfig, getRuntimeConfig, getServerRuntimeConfig);
  const pathname = usePathname();

  if (!config.loaded || !hasTags(config) || pathname.startsWith("/admin")) return null;

  return (
    <>
      <AnimatePresence>
        {consent === "unknown" && (
          <motion.aside
            role="region"
            aria-label={t.title}
            className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-2xl bg-surface p-5 text-paper shadow-[0_24px_80px_-12px_rgb(0_0_0/0.6)] ring-1 ring-paper/12 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
          >
            <p className="type-eyebrow mb-2 text-lime">{t.title}</p>
            <p className="text-sm leading-relaxed text-paper/75">
              {t.body}{" "}
              <Link href="/privacy" className="text-paper underline underline-offset-4">
                {t.link}
              </Link>
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConsent("granted")}
                className="h-11 flex-1 rounded-full bg-lime px-5 text-sm font-medium text-ink transition-colors hover:bg-paper"
              >
                {t.accept}
              </button>
              {/* Declining is as easy as accepting. */}
              <button
                type="button"
                onClick={() => setConsent("denied")}
                className="h-11 flex-1 rounded-full border border-paper/25 px-5 text-sm font-medium transition-colors hover:border-paper/70"
              >
                {t.decline}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
