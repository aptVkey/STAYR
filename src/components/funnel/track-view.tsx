"use client";

import { useEffect } from "react";
import { track, type FunnelEvent } from "@/lib/analytics";

/** Fires a page-level funnel event once per page load. */
export function TrackView({ event }: { event: FunnelEvent }) {
  useEffect(() => {
    track(event, {}, { once: true });
  }, [event]);
  return null;
}
