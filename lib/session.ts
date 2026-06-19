// HMAC-signed session cookie (httpOnly). No password — internal trusted env.
// Token format: base64url(JSON payload) + "." + base64url(HMAC-SHA256).

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { Role } from "@/config/roster";

export const SESSION_COOKIE = "gem_session";

const SECRET = process.env.SESSION_SECRET || "gem-dev-secret-change-me";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 hours

export interface Session {
  userId: string;
  role: Role;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(str: string): Buffer {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", SECRET).update(payload).digest());
}

export function createToken(session: Session): string {
  const payload = b64url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined | null): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(payload);
  // Constant-time comparison.
  const a = fromB64url(sig);
  const b = fromB64url(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(fromB64url(payload).toString("utf8"));
    if (
      parsed &&
      typeof parsed.userId === "string" &&
      (parsed.role === "voter" || parsed.role === "btc")
    ) {
      return { userId: parsed.userId, role: parsed.role };
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Read + verify the session cookie (server components & route handlers). */
export function getSession(): Session | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}

export const cookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SEC,
};
