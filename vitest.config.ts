import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/unit/setup.ts"],
    // Keep unit tests on the in-memory store; ignore repo .env.local DATABASE_URL.
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "",
      TEST_DATABASE_URL: ""
    },
    envDir: path.resolve(__dirname, "tests/unit")
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
});
