// Database schema (Postgres). Shared by the app (src/lib/db.ts) and
// scripts/demo.mjs, so it is plain JavaScript. Every statement is idempotent.
//
// Row Level Security is switched on for every table and no policy is
// created: Supabase exposes the `public` schema through its REST API with
// the public anon key, and these tables hold personal data and ad-platform
// tokens. With RLS on and no policy, that API sees nothing. The app connects
// with the database role, which bypasses RLS.

export const TABLES = ["settings", "events", "contacts", "activities", "bookings"];

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL,
     updated_at BIGINT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS events (
     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     ts BIGINT NOT NULL,
     day TEXT NOT NULL,
     type TEXT NOT NULL,
     path TEXT NOT NULL DEFAULT '',
     visitor TEXT NOT NULL,
     channel TEXT NOT NULL DEFAULT 'Direct',
     source TEXT NOT NULL DEFAULT '',
     medium TEXT NOT NULL DEFAULT '',
     campaign TEXT NOT NULL DEFAULT '',
     device TEXT NOT NULL DEFAULT '',
     country TEXT NOT NULL DEFAULT '',
     placement TEXT NOT NULL DEFAULT '',
     demo INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS events_ts ON events (ts)`,
  `CREATE INDEX IF NOT EXISTS events_type_ts ON events (type, ts)`,
  `CREATE TABLE IF NOT EXISTS contacts (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL DEFAULT '',
     company TEXT NOT NULL DEFAULT '',
     website TEXT NOT NULL DEFAULT '',
     country TEXT NOT NULL DEFAULT '',
     business_type TEXT NOT NULL DEFAULT '',
     properties TEXT NOT NULL DEFAULT '',
     budget TEXT NOT NULL DEFAULT '',
     objective TEXT NOT NULL DEFAULT '',
     stage TEXT NOT NULL DEFAULT 'mql',
     deal_value BIGINT NOT NULL DEFAULT 0,
     marketing_consent INTEGER NOT NULL DEFAULT 0,
     ad_consent INTEGER NOT NULL DEFAULT 0,
     channel TEXT NOT NULL DEFAULT 'Direct',
     source TEXT NOT NULL DEFAULT '',
     campaign TEXT NOT NULL DEFAULT '',
     attribution TEXT NOT NULL DEFAULT '{}',
     created_at BIGINT NOT NULL,
     updated_at BIGINT NOT NULL,
     mql_at BIGINT,
     sql_at BIGINT,
     won_at BIGINT,
     lost_at BIGINT,
     demo INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS contacts_stage ON contacts (stage)`,
  `CREATE TABLE IF NOT EXISTS activities (
     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     contact_id TEXT NOT NULL,
     ts BIGINT NOT NULL,
     type TEXT NOT NULL,
     data TEXT NOT NULL DEFAULT '{}'
   )`,
  `CREATE INDEX IF NOT EXISTS activities_contact ON activities (contact_id, ts)`,
  `CREATE TABLE IF NOT EXISTS bookings (
     id TEXT PRIMARY KEY,
     contact_id TEXT NOT NULL,
     start_ts BIGINT NOT NULL,
     end_ts BIGINT NOT NULL,
     status TEXT NOT NULL DEFAULT 'confirmed',
     visitor_tz TEXT NOT NULL DEFAULT '',
     notes TEXT NOT NULL DEFAULT '',
     created_at BIGINT NOT NULL,
     demo INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS bookings_start ON bookings (start_ts)`,
  ...TABLES.map((table) => `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`),
];
