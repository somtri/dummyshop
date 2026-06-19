import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">DummyShop</h1>
      <p className="max-w-2xl text-slate-700">
        Human-facing benchmark e-commerce site with realistic product filters, cart
        flow, and fake checkout.
      </p>
      <div className="flex gap-3">
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/products">
          Browse products
        </Link>
        <Link className="rounded border px-4 py-2" href="/cart">
          Open cart
        </Link>
      </div>
    </section>
  );
}
