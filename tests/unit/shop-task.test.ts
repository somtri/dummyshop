import { describe, expect, it } from "vitest";
import { verifyByTaskId } from "@/lib/tasks";
import { getStore, resetMutableState } from "@/lib/store";

function qualifyingProducts() {
  return getStore().products
    .filter((p) => p.category === "protein" && p.diet === "vegetarian" && p.priceCents < 2000 && p.rating >= 4.5)
    .sort((a, b) => a.priceCents - b.priceCents);
}

describe("shop_001 canonical verification", () => {
  it("passes for cheapest qualifying product with quantity 2 and no checkout", async () => {
    resetMutableState();
    const target = qualifyingProducts()[0];
    getStore().cartItems = [{ id: "ci_1", productId: target.id, quantity: 2 }];
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.passed).toBe(true);
  });

  it("fails for non-cheapest qualifying product", async () => {
    resetMutableState();
    const [, second] = qualifyingProducts();
    getStore().cartItems = [{ id: "ci_1", productId: second.id, quantity: 2 }];
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.passed).toBe(false);
  });

  it("fails when quantity is not exactly two", async () => {
    resetMutableState();
    const target = qualifyingProducts()[0];
    getStore().cartItems = [{ id: "ci_1", productId: target.id, quantity: 3 }];
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.checks.find((c) => c.name === "cart_quantity_exactly_two")?.passed).toBe(false);
  });

  it("fails when multiple products are in the cart", async () => {
    resetMutableState();
    const [first, second] = qualifyingProducts();
    getStore().cartItems = [
      { id: "ci_1", productId: first.id, quantity: 1 },
      { id: "ci_2", productId: second.id, quantity: 1 }
    ];
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.checks.find((c) => c.name === "single_distinct_product")?.passed).toBe(false);
  });

  it("fails when an order already exists", async () => {
    resetMutableState();
    const target = qualifyingProducts()[0];
    getStore().cartItems = [{ id: "ci_1", productId: target.id, quantity: 2 }];
    getStore().orders = [{ id: "ord_1", name: "X", email: "x@example.com", address: "A", totalCents: 10, createdAt: new Date().toISOString() }];
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.checks.find((c) => c.name === "no_order_created")?.passed).toBe(false);
  });
});
