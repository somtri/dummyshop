import { requireAdminToken } from "@/lib/auth";
import { verifyBenchmark } from "@/lib/verify";
import { verifySchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const payload = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  return NextResponse.json(verifyBenchmark(parsed.data.expect));
}
