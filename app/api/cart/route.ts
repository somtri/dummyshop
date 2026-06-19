import { getStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  const state = getStore();
  const items = state.cartItems.map((item) => ({
    ...item,
    product: state.products.find((p) => p.id === item.productId)
  }));
  const totalCents = items.reduce((sum, item) => {
    const price = item.product?.priceCents ?? 0;
    return sum + price * item.quantity;
  }, 0);
  return NextResponse.json({ items, totalCents });
}
