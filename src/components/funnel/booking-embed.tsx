"use client";

import { ArrowUpRight, CalendarClock, Check, Settings2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { NativeBooking } from "@/components/funnel/native-booking";
import { buttonClass, ButtonInner } from "@/components/ui/button";
import { integrations, isCalendly } from "@/config/integrations";
import { content } from "@/content";
import { track } from "@/lib/analytics";
import { getRuntimeConfig, getServerRuntimeConfig, onRuntimeConfig } from "@/lib/runtime-config";

const t = content.vsl.booking;

/**
 * Strategy call scheduling.
 *
 *  - No external link, built-in scheduler on (admin) → the native scheduler.
 *  - Calendly link  → loaded inline only after the visitor asks for it, and
 *                     `strategy_call_confirmed` fires only when Calendly
 *                     reports a completed booking.
 *  - Any other link → opens in a new tab. A confirmation cannot be observed
 *                     from here, so the confirmed event is never fired.
 *  - Not configured → a clearly labelled setup placeholder.
 */
export function BookingEmbed({ placement }: { placement: string }) {
  const url = integrations.booking.url;
  const calendly = isCalendly(url);
  const [loaded, setLoaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const config = useSyncExternalStore(onRuntimeConfig, getRuntimeConfig, getServerRuntimeConfig);

  useEffect(() => {
    if (!calendly) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://calendly.com") return;
      const name = (event.data as { event?: unknown } | null)?.event;
      if (name === "calendly.event_scheduled") {
        setConfirmed(true);
        track("strategy_call_confirmed", { placement }, { once: true });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [calendly, placement]);

  if (!url && !config.loaded) return <div className="min-h-40 bg-ink ring-1 ring-paper/12" aria-hidden />;
  if (!url && config.nativeBooking) return <NativeBooking placement={placement} />;

  if (!url) {
    return (
      <div className="rounded-md border border-dashed border-lime/45 bg-ink p-6 sm:p-9">
        <Settings2 className="size-6 text-lime" strokeWidth={1.5} aria-hidden />
        <p className="mt-5 text-[1.375rem] font-medium tracking-[-0.03em]">{t.placeholderTitle}</p>
        <p className="mt-3 max-w-[52ch] font-mono text-[0.75rem] leading-relaxed text-mute">
          {t.placeholderBody}
        </p>
      </div>
    );
  }

  if (!calendly) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("strategy_call_click", { placement }, { once: true })}
        className={buttonClass("lime", "lg")}
      >
        <ButtonInner variant="lime">{content.cta.bookCall}</ButtonInner>
      </a>
    );
  }

  if (!loaded) {
    return (
      <div className="bg-ink p-6 ring-1 ring-paper/12 sm:p-9">
        <CalendarClock className="size-6 text-lime" strokeWidth={1.5} aria-hidden />
        <p className="mt-5 max-w-[30ch] text-[1.375rem] font-medium leading-tight tracking-[-0.03em]">
          {t.external}
        </p>
        <button
          type="button"
          onClick={() => {
            track("strategy_call_click", { placement }, { once: true });
            setLoaded(true);
          }}
          className={buttonClass("lime", "lg", "mt-7")}
        >
          <ButtonInner variant="lime" icon={<ArrowUpRight className="size-4" strokeWidth={1.75} />}>
            {content.cta.bookCall}
          </ButtonInner>
        </button>
      </div>
    );
  }

  const host = typeof window === "undefined" ? "" : window.location.hostname;
  const src = `${url}${url.includes("?") ? "&" : "?"}embed_domain=${encodeURIComponent(host)}&embed_type=Inline`;

  return (
    <div>
      {confirmed && (
        <p
          role="status"
          className="mb-4 flex items-center gap-3 bg-lime p-4 text-[0.9375rem] font-medium text-ink"
        >
          <Check className="size-4 shrink-0" aria-hidden />
          {t.confirmed}
        </p>
      )}
      <iframe
        src={src}
        title={content.cta.bookCall}
        loading="lazy"
        className="h-[44rem] w-full rounded-md bg-paper ring-1 ring-paper/12"
      />
    </div>
  );
}

/**
 * Anchor that scrolls to the booking block. The click event is de-duplicated
 * per page load, so this and the scheduler button never double-count.
 */
export function BookCallLink({
  placement,
  className,
  children,
}: {
  placement: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#book"
      className={className}
      onClick={() => track("strategy_call_click", { placement }, { once: true })}
    >
      {children}
    </a>
  );
}
