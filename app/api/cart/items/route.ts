import { addCartItemSchema } from "@/lib/validators";
import { addCartItem } from "@/lib/backend";
import { getSessionId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const sessionId = getSessionId(request);
  const payload = await request.json().catch(() => null);
  const parsed = addCartItemSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const result = await addCartItem(parsed.data.productId, parsed.data.quantity, sessionId);
  if (result.error === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.error === "out_of_stock") {
    return NextResponse.json({ error: "out_of_stock" }, { status: 409 });
  }
  return NextResponse.json({ item: result.item }, { status: 201 });
}
