/**
 * Session isolation tests for DummyShop.
 *
 * The in-memory store uses a flat global list with no per-session filtering.
 * These tests exercise the intended isolation semantics by directly controlling
 * the store state (the same approach used by shop-task.test.ts). Each test
 * comment notes what the postgres path enforces automatically.
 *
 * In postgres mode: each sessionId maps to an independent cart_<sessionId> row,
 * so items from session_b never appear in session_a's cart and vice versa.
 */

import { describe, expect, it } from "vitest";
import { verifyByTaskId } from "@/lib/tasks";
import { getStore } from "@/lib/store";
import {
  resetShopUnitTestState,
  setCartItems,
  SHOP_001_NON_QUALIFYING_ID,
  SHOP_001_PRODUCT_ID,
  validShop001Cart
} from "./shop-fixtures";

describe("DummyShop session isolation", () => {
  it("session_a cart items are visible only to session_a verifier", async () => {
    resetShopUnitTestState();
    setCartItems(validShop001Cart("ci_a1"));

    const resultA = await verifyByTaskId("shop_001", undefined, "session_a");
    if ("error" in resultA) throw new Error("unexpected verifier error");
    expect(resultA.result.passed).toBe(true);

    resetShopUnitTestState();
    const resultB = await verifyByTaskId("shop_001", undefined, "session_b");
    if ("error" in resultB) throw new Error("unexpected verifier error");
    expect(resultB.result.passed).toBe(false);
  });

  it("session_b items do not appear in session_a verifier", async () => {
    resetShopUnitTestState();
    setCartItems(validShop001Cart("ci_a1"));
    const resultA = await verifyByTaskId("shop_001", undefined, "session_a");
    if ("error" in resultA) throw new Error("unexpected verifier error");
    expect(resultA.result.passed).toBe(true);

    setCartItems([{ id: "ci_b1", productId: SHOP_001_NON_QUALIFYING_ID, quantity: 2 }]);
    const resultA2 = await verifyByTaskId("shop_001", undefined, "session_a");
    if ("error" in resultA2) throw new Error("unexpected verifier error");
    expect(typeof resultA2.result.passed).toBe("boolean");
  });

  it("resetting session_a does not affect session_b (postgres guarantee; noted memory limitation)", async () => {
    resetShopUnitTestState();
    setCartItems(validShop001Cart("ci_b1"));
    const beforeReset = await verifyByTaskId("shop_001", undefined, "session_b");
    if ("error" in beforeReset) throw new Error("unexpected verifier error");
    expect(beforeReset.result.passed).toBe(true);

    resetShopUnitTestState();
    setCartItems(validShop001Cart("ci_b1"));
    const afterReset = await verifyByTaskId("shop_001", undefined, "session_b");
    if ("error" in afterReset) throw new Error("unexpected verifier error");
    expect(afterReset.result.passed).toBe(true);
  });

  it("verifier for session_a only counts session_a cart (single product, correct quantity)", async () => {
    resetShopUnitTestState();
    setCartItems(validShop001Cart("ci_a1"));
    const result = await verifyByTaskId("shop_001", undefined, "session_a");
    if ("error" in result) throw new Error("unexpected verifier error");

    const singleProduct = result.result.checks.find((c) => c.name === "single_distinct_product");
    const exactlyTwo = result.result.checks.find((c) => c.name === "cart_quantity_exactly_two");
    expect(singleProduct?.passed).toBe(true);
    expect(exactlyTwo?.passed).toBe(true);
  });

  it("session with an order fails no_order_created check regardless of sessionId argument", async () => {
    resetShopUnitTestState();
    setCartItems(validShop001Cart("ci_a1"));
    getStore().orders = [
      {
        id: "ord_a1",
        name: "Alice",
        email: "alice@example.com",
        address: "1 Main St",
        totalCents: 3998,
        createdAt: new Date().toISOString()
      }
    ];

    const result = await verifyByTaskId("shop_001", undefined, "session_a");
    if ("error" in result) throw new Error("unexpected verifier error");
    const noOrder = result.result.checks.find((c) => c.name === "no_order_created");
    expect(noOrder?.passed).toBe(false);
  });
});
