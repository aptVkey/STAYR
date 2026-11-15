import "server-only";

import path from "node:path";
import pg from "pg";
import { SCHEMA } from "./schema.mjs";
import { SUPABASE_ROOT_CA } from "./supabase-ca";

/**
 * Database (Postgres).
 *
 *   DATABASE_URL set   → that Postgres database. Built for Supabase: use the
 *                        connection pooler string from Project → Connect
 *                        (Supavisor, port 6543 "transaction" or 5432 "session").
 *                        Serverless hosts such as Vercel need the pooler.
 *   not set, dev only  → an embedded Postgres (PGlite) stored in
 *                        .data/pglite, so the project runs with zero setup.
 *   not set, production → every query fails with a clear error. Nothing is
 *                        ever stored somewhere that will not persist.
 */

export type Row = Record<string, unknown>;
type Statement = { sql: string; args: unknown[] };

interface Driver {
  query(sql: string, args: unknown[]): Promise<Row[]>;
  batch(statements: Statement[]): Promise<void>;
}

// BIGINT columns hold millisecond timestamps: safely inside a JS number.
pg.types.setTypeParser(20, (value) => Number(value));

/** `?` and `?N` placeholders (as written throughout the app) → `$n`. */
function toPositional(sql: string) {
  let next = 0;
  return sql.replace(/\?(\d+)?/g, (_, n?: string) => `$${n ?? ++next}`);
}

/**
 * TLS with certificate verification. Supabase signs its database
 * certificates with its own root CA, bundled in ./supabase-ca.ts;
 * DATABASE_CA_CERT (PEM) overrides it for any other provider.
 */
function tlsOptions(url: string): pg.PoolConfig["ssl"] {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    /* an unparsable URL fails on connect with a clear message */
  }
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return undefined;
  const custom = process.env.DATABASE_CA_CERT?.trim().replace(/\\n/g, "\n");
  if (custom) return { ca: custom, rejectUnauthorized: true };
  if (/\.supabase\.(com|co)$/.test(host)) return { ca: SUPABASE_ROOT_CA, rejectUnauthorized: true };
  return { rejectUnauthorized: true };
}

function pgDriver(url: string): Driver {
  // sslmode in the URL would override the verified TLS settings below.
  const connectionString = url.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "");
  const pool = new pg.Pool({
    connectionString,
    ssl: tlsOptions(url),
    // One connection per serverless instance: the pooler does the pooling.
    max: process.env.VERCEL ? 1 : 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
  return {
    async query(sql, args) {
      const result = await pool.query(toPositional(sql), args as unknown[]);
      return result.rows as Row[];
    },
    async batch(statements) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const s of statements) await client.query(toPositional(s.sql), s.args as unknown[]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

async function pgliteDriver(): Promise<Driver> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(path.join(process.cwd(), ".data", "pglite"));
  await db.waitReady;
  return {
    async query(sql, args) {
      const result = await db.query(toPositional(sql), args as unknown[]);
      return result.rows as Row[];
    },
    async batch(statements) {
      await db.transaction(async (tx) => {
        for (const s of statements) await tx.query(toPositional(s.sql), s.args as unknown[]);
      });
    },
  };
}

async function ensureSchema(driver: Driver) {
  const existing = await driver.query("SELECT to_regclass('public.bookings') AS t", []);
  if (existing[0]?.t) return;
  // The lock stops two cold serverless instances from creating tables at once.
  await driver.batch([
    { sql: "SELECT pg_advisory_xact_lock(7283461)", args: [] },
    ...SCHEMA.map((sql) => ({ sql, args: [] })),
  ]);
}

type Global = typeof globalThis & { __stayrDb?: Promise<Driver> };

function connect(): Promise<Driver> {
  const g = globalThis as Global;
  g.__stayrDb ??= (async () => {
    const url = process.env.DATABASE_URL?.trim();
    if (!url && process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set. Add your Supabase connection string to the environment.");
    }
    const driver = url ? pgDriver(url) : await pgliteDriver();
    await ensureSchema(driver);
    return driver;
  })().catch((error) => {
    // Do not cache a failed connection: the next request retries.
    g.__stayrDb = undefined;
    throw error;
  });
  return g.__stayrDb;
}

export async function query<T = Row>(sql: string, args: unknown[] = []) {
  const driver = await connect();
  return (await driver.query(sql, args)) as unknown as T[];
}

export async function run(sql: string, args: unknown[] = []) {
  const driver = await connect();
  await driver.query(sql, args);
}

export async function batch(statements: Statement[]) {
  const driver = await connect();
  await driver.batch(statements);
}

export const num = (value: unknown) => Number(value ?? 0);
export const str = (value: unknown) => (value == null ? "" : String(value));
