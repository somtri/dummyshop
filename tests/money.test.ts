import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/money";

describe("formatMoney", () => {
  it("formats cents", () => {
    expect(formatMoney(1234)).toBe("$12.34");
  });
});
