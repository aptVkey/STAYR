import "server-only";

import { createClient, type Client, type InValue } from "@libsql/client";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Database (libSQL / SQLite).
 *
 *   DATABASE_URL unset        → a local SQLite file at .data/stayr.db. Fine for
 *                               development and for a single server with a
 *                               persistent disk.
 *   DATABASE_URL=libsql://…   → a hosted libSQL / Turso database (required on
 *                               serverless hosts, whose disks are not persistent).
 *                               Pair it with DATABASE_AUTH_TOKEN.
 */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL,
     updated_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS events (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     ts INTEGER NOT NULL,
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
     deal_value INTEGER NOT NULL DEFAULT 0,
     marketing_consent INTEGER NOT NULL DEFAULT 0,
     ad_consent INTEGER NOT NULL DEFAULT 0,
     channel TEXT NOT NULL DEFAULT 'Direct',
     source TEXT NOT NULL DEFAULT '',
     campaign TEXT NOT NULL DEFAULT '',
     attribution TEXT NOT NULL DEFAULT '{}',
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL,
     mql_at INTEGER,
     sql_at INTEGER,
     won_at INTEGER,
     lost_at INTEGER,
     demo INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS contacts_stage ON contacts (stage)`,
  `CREATE TABLE IF NOT EXISTS activities (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     contact_id TEXT NOT NULL,
     ts INTEGER NOT NULL,
     type TEXT NOT NULL,
     data TEXT NOT NULL DEFAULT '{}'
   )`,
  `CREATE INDEX IF NOT EXISTS activities_contact ON activities (contact_id, ts)`,
  `CREATE TABLE IF NOT EXISTS bookings (
     id TEXT PRIMARY KEY,
     contact_id TEXT NOT NULL,
     start_ts INTEGER NOT NULL,
     end_ts INTEGER NOT NULL,
     status TEXT NOT NULL DEFAULT 'confirmed',
     visitor_tz TEXT NOT NULL DEFAULT '',
     notes TEXT NOT NULL DEFAULT '',
     created_at INTEGER NOT NULL,
     demo INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS bookings_start ON bookings (start_ts)`,
];

type Global = typeof globalThis & {
  __stayrDb?: { client: Client; ready: Promise<void> };
};

function connect() {
  const g = globalThis as Global;
  if (g.__stayrDb) return g.__stayrDb;

  let url = process.env.DATABASE_URL?.trim();
  if (!url) {
    const dir = path.join(process.cwd(), ".data");
    mkdirSync(dir, { recursive: true });
    url = `file:${path.join(dir, "stayr.db")}`;
  }
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN?.trim() || undefined,
  });
  const ready = client.batch(SCHEMA, "write").then(() => undefined);
  g.__stayrDb = { client, ready };
  return g.__stayrDb;
}

export type Row = Record<string, unknown>;

export async function query<T = Row>(sql: string, args: InValue[] = []) {
  const db = connect();
  await db.ready;
  const result = await db.client.execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function run(sql: string, args: InValue[] = []) {
  const db = connect();
  await db.ready;
  return db.client.execute({ sql, args });
}

export async function batch(statements: Array<{ sql: string; args: InValue[] }>) {
  const db = connect();
  await db.ready;
  return db.client.batch(statements, "write");
}

export const num = (value: unknown) => Number(value ?? 0);
export const str = (value: unknown) => (value == null ? "" : String(value));
