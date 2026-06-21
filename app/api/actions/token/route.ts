import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { issueCapabilityToken, type CapabilityScope } from "@/lib/capability";

const ALLOWED_SCOPES: CapabilityScope[] = ["shop:read", "shop:cart"];

export async function POST(request: Request) {
  const sessionId = getSessionId(request);
  const body = await request.json().catch(() => ({}));
  const scope = body.scope as CapabilityScope;
  if (!ALLOWED_SCOPES.includes(scope)) {
    return NextResponse.json({ error: "invalid_scope" }, { status: 400 });
  }
  const token = issueCapabilityToken(sessionId, scope);
  return NextResponse.json({ token });
}
