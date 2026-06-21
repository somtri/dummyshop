import { checkoutSchema } from "@/lib/validators";
import { createOrder } from "@/lib/backend";
import { getSessionId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const sessionId = getSessionId(request);
  const payload = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const result = await createOrder(parsed.data, sessionId);
  if (result.error === "empty_cart") return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  return NextResponse.json({ order: result.order }, { status: 201 });
}
