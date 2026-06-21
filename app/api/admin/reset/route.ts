import { requireAdminToken } from "@/lib/auth";
import { resetShopState } from "@/lib/backend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const sessionId: string = typeof body?.sessionId === "string" ? body.sessionId : "default";

  try {
    await resetShopState(sessionId);
    return NextResponse.json({ ok: true, resetAt: new Date().toISOString() });
  } catch (error) {
    if (error instanceof Error && error.message === "storage_unavailable") {
      return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "unexpected_error" }, { status: 500 });
  }
}
