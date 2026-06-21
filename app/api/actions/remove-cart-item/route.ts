import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/actions-middleware";
import { deleteCartItem } from "@/lib/backend";

export async function DELETE(request: Request) {
  const { error, cap } = requireCapability(request.headers.get("authorization"), "shop:cart");
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { itemId } = body as { itemId?: string };
  if (!itemId) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const deleted = await deleteCartItem(itemId);
  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  void cap;

  const auditReceipt = { action: "remove_cart_item", sessionId: "[redacted]", at: new Date().toISOString() };
  return NextResponse.json({ ok: true, auditReceipt });
}
