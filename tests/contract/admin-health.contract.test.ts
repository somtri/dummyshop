import { describe, expect, it } from "vitest";
import { GET as healthGet } from "@/app/api/health/route";
import { POST as resetPost } from "@/app/api/admin/reset/route";
import { POST as verifyPost } from "@/app/api/admin/verify/route";

describe("dummyshop contract", () => {
  it("health returns service and storage fields", async () => {
    const response = await healthGet();
    const json = await response.json();
    expect(json.service).toBe("dummyshop");
    expect(["postgres", "memory", "unavailable"]).toContain(json.storage);
  });

  it("reset requires admin token", async () => {
    const response = await resetPost(new Request("http://localhost/api/admin/reset", { method: "POST" }));
    expect(response.status).toBe(401);
  });

  it("verify requires admin token", async () => {
    const response = await verifyPost(
      new Request("http://localhost/api/admin/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskId: "shop_001" })
      })
    );
    expect(response.status).toBe(401);
  });

  it("reset returns 401 with wrong token", async () => {
    const response = await resetPost(
      new Request("http://localhost/api/admin/reset", {
        method: "POST",
        headers: { "x-admin-token": "wrong-token-value" }
      })
    );
    expect(response.status).toBe(401);
  });

  it("health returns service name dummyshop", async () => {
    const response = await healthGet();
    const json = await response.json();
    expect(json.service).toBe("dummyshop");
  });
});
