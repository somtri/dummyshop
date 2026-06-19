"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const query = useMemo(
    () => ({
      q: searchParams.get("q") ?? "",
      category: searchParams.get("category") ?? "",
      diet: searchParams.get("diet") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      minRating: searchParams.get("minRating") ?? "",
      inStock: searchParams.get("inStock") ?? "",
      sort: searchParams.get("sort") ?? "price-asc"
    }),
    [searchParams]
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const res = await fetch(`/api/products?${new URLSearchParams(query)}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setLoading(false);
    };
    run();
  }, [query]);

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(name);
    else params.set(name, value);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Products</h1>

      <div className="grid gap-2 rounded border bg-white p-3 md:grid-cols-4">
        <input
          className="rounded border px-2 py-1"
          placeholder="Search"
          value={query.q}
          onChange={(e) => updateParam("q", e.target.value)}
        />
        <select className="rounded border px-2 py-1" value={query.category} onChange={(e) => updateParam("category", e.target.value)}>
          <option value="">All categories</option>
          <option value="protein">protein</option>
          <option value="snacks">snacks</option>
          <option value="drinks">drinks</option>
          <option value="breakfast">breakfast</option>
          <option value="dairy-alt">dairy-alt</option>
        </select>
        <select className="rounded border px-2 py-1" value={query.diet} onChange={(e) => updateParam("diet", e.target.value)}>
          <option value="">All diets</option>
          <option value="vegetarian">vegetarian</option>
          <option value="vegan">vegan</option>
          <option value="omnivore">omnivore</option>
        </select>
        <select className="rounded border px-2 py-1" value={query.sort} onChange={(e) => updateParam("sort", e.target.value)}>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
          <option value="rating-desc">Rating high to low</option>
        </select>
        <input
          className="rounded border px-2 py-1"
          placeholder="Max price"
          value={query.maxPrice}
          onChange={(e) => updateParam("maxPrice", e.target.value)}
        />
        <input
          className="rounded border px-2 py-1"
          placeholder="Min rating"
          value={query.minRating}
          onChange={(e) => updateParam("minRating", e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={query.inStock === "true"}
            onChange={(e) => updateParam("inStock", e.target.checked ? "true" : "")}
          />
          In stock only
        </label>
        <button className="rounded border px-3 py-1" onClick={() => router.push("/products")}>
          Clear filters
        </button>
      </div>

      {loading ? <p>Loading products...</p> : null}
      {!loading && products.length === 0 ? <p className="rounded border bg-white p-4">No matching products.</p> : null}

      <div className="grid gap-3 md:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="rounded border bg-white p-3">
            <p className="text-xs text-slate-500">{product.category} • {product.diet}</p>
            <h2 className="font-medium">{product.name}</h2>
            <p className="text-sm text-slate-600">Rating {product.rating} / 5</p>
            <p className="font-semibold">{formatMoney(product.priceCents)}</p>
            <p className={`text-sm ${product.stock > 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
            </p>
            <Link className="mt-2 inline-block text-sm underline" href={`/products/${product.id}`}>
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p>Loading products...</p>}>
      <ProductsPageInner />
    </Suspense>
  );
}
