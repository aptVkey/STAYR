"use client";

import { MotionConfig } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ConsentBanner } from "@/components/layout/consent-banner";
import { OptinModal } from "@/components/funnel/optin-modal";
import { ACCESS_HINT_KEY, UNLOCK_PARAM, UNLOCK_VALUE } from "@/lib/access";
import { loadStoredConsent, track, trackPageview } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";
import { loadRuntimeConfig } from "@/lib/runtime-config";

type FunnelContextValue = {
  /** Open the case study opt-in. `placement` identifies the CTA. */
  openOptin: (placement: string) => void;
  closeOptin: () => void;
  optinOpen: boolean;
};

const FunnelContext = createContext<FunnelContextValue | null>(null);

export function useFunnel() {
  const value = useContext(FunnelContext);
  if (!value) throw new Error("useFunnel must be used inside <FunnelProvider>");
  return value;
}

/**
 * Watches for the `?unlock=case-study` flag that src/proxy.ts adds when
 * someone reaches /case-study without having opted in.
 */
function UnlockWatcher({ onUnlock }: { onUnlock: () => void }) {
  const params = useSearchParams();
  const flagged = params.get(UNLOCK_PARAM) === UNLOCK_VALUE;
  useEffect(() => {
    if (flagged) onUnlock();
  }, [flagged, onUnlock]);
  return null;
}

export function FunnelProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [optin, setOptin] = useState({ open: false, placement: "" });

  useEffect(() => {
    loadStoredConsent();
    captureAttribution();
    loadRuntimeConfig();
  }, []);

  // Built-in analytics: one page view per route (the admin is not counted).
  useEffect(() => {
    trackPageview();
  }, [pathname]);

  const show = useCallback((placement: string) => {
    track("optin_modal_open", { placement });
    setOptin({ open: true, placement });
  }, []);

  const openOptin = useCallback(
    (placement: string) => {
      // Returning leads skip the form. This is a convenience hint only: the
      // server still checks its own cookie and bounces back if it is missing.
      let unlocked = false;
      try {
        unlocked = window.localStorage.getItem(ACCESS_HINT_KEY) === "1";
      } catch {
        /* storage unavailable */
      }
      if (unlocked) router.push("/case-study");
      else show(placement);
    },
    [router, show],
  );

  const closeOptin = useCallback(
    () => setOptin((state) => ({ ...state, open: false })),
    [],
  );

  const handleUnlockRedirect = useCallback(() => {
    try {
      window.localStorage.removeItem(ACCESS_HINT_KEY);
    } catch {
      /* ignore */
    }
    router.replace(pathname, { scroll: false });
    show("gate_redirect");
  }, [pathname, router, show]);

  const value = useMemo(
    () => ({ openOptin, closeOptin, optinOpen: optin.open }),
    [openOptin, closeOptin, optin.open],
  );

  return (
    <MotionConfig reducedMotion="user">
      <FunnelContext.Provider value={value}>
        {children}
        <Suspense fallback={null}>
          <UnlockWatcher onUnlock={handleUnlockRedirect} />
        </Suspense>
        <OptinModal
          open={optin.open}
          placement={optin.placement}
          onClose={closeOptin}
        />
        <ConsentBanner />
      </FunnelContext.Provider>
    </MotionConfig>
  );
}
