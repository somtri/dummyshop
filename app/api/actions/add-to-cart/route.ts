import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/actions-middleware";
import { addCartItem } from "@/lib/backend";

export async function POST(request: Request) {
  const { error, cap } = requireCapability(request.headers.get("authorization"), "shop:cart");
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { productId, quantity } = body as { productId?: string; quantity?: number };
  if (!productId || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await addCartItem(productId, quantity, cap!.sessionId);
  if ("error" in result) {
    const status = result.error === "not_found" ? 404 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }

  const auditReceipt = { action: "add_to_cart", sessionId: "[redacted]", at: new Date().toISOString() };
  return NextResponse.json({ item: result.item, auditReceipt });
}
