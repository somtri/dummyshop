import { formatMoney } from "@/lib/money";
import { getOrderById } from "@/lib/backend";
import Link from "next/link";

export default async function ConfirmationPage(props: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await props.params;
  const order = await getOrderById(orderId);
  if (!order) return <p>Order not found.</p>;

  return (
    <section className="space-y-2 rounded border bg-white p-5">
      <h1 className="text-2xl font-semibold">Order confirmed</h1>
      <p>Order ID: {order.id}</p>
      <p>Total: {formatMoney(order.totalCents)}</p>
      <p>Shipping to: {order.address}</p>
      <Link className="inline-block underline" href="/products">
        Continue shopping
      </Link>
    </section>
  );
}
