import { getStore, logEvent } from "@/lib/store";
import { patchCartItemSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = patchCartItemSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const item = getStore().cartItems.find((i) => i.id === id);
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  item.quantity = parsed.data.quantity;
  logEvent("cart_item_updated", "cart_item", item.id);
  return NextResponse.json({ item });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const state = getStore();
  const index = state.cartItems.findIndex((i) => i.id === id);
  if (index < 0) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const [removed] = state.cartItems.splice(index, 1);
  logEvent("cart_item_removed", "cart_item", removed.id);
  return NextResponse.json({ ok: true });
}
