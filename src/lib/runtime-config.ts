"use client";

/**
 * Tag configuration at runtime.
 *
 * Starts from the NEXT_PUBLIC_* build-time values and is replaced by what is
 * saved in the admin (/api/config) as soon as that loads. Only public IDs
 * live here — access tokens stay on the server.
 */

import { integrations } from "@/config/integrations";

export type RuntimeConfig = {
  loaded: boolean;
  gtmId: string;
  ga4Id: string;
  googleAdsId: string;
  googleAdsLabels: Record<string, string>;
  metaPixelId: string;
  tiktokPixelId: string;
  nativeBooking: boolean;
};

const a = integrations.analytics;

let config: RuntimeConfig = {
  loaded: false,
  gtmId: a.gtmId ?? "",
  ga4Id: a.ga4Id ?? "",
  googleAdsId: a.googleAdsId ?? "",
  googleAdsLabels: Object.fromEntries(
    Object.entries(a.googleAdsLabels).map(([key, value]) => [key, value ?? ""]),
  ),
  metaPixelId: a.metaPixelId ?? "",
  tiktokPixelId: "",
  nativeBooking: false,
};

const SERVER_SNAPSHOT = config;
const listeners = new Set<() => void>();
let started = false;

export const getRuntimeConfig = () => config;
export const getServerRuntimeConfig = () => SERVER_SNAPSHOT;

export function onRuntimeConfig(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export const hasTags = (c: RuntimeConfig) =>
  Boolean(c.gtmId || c.ga4Id || c.googleAdsId || c.metaPixelId || c.tiktokPixelId);

/** Fetch the admin-managed configuration once per page load. */
export function loadRuntimeConfig() {
  if (started || typeof window === "undefined") return;
  started = true;
  fetch("/api/config", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null)
    .then((data: Partial<RuntimeConfig> | null) => {
      config = { ...config, ...(data ?? {}), loaded: true };
      listeners.forEach((fn) => fn());
    });
}
