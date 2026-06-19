import { getStore } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");
  const diet = searchParams.get("diet");
  const maxPrice = Number(searchParams.get("maxPrice") || 0);
  const minRating = Number(searchParams.get("minRating") || 0);
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "relevance";

  let products = [...getStore().products];
  if (q) products = products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q));
  if (category) products = products.filter((p) => p.category === category);
  if (diet) products = products.filter((p) => p.diet === diet);
  if (maxPrice > 0) products = products.filter((p) => p.priceCents <= maxPrice * 100);
  if (minRating > 0) products = products.filter((p) => p.rating >= minRating);
  if (inStock) products = products.filter((p) => p.stock > 0);

  if (sort === "price-asc") products.sort((a, b) => a.priceCents - b.priceCents);
  if (sort === "price-desc") products.sort((a, b) => b.priceCents - a.priceCents);
  if (sort === "rating-desc") products.sort((a, b) => b.rating - a.rating);

  return NextResponse.json({ products, count: products.length });
}
