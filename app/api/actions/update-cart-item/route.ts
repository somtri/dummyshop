import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/actions-middleware";
import { updateCartItem } from "@/lib/backend";

export async function PATCH(request: Request) {
  const { error, cap } = requireCapability(request.headers.get("authorization"), "shop:cart");
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { itemId, quantity } = body as { itemId?: string; quantity?: number };
  if (!itemId || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const item = await updateCartItem(itemId, quantity);
  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  void cap;

  const auditReceipt = { action: "update_cart_item", sessionId: "[redacted]", at: new Date().toISOString() };
  return NextResponse.json({ item, auditReceipt });
}
