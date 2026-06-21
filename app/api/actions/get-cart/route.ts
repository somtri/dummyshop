import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/actions-middleware";
import { getCartWithItems } from "@/lib/backend";

export async function GET(request: Request) {
  const { error, cap } = requireCapability(request.headers.get("authorization"), "shop:cart");
  if (error) return error;

  const { items, totalCents } = await getCartWithItems(cap!.sessionId);

  return NextResponse.json({ items, totalCents, sessionId: "[redacted]" });
}
