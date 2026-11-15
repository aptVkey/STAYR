import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { CHANNELS } from "@/lib/channels";
import { num, query, str } from "@/lib/db";

const DAY = 86_400_000;

/** GET /api/admin/overview?days=30 — funnel, traffic and channel report. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const requested = Number(new URL(request.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(requested) ? requested : 30;

  const now = Date.now();
  const endOfToday = Math.floor(now / DAY) * DAY + DAY;
  const from = endOfToday - days * DAY;
  const prevFrom = from - days * DAY;

  const traffic = async (a: number, b: number) => {
    const row = (
      await query(
        `SELECT COUNT(*) AS pageviews, COUNT(DISTINCT visitor) AS visitors
         FROM events WHERE type = 'pageview' AND ts >= ? AND ts < ?`,
        [a, b],
      )
    )[0];
    return { pageviews: num(row?.pageviews), visitors: num(row?.visitors) };
  };
  const stages = async (a: number, b: number) => {
    const row = (
      await query(
        `SELECT
           SUM(CASE WHEN mql_at >= ?1 AND mql_at < ?2 THEN 1 ELSE 0 END) AS mql,
           SUM(CASE WHEN sql_at >= ?1 AND sql_at < ?2 THEN 1 ELSE 0 END) AS sql,
           SUM(CASE WHEN won_at >= ?1 AND won_at < ?2 THEN 1 ELSE 0 END) AS customers,
           SUM(CASE WHEN won_at >= ?1 AND won_at < ?2 THEN deal_value ELSE 0 END) AS revenue
         FROM contacts`,
        [a, b],
      )
    )[0];
    return {
      mql: num(row?.mql),
      sql: num(row?.sql),
      customers: num(row?.customers),
      revenue: num(row?.revenue),
    };
  };

  try {
    const [current, previous, currentStages, previousStages] = await Promise.all([
      traffic(from, endOfToday),
      traffic(prevFrom, from),
      stages(from, endOfToday),
      stages(prevFrom, from),
    ]);

    const range = [from, endOfToday];
    const [daily, channelTraffic, channelContacts, pages, sources, campaigns, devices, countries, events, demo] =
      await Promise.all([
        query(
          `SELECT day, COUNT(*) AS pageviews, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND ts >= ? AND ts < ? GROUP BY day`,
          range,
        ),
        query(
          `SELECT channel, COUNT(*) AS pageviews, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND ts >= ? AND ts < ? GROUP BY channel`,
          range,
        ),
        query(
          `SELECT channel,
             SUM(CASE WHEN mql_at >= ?1 AND mql_at < ?2 THEN 1 ELSE 0 END) AS mql,
             SUM(CASE WHEN sql_at >= ?1 AND sql_at < ?2 THEN 1 ELSE 0 END) AS sql,
             SUM(CASE WHEN won_at >= ?1 AND won_at < ?2 THEN 1 ELSE 0 END) AS customers
           FROM contacts GROUP BY channel`,
          range,
        ),
        query(
          `SELECT path, COUNT(*) AS pageviews, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND ts >= ? AND ts < ?
           GROUP BY path ORDER BY pageviews DESC LIMIT 8`,
          range,
        ),
        query(
          `SELECT source, channel, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND source != '' AND ts >= ? AND ts < ?
           GROUP BY source, channel ORDER BY visitors DESC LIMIT 8`,
          range,
        ),
        query(
          `SELECT campaign, source, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND campaign != '' AND ts >= ? AND ts < ?
           GROUP BY campaign, source ORDER BY visitors DESC LIMIT 8`,
          range,
        ),
        query(
          `SELECT device, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND ts >= ? AND ts < ? GROUP BY device ORDER BY visitors DESC`,
          range,
        ),
        query(
          `SELECT country, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND country != '' AND ts >= ? AND ts < ?
           GROUP BY country ORDER BY visitors DESC LIMIT 8`,
          range,
        ),
        query(
          `SELECT type, COUNT(*) AS total, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type != 'pageview' AND ts >= ? AND ts < ? GROUP BY type`,
          range,
        ),
        query(
          `SELECT (SELECT COUNT(*) FROM events WHERE demo = 1) + (SELECT COUNT(*) FROM contacts WHERE demo = 1) AS n`,
        ),
      ]);

    const byDay = new Map(daily.map((row) => [str(row.day), row]));
    const series = Array.from({ length: days }, (_, i) => {
      const day = new Date(from + i * DAY).toISOString().slice(0, 10);
      const row = byDay.get(day);
      return { day, visitors: num(row?.visitors), pageviews: num(row?.pageviews) };
    });

    const contactsByChannel = new Map(channelContacts.map((row) => [str(row.channel), row]));
    const trafficByChannel = new Map(channelTraffic.map((row) => [str(row.channel), row]));
    const channels = CHANNELS.map((channel) => ({
      channel,
      visitors: num(trafficByChannel.get(channel)?.visitors),
      pageviews: num(trafficByChannel.get(channel)?.pageviews),
      mql: num(contactsByChannel.get(channel)?.mql),
      sql: num(contactsByChannel.get(channel)?.sql),
      customers: num(contactsByChannel.get(channel)?.customers),
    }))
      .filter((c) => c.visitors || c.mql || c.sql || c.customers)
      .sort((a, b) => b.visitors - a.visitors || b.mql - a.mql);

    return NextResponse.json({
      ok: true,
      days,
      from,
      to: endOfToday,
      current: { ...current, ...currentStages },
      previous: { ...previous, ...previousStages },
      series,
      channels,
      pages: pages.map((r) => ({ path: str(r.path), pageviews: num(r.pageviews), visitors: num(r.visitors) })),
      sources: sources.map((r) => ({ source: str(r.source), channel: str(r.channel), visitors: num(r.visitors) })),
      campaigns: campaigns.map((r) => ({
        campaign: str(r.campaign),
        source: str(r.source),
        visitors: num(r.visitors),
      })),
      devices: devices.map((r) => ({ device: str(r.device) || "—", visitors: num(r.visitors) })),
      countries: countries.map((r) => ({ country: str(r.country), visitors: num(r.visitors) })),
      events: Object.fromEntries(events.map((r) => [str(r.type), { total: num(r.total), visitors: num(r.visitors) }])),
      hasDemo: num(demo[0]?.n) > 0,
    });
  } catch (error) {
    console.error("[admin] overview failed:", error);
    return NextResponse.json({ ok: false, error: "database" }, { status: 500 });
  }
}
