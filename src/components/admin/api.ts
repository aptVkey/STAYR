"use client";

import { useCallback, useEffect, useState } from "react";

/** Full page load, so the proxy re-reads the session cookie. */
export function hardNavigate(path: string) {
  window.location.assign(path);
}

/** Call an admin API route. A 401 sends the browser to the login. */
export async function api<T = Record<string, unknown>>(
  url: string,
  options: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: options.body === undefined ? undefined : { "content-type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });
  if (response.status === 401 && typeof window !== "undefined") {
    hardNavigate("/admin/login");
  }
  const data = (await response.json().catch(() => ({}))) as T;
  return { ok: response.ok, status: response.status, data };
}

type State<T> = { key: string; data: T | null; error: boolean };

/** Load JSON from an admin route; `reload()` fetches it again in place. */
export function useApi<T>(url: string) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<State<T>>({ key: "", data: null, error: false });

  useEffect(() => {
    let cancelled = false;
    api<T>(url)
      .then((result) => {
        if (cancelled) return;
        setState({ key: url, data: result.ok ? result.data : null, error: !result.ok });
      })
      .catch(() => {
        if (!cancelled) setState({ key: url, data: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [url, version]);

  const reload = useCallback(() => setVersion((n) => n + 1), []);
  const current = state.key === url;
  return {
    data: current ? state.data : null,
    error: current && state.error,
    loading: !current,
    reload,
  };
}

/* ── Formatting (pt-PT) ──────────────────────────────────────── */

const nf = new Intl.NumberFormat("pt-PT");
const compact = new Intl.NumberFormat("pt-PT", { notation: "compact", maximumFractionDigits: 1 });
const eur = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const fmtNumber = (value: number) => (value >= 10_000 ? compact.format(value) : nf.format(value));
export const fmtFull = (value: number) => nf.format(value);
export const fmtEuro = (value: number) => eur.format(value);
export const fmtPercent = (ratio: number) =>
  `${(ratio * 100).toLocaleString("pt-PT", { maximumFractionDigits: ratio < 0.1 ? 1 : 0 })}%`;

export const fmtDate = (instant: number, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat("pt-PT", options).format(new Date(instant));
export const fmtDateTime = (instant: number) =>
  fmtDate(instant, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export const fmtTime = (instant: number) => fmtDate(instant, { hour: "2-digit", minute: "2-digit" });

export const CHANNEL_LABEL: Record<string, string> = {
  "Paid Social": "Social pago",
  "Paid Search": "Pesquisa paga",
  "Organic Search": "Pesquisa orgânica",
  "Organic Social": "Social orgânico",
  Email: "Email",
  Referral: "Referência",
  Direct: "Direto",
};

export const STAGE_LABEL: Record<string, string> = {
  mql: "MQL",
  sql: "SQL",
  customer: "Cliente",
  lost: "Perdido",
};
export const STAGE_HINT: Record<string, string> = {
  mql: "Opt-in no case study",
  sql: "Reunião agendada",
  customer: "Negócio fechado",
  lost: "Não avançou",
};
