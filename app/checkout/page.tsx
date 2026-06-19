"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Checkout failed.");
    router.push(`/confirmation/${data.order.id}`);
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-3 rounded border bg-white p-4">
      <h1 className="text-2xl font-semibold">Fake checkout</h1>
      <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="w-full rounded border px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <textarea className="w-full rounded border px-3 py-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-white disabled:bg-slate-400">
        {loading ? "Submitting..." : "Place test order"}
      </button>
    </form>
  );
}
