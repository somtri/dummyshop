import { addCartItemSchema } from "@/lib/validators";
import { getStore, logEvent } from "@/lib/store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = addCartItemSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const state = getStore();
  const product = state.products.find((p) => p.id === parsed.data.productId);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (product.stock < parsed.data.quantity) {
    return NextResponse.json({ error: "out_of_stock" }, { status: 409 });
  }

  const existing = state.cartItems.find((i) => i.productId === parsed.data.productId);
  if (existing) {
    existing.quantity += parsed.data.quantity;
    logEvent("cart_item_incremented", "cart_item", existing.id);
    return NextResponse.json({ item: existing });
  }

  const item = {
    id: `ci_${Date.now()}`,
    productId: parsed.data.productId,
    quantity: parsed.data.quantity
  };
  state.cartItems.push(item);
  logEvent("cart_item_added", "cart_item", item.id);
  return NextResponse.json({ item }, { status: 201 });
}
