import { describe, expect, it } from "vitest";
import { verifyByTaskId } from "@/lib/tasks";
import { getStore } from "@/lib/store";
import {
  resetShopUnitTestState,
  setCartItems,
  SHOP_001_NON_QUALIFYING_ID,
  SHOP_001_PRODUCT_ID,
  shop001QualifyingProduct,
  validShop001Cart
} from "./shop-fixtures";

describe("shop_001 canonical verification", () => {
  it("passes for cheapest qualifying product with quantity 2 and no checkout", async () => {
    resetShopUnitTestState();
    const target = shop001QualifyingProduct();
    setCartItems(validShop001Cart());
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.passed).toBe(true);
    expect(target.id).toBe(SHOP_001_PRODUCT_ID);
    expect(target.rating).toBe(4.7);
  });

  it("fails for a non-qualifying vegetarian protein product", async () => {
    resetShopUnitTestState();
    setCartItems([{ id: "ci_1", productId: SHOP_001_NON_QUALIFYING_ID, quantity: 2 }]);
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.passed).toBe(false);
  });

  it("fails when quantity is not exactly two", async () => {
    resetShopUnitTestState();
    setCartItems([{ id: "ci_1", productId: SHOP_001_PRODUCT_ID, quantity: 3 }]);
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.checks.find((c) => c.name === "cart_quantity_exactly_two")?.passed).toBe(false);
  });

  it("fails when multiple products are in the cart", async () => {
    resetShopUnitTestState();
    setCartItems([
      { id: "ci_1", productId: SHOP_001_PRODUCT_ID, quantity: 1 },
      { id: "ci_2", productId: SHOP_001_NON_QUALIFYING_ID, quantity: 1 }
    ]);
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.checks.find((c) => c.name === "single_distinct_product")?.passed).toBe(false);
  });

  it("fails when an order already exists", async () => {
    resetShopUnitTestState();
    const target = shop001QualifyingProduct();
    setCartItems(validShop001Cart());
    getStore().orders = [{ id: "ord_1", name: "X", email: "x@example.com", address: "A", totalCents: 10, createdAt: new Date().toISOString() }];
    const result = await verifyByTaskId("shop_001");
    if ("error" in result) throw new Error("unexpected");
    expect(result.result.checks.find((c) => c.name === "no_order_created")?.passed).toBe(false);
    expect(target.id).toBe(SHOP_001_PRODUCT_ID);
  });
});
