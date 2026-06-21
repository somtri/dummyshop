import { beforeEach, vi } from "vitest";

/** Unit tests assert in-memory cart semantics; never use a live DATABASE_URL. */
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("TEST_DATABASE_URL", "");
});
