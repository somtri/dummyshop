import { describe, expect, it } from "vitest";
import { getStore, resetMutableState } from "@/lib/store";
import { verifyBenchmark } from "@/lib/verify";

describe("verifyBenchmark", () => {
  it("validates cart quantity", () => {
    resetMutableState();
    getStore().cartItems.push({ id: "ci_1", productId: "prod_001", quantity: 2 });
    const result = verifyBenchmark({ cartQuantity: 2 });
    expect(result.passed).toBe(true);
  });
});
