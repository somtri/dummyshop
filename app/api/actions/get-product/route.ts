import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/actions-middleware";
import { getProductById } from "@/lib/backend";

export async function GET(request: Request) {
  const { error, cap } = requireCapability(request.headers.get("authorization"), "shop:read");
  if (error) return error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  void cap;

  return NextResponse.json({ product });
}
