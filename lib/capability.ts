import { createHash } from "node:crypto";

export type CapabilityScope = "shop:read" | "shop:cart" | "jobs:read" | "jobs:save" | "clinic:read" | "clinic:book";

export interface Capability {
  sessionId: string;
  scope: CapabilityScope;
  expiresAt: number; // unix ms
}

const CAP_SECRET = process.env.CAPABILITY_SECRET ?? "dev-capability-secret-do-not-use-in-prod";

function sign(payload: string): string {
  return createHash("sha256").update(`${CAP_SECRET}:${payload}`).digest("hex").slice(0, 16);
}

export function issueCapabilityToken(sessionId: string, scope: CapabilityScope, ttlMs = 30 * 60 * 1000): string {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${sessionId}:${scope}:${expiresAt}`;
  const sig = sign(payload);
  return Buffer.from(JSON.stringify({ sessionId, scope, expiresAt, sig })).toString("base64url");
}

export function verifyCapabilityToken(token: string): { ok: true; cap: Capability } | { ok: false; error: string } {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString());
    const { sessionId, scope, expiresAt, sig } = decoded;
    if (!sessionId || !scope || !expiresAt) return { ok: false, error: "malformed_token" };
    const payload = `${sessionId}:${scope}:${expiresAt}`;
    if (sign(payload) !== sig) return { ok: false, error: "invalid_signature" };
    if (Date.now() > expiresAt) return { ok: false, error: "expired" };
    return { ok: true, cap: { sessionId, scope, expiresAt } };
  } catch {
    return { ok: false, error: "malformed_token" };
  }
}
