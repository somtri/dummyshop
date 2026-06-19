import { requireAdminToken } from "@/lib/auth";
import { resetMutableState } from "@/lib/store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  resetMutableState();
  return NextResponse.json({ ok: true, resetAt: new Date().toISOString() });
}
