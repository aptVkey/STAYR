import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Admin authentication: one password (ADMIN_PASSWORD) and a signed,
 * httpOnly session cookie. Every /api/admin route verifies the signature;
 * the proxy only checks that a cookie exists, to redirect to the login.
 */

export const ADMIN_COOKIE = "stayr_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

const password = () => process.env.ADMIN_PASSWORD?.trim() || "";
const secret = () =>
  process.env.ADMIN_SESSION_SECRET?.trim() || `stayr-session:${password()}`;

export const adminConfigured = () => password().length >= 8;

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(candidate: string) {
  if (!adminConfigured()) return false;
  // Compare digests so length differences do not leak through timing.
  return safeEqual(sign(`pw:${candidate}`), sign(`pw:${password()}`));
}

export function createSessionToken() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  return `${expires}.${sign(expires)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(expires))) return false;
  return Number(expires) > Date.now();
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

export const isAdmin = (request: Request) =>
  verifySessionToken(readCookie(request, ADMIN_COOKIE));

/** Returns a 401 response when the request is not an authenticated admin. */
export function requireAdmin(request: Request) {
  if (isAdmin(request)) return null;
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export const sessionCookie = (token: string) => ({
  name: ADMIN_COOKIE,
  value: token,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: MAX_AGE,
  path: "/",
});
