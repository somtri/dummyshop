import { countOrders, getCartWithItems, listProducts, verifyShop } from "@/lib/backend";

export const canonicalTasks = {
  shop_001: {
    id: "shop_001",
    description: "Cheapest vegetarian protein under $20 with rating >= 4.5, quantity 2, no checkout."
  }
} as const;

export async function verifyByTaskId(taskId: string, fallbackExpect?: {
  cartQuantity?: number;
  diet?: string;
  category?: string;
  maxPriceEach?: number;
  minRating?: number;
}, sessionId: string = "default") {
  if (taskId !== "shop_001") {
    if (!fallbackExpect) {
      return { error: "unknown_task" as const };
    }
    return { result: await verifyShop(fallbackExpect, sessionId) };
  }

  const checks: Array<{ name: string; passed: boolean; actual: unknown; expected: unknown }> = [];
  const cart = await getCartWithItems(sessionId);
  const orderCount = await countOrders(sessionId);
  const cartQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const distinctProductIds = new Set(cart.items.map((i) => i.productId));

  checks.push({ name: "cart_quantity_exactly_two", passed: cartQuantity === 2, actual: cartQuantity, expected: 2 });
  checks.push({
    name: "single_distinct_product",
    passed: distinctProductIds.size === 1,
    actual: distinctProductIds.size,
    expected: 1
  });
  checks.push({ name: "no_order_created", passed: orderCount === 0, actual: orderCount, expected: 0 });

  const selectedItem = cart.items[0];
  const selectedProduct = selectedItem?.product ?? null;
  const candidates = await listProducts({
    category: "protein",
    diet: "vegetarian",
    maxPrice: 19.99,
    minRating: 4.5
  });
  const minPrice = candidates.length ? Math.min(...candidates.map((p) => p.priceCents)) : null;

  if (!selectedProduct) {
    checks.push({ name: "selected_product_exists", passed: false, actual: null, expected: "product" });
  } else {
    checks.push({ name: "selected_is_vegetarian", passed: selectedProduct.diet === "vegetarian", actual: selectedProduct.diet, expected: "vegetarian" });
    checks.push({ name: "selected_is_protein", passed: selectedProduct.category === "protein", actual: selectedProduct.category, expected: "protein" });
    checks.push({ name: "selected_price_under_20", passed: selectedProduct.priceCents < 2000, actual: selectedProduct.priceCents / 100, expected: "<20.00" });
    checks.push({ name: "selected_rating_at_least_4_5", passed: selectedProduct.rating >= 4.5, actual: selectedProduct.rating, expected: ">=4.5" });
    checks.push({
      name: "selected_is_cheapest_qualifying_tie_allowed",
      passed: minPrice !== null && selectedProduct.priceCents === minPrice,
      actual: selectedProduct.priceCents / 100,
      expected: minPrice !== null ? minPrice / 100 : "qualifying product"
    });
  }

  return { result: { passed: checks.every((c) => c.passed), checks } };
}
