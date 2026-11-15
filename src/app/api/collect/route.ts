import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { classifyTraffic } from "@/lib/channels";
import { run } from "@/lib/db";
import { clientKey, rateLimited, sanitizeAttribution } from "@/lib/leads";
import { getVisitorSalt } from "@/lib/settings";
import { clean } from "@/lib/validation";

/**
 * POST /api/collect — first-party, cookieless analytics.
 *
 * Stores a page view or funnel event with the traffic channel, device class
 * and (when the host provides it) country. No cookie is set and no IP
 * address is stored: visitors are counted with a hash of IP + user agent
 * that is salted per day, so it cannot be linked across days or to a person.
 */

const EVENTS = new Set([
  "pageview",
  "hero_cta_click",
  "optin_modal_open",
  "optin_submit",
  "vsl_play",
  "vsl_25_percent",
  "vsl_50_percent",
  "vsl_75_percent",
  "vsl_complete",
  "application_start",
  "application_submit",
  "strategy_call_click",
  "strategy_call_confirmed",
]);

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|pingdom|curl|wget|python|axios|node-fetch/i;

const device = (ua: string) =>
  /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|iphone|android/i.test(ua) ? "Mobile" : "Desktop";

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  const ip = clientKey(request);
  if (!ua || BOT.test(ua) || rateLimited(`collect:${ip}`, 120)) {
    return new NextResponse(null, { status: 204 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const type = clean(body.type, 40);
  const path = clean(body.path, 200).split(/[?#]/)[0];
  if (!EVENTS.has(type) || !path.startsWith("/") || path.startsWith("/admin")) {
    return new NextResponse(null, { status: 204 });
  }

  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  const visitor = createHash("sha256")
    .update(`${await getVisitorSalt()}|${day}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 24);
  const traffic = classifyTraffic(sanitizeAttribution(body.attribution));
  const country = (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    ""
  )
    .slice(0, 2)
    .toUpperCase();

  try {
    await run(
      `INSERT INTO events (ts, day, type, path, visitor, channel, source, medium, campaign, device, country, placement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        now,
        day,
        type,
        path,
        visitor,
        traffic.channel,
        traffic.source,
        traffic.medium,
        traffic.campaign,
        device(ua),
        country,
        clean(body.placement, 60),
      ],
    );
  } catch (error) {
    console.error("[collect] could not store event:", error);
  }
  return new NextResponse(null, { status: 204 });
}
