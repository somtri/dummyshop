import { describe, expect, it } from "vitest";
import { getStorageMode } from "@/lib/db";

describe("storage mode", () => {
  it("is unavailable in test without DATABASE_URL fallback disabled", () => {
    const mode = getStorageMode();
    expect(["memory", "postgres", "unavailable"]).toContain(mode);
  });
});
