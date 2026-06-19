"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { useEffect, useState } from "react";

type CartPayload = {
  items: Array<{
    id: string;
    quantity: number;
    product: { name: string; priceCents: number } | null;
  }>;
  totalCents: number;
};

export default function CartPage() {
  const [data, setData] = useState<CartPayload | null>(null);

  async function load() {
    const res = await fetch("/api/cart");
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    await fetch(`/api/cart/items/${id}`, { method: "DELETE" });
    await load();
  }

  if (!data) return <p>Loading cart...</p>;
  if (!data.items.length) return <p className="rounded border bg-white p-5">Your cart is empty.</p>;

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Cart</h1>
      {data.items.map((item) => (
        <article key={item.id} className="flex items-center justify-between rounded border bg-white p-3">
          <div>
            <p>{item.product?.name}</p>
            <p className="text-sm text-slate-600">Qty {item.quantity}</p>
          </div>
          <div className="flex items-center gap-3">
            <p>{formatMoney((item.product?.priceCents ?? 0) * item.quantity)}</p>
            <button className="text-sm underline" onClick={() => remove(item.id)}>
              Remove
            </button>
          </div>
        </article>
      ))}
      <p className="text-lg font-semibold">Total: {formatMoney(data.totalCents)}</p>
      <Link className="inline-block rounded bg-slate-900 px-4 py-2 text-white" href="/checkout">
        Continue to fake checkout
      </Link>
    </section>
  );
}
