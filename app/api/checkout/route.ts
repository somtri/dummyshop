import { checkoutSchema } from "@/lib/validators";
import { getStore, logEvent } from "@/lib/store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const state = getStore();
  if (!state.cartItems.length) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  const totalCents = state.cartItems.reduce((sum, item) => {
    const product = state.products.find((p) => p.id === item.productId);
    return sum + (product?.priceCents ?? 0) * item.quantity;
  }, 0);

  const order = {
    id: `ord_${Date.now()}`,
    name: parsed.data.name,
    email: parsed.data.email,
    address: parsed.data.address,
    totalCents,
    createdAt: new Date().toISOString()
  };

  state.orders.push(order);
  state.cartItems = [];
  logEvent("order_created", "order", order.id);

  return NextResponse.json({ order }, { status: 201 });
}
