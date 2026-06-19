import { getStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = getStore().products.find((p) => p.id === id);
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}
