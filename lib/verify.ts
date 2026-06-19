import { getStore } from "@/lib/store";

export function verifyBenchmark(expect: {
  cartQuantity?: number;
  diet?: string;
  category?: string;
  maxPriceEach?: number;
  minRating?: number;
}) {
  const state = getStore();
  const checks: Array<{ name: string; passed: boolean; actual: unknown; expected: unknown }> = [];

  const cartQuantity = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  if (typeof expect.cartQuantity === "number") {
    checks.push({
      name: "cart_quantity",
      passed: cartQuantity === expect.cartQuantity,
      actual: cartQuantity,
      expected: expect.cartQuantity
    });
  }

  for (const item of state.cartItems) {
    const product = state.products.find((p) => p.id === item.productId);
    if (!product) continue;

    if (expect.diet) {
      checks.push({
        name: `diet_${product.id}`,
        passed: product.diet === expect.diet,
        actual: product.diet,
        expected: expect.diet
      });
    }
    if (expect.category) {
      checks.push({
        name: `category_${product.id}`,
        passed: product.category === expect.category,
        actual: product.category,
        expected: expect.category
      });
    }
    if (typeof expect.maxPriceEach === "number") {
      checks.push({
        name: `max_price_${product.id}`,
        passed: product.priceCents <= expect.maxPriceEach * 100,
        actual: product.priceCents / 100,
        expected: expect.maxPriceEach
      });
    }
    if (typeof expect.minRating === "number") {
      checks.push({
        name: `min_rating_${product.id}`,
        passed: product.rating >= expect.minRating,
        actual: product.rating,
        expected: expect.minRating
      });
    }
  }

  return { passed: checks.every((check) => check.passed), checks };
}
