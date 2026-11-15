// Demo data for previewing the admin. Everything it writes is flagged
// (demo = 1) and the admin shows a banner while any of it exists.
//
//   npm run demo:seed    add ~30 days of sample traffic, leads and calls
//   npm run demo:clear   remove every demo row (real data is untouched)
//
// Run the site once first (npm run dev) so the database tables exist.

import { createClient } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), ".data");
mkdirSync(dir, { recursive: true });
const db = createClient({
  url: process.env.DATABASE_URL?.trim() || `file:${path.join(dir, "stayr.db")}`,
  authToken: process.env.DATABASE_AUTH_TOKEN?.trim() || undefined,
});

async function clear() {
  await db.batch(
    [
      "DELETE FROM activities WHERE contact_id IN (SELECT id FROM contacts WHERE demo = 1)",
      "DELETE FROM bookings WHERE demo = 1",
      "DELETE FROM contacts WHERE demo = 1",
      "DELETE FROM events WHERE demo = 1",
    ],
    "write",
  );
}

// Deterministic pseudo-random numbers, so the preview looks the same each time.
let seed = 42;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (list) => list[Math.floor(rand() * list.length)];
const weighted = (pairs) => {
  const total = pairs.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [value, w] of pairs) if ((r -= w) <= 0) return value;
  return pairs[0][0];
};

const DAY = 86_400_000;
const SOURCES = [
  [{ channel: "Paid Social", source: "facebook", medium: "paid_social", campaign: "pt_hotels_prospecting" }, 34],
  [{ channel: "Paid Social", source: "tiktok", medium: "paid_social", campaign: "es_boutique_video" }, 12],
  [{ channel: "Paid Search", source: "google", medium: "cpc", campaign: "brand_search" }, 18],
  [{ channel: "Organic Search", source: "google.com", medium: "", campaign: "" }, 14],
  [{ channel: "Organic Social", source: "linkedin.com", medium: "", campaign: "" }, 8],
  [{ channel: "Referral", source: "hospitalitynet.org", medium: "", campaign: "" }, 4],
  [{ channel: "Direct", source: "", medium: "", campaign: "" }, 10],
];
const NAMES = ["Marta Silva", "João Costa", "Lucía Fernández", "James Whitfield", "Inês Rocha", "Pablo Ortega", "Sofia Almeida", "Tom Becker", "Carla Nunes", "Diego Ramos", "Emma Clarke", "Rui Tavares"];
const HOTELS = ["Casa do Vale", "Hotel Miradouro", "Quinta da Serra", "Albor Suites", "Palacete Douro", "Finca Azahar", "The Harbour Rooms", "Mar & Sal Resort"];

async function seedDemo() {
  await clear();
  const now = Date.now();
  const statements = [];
  const event = (ts, type, pagePath, visitor, s, placement = "") =>
    statements.push({
      sql: `INSERT INTO events (ts, day, type, path, visitor, channel, source, medium, campaign, device, country, placement, demo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [ts, new Date(ts).toISOString().slice(0, 10), type, pagePath, visitor, s.channel, s.source, s.medium, s.campaign,
        weighted([["Mobile", 58], ["Desktop", 37], ["Tablet", 5]]), weighted([["PT", 45], ["ES", 25], ["GB", 20], ["FR", 10]]), placement],
    });

  const leads = [];
  for (let d = 29; d >= 0; d--) {
    const dayStart = Math.floor(now / DAY) * DAY - d * DAY;
    const weekend = [0, 6].includes(new Date(dayStart).getUTCDay());
    const visitors = Math.round((70 + (29 - d) * 2.2 + rand() * 40) * (weekend ? 0.6 : 1));
    for (let v = 0; v < visitors; v++) {
      const ts = dayStart + Math.floor(rand() * DAY * 0.95);
      if (ts > now) continue;
      const s = weighted(SOURCES);
      const id = randomUUID().slice(0, 24);
      event(ts, "pageview", "/", id, s);
      if (rand() < 0.22) event(ts + 20_000, "hero_cta_click", "/", id, s, "hero");
      if (rand() < 0.16) {
        event(ts + 30_000, "optin_modal_open", "/", id, s, "hero");
        if (rand() < 0.42) {
          event(ts + 70_000, "optin_submit", "/", id, s, "hero");
          event(ts + 75_000, "pageview", "/case-study", id, s);
          if (rand() < 0.8) event(ts + 90_000, "vsl_play", "/case-study", id, s);
          if (rand() < 0.5) event(ts + 300_000, "vsl_50_percent", "/case-study", id, s);
          if (rand() < 0.25) event(ts + 700_000, "vsl_complete", "/case-study", id, s);
          leads.push({ ts: ts + 70_000, s });
        }
      }
      if (rand() < 0.07) event(ts + 40_000, "pageview", "/apply", id, s);
      if (rand() < 0.04) event(ts + 50_000, "pageview", "/book", id, s);
    }
  }

  leads.forEach((lead, i) => {
    const id = randomUUID();
    const name = NAMES[i % NAMES.length];
    const isSql = rand() < 0.3;
    const won = isSql && rand() < 0.3;
    const lost = !won && rand() < 0.12;
    const sqlAt = isSql ? Math.min(lead.ts + Math.floor(rand() * 3 * DAY), now) : null;
    const wonAt = won ? Math.min(sqlAt + Math.floor(rand() * 6 * DAY), now) : null;
    const stage = won ? "customer" : lost ? "lost" : isSql ? "sql" : "mql";
    statements.push({
      sql: `INSERT INTO contacts (id, email, name, company, stage, deal_value, channel, source, campaign, attribution,
              created_at, updated_at, mql_at, sql_at, won_at, lost_at, demo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?, ?, ?, ?, ?, ?, 1)`,
      args: [id, `lead${i + 1}@demo.invalid`, name, pick(HOTELS), stage, won ? weighted([[25000, 2], [30000, 1]]) : 0,
        lead.s.channel, lead.s.source, lead.s.campaign, lead.ts, wonAt ?? sqlAt ?? lead.ts, lead.ts, sqlAt, wonAt,
        lost ? lead.ts + DAY : null],
    });
    statements.push({
      sql: "INSERT INTO activities (contact_id, ts, type, data) VALUES (?, ?, 'optin', ?)",
      args: [id, lead.ts, JSON.stringify({ placement: "hero" })],
    });
    if (isSql) {
      const start = Math.floor((sqlAt + (1 + Math.floor(rand() * 5)) * DAY) / 1_800_000) * 1_800_000;
      statements.push({
        sql: `INSERT INTO bookings (id, contact_id, start_ts, end_ts, status, created_at, demo) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        args: [randomUUID(), id, start, start + 1_800_000, start < now ? "completed" : "confirmed", sqlAt],
      });
      statements.push({
        sql: "INSERT INTO activities (contact_id, ts, type, data) VALUES (?, ?, 'booking', ?)",
        args: [id, sqlAt, JSON.stringify({ start, end: start + 1_800_000 })],
      });
    }
  });

  for (let i = 0; i < statements.length; i += 400) await db.batch(statements.slice(i, i + 400), "write");
  console.log(`Demo data added: ${statements.length} rows. Remove with: npm run demo:clear`);
}

const command = process.argv[2];
try {
  if (command === "seed") await seedDemo();
  else if (command === "clear") {
    await clear();
    console.log("Demo data removed.");
  } else console.log("Usage: node scripts/demo.mjs seed|clear");
} catch (error) {
  console.error("Could not update demo data. Run the site once first (npm run dev) so the tables exist.\n", error.message);
  process.exit(1);
}
