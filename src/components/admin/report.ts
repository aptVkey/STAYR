export type Totals = {
  pageviews: number;
  visitors: number;
  mql: number;
  sql: number;
  customers: number;
  revenue: number;
};

export type Report = {
  ok: boolean;
  days: number;
  from: number;
  to: number;
  current: Totals;
  previous: Totals;
  series: Array<{ day: string; visitors: number; pageviews: number }>;
  channels: Array<{
    channel: string;
    visitors: number;
    pageviews: number;
    mql: number;
    sql: number;
    customers: number;
  }>;
  pages: Array<{ path: string; pageviews: number; visitors: number }>;
  sources: Array<{ source: string; channel: string; visitors: number }>;
  campaigns: Array<{ campaign: string; source: string; visitors: number }>;
  devices: Array<{ device: string; visitors: number }>;
  countries: Array<{ country: string; visitors: number }>;
  events: Record<string, { total: number; visitors: number }>;
  hasDemo: boolean;
};

export const PERIODS = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];
