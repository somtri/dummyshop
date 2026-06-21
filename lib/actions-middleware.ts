import { NextResponse } from "next/server";
import { verifyCapabilityToken, type CapabilityScope } from "@/lib/capability";

export function requireCapability(authHeader: string | null, requiredScope: CapabilityScope) {
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "missing_capability_token" }, { status: 401 }), cap: null };
  }
  const token = authHeader.slice(7);
  const result = verifyCapabilityToken(token);
  if (!result.ok) {
    return { error: NextResponse.json({ error: result.error }, { status: 401 }), cap: null };
  }
  if (result.cap.scope !== requiredScope) {
    return { error: NextResponse.json({ error: "wrong_scope" }, { status: 403 }), cap: null };
  }
  return { error: null, cap: result.cap };
}
