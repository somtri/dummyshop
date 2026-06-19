"use client";

import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
        else setError("Product not found.");
      })
      .catch(() => setError("Failed to load product."));
  }, [id]);

  async function addToCart() {
    if (!product) return;
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 })
    });
    if (res.ok) router.push("/cart");
    else setError("Could not add to cart.");
  }

  if (error) return <p>{error}</p>;
  if (!product) return <p>Loading product...</p>;

  return (
    <section className="space-y-3 rounded border bg-white p-5">
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p>{product.description}</p>
      <p className="text-sm text-slate-600">
        {product.category} • {product.diet} • Rating {product.rating}
      </p>
      <p className="text-xl font-semibold">{formatMoney(product.priceCents)}</p>
      <button
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:bg-slate-400"
        onClick={addToCart}
        disabled={product.stock <= 0}
      >
        {product.stock > 0 ? "Add to cart" : "Out of stock"}
      </button>
    </section>
  );
}
