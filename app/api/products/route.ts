import { listProducts } from "@/lib/backend";
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

  const products = await listProducts({ q, category, diet, maxPrice, minRating, inStock, sort });
  return NextResponse.json({ products, count: products.length });
}
