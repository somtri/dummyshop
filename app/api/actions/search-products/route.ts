import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/actions-middleware";
import { listProducts } from "@/lib/backend";

export async function GET(request: Request) {
  const { error, cap } = requireCapability(request.headers.get("authorization"), "shop:read");
  if (error) return error;

  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const category = url.searchParams.get("category");
  const diet = url.searchParams.get("diet");
  const maxPriceRaw = url.searchParams.get("maxPrice");
  const minRatingRaw = url.searchParams.get("minRating");
  const sort = url.searchParams.get("sort");
  const inStockRaw = url.searchParams.get("inStock");

  const maxPrice = maxPriceRaw ? parseFloat(maxPriceRaw) : undefined;
  const minRating = minRatingRaw ? parseFloat(minRatingRaw) : undefined;
  const inStock = inStockRaw === "true" ? true : undefined;

  const all = await listProducts({ q, category, diet, maxPrice, minRating, sort, inStock });
  const products = all.slice(0, 20);

  void cap; // session verified via token

  return NextResponse.json({ products });
}
