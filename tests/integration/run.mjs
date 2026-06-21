import { createRequire } from "node:module";

const TEST_URL = process.env.TEST_DATABASE_URL;
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const ADMIN_TOKEN = process.env.ADMIN_RESET_TOKEN || "";

if (!TEST_URL) {
  throw new Error("TEST_DATABASE_URL is required for integration tests");
}

if (/prod|production|vercel|neon/i.test(TEST_URL)) {
  throw new Error("Refusing to run integration tests against a production-like database URL");
}

let passed = 0;
let failed = 0;

function pass(name) {
  passed++;
  console.log(`  PASS  ${name}`);
}

function fail(name, detail) {
  failed++;
  console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function assert(name, condition, detail) {
  if (condition) {
    pass(name);
  } else {
    fail(name, detail ?? "assertion failed");
  }
}

async function fetchJSON(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  let json = null;
  try {
    json = await res.json();
  } catch (_) {}
  return { status: res.status, json };
}

console.log(`\nDummyShop integration tests`);
console.log(`  BASE_URL: ${BASE_URL}`);
console.log(`  DATABASE: ${TEST_URL.replace(/:[^@]*@/, ":***@")}\n`);

// ── 1. DB connectivity ────────────────────────────────────────────────────────
console.log("1. DB connectivity");
try {
  const require = createRequire(import.meta.url);
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: TEST_URL });
  const result = await pool.query("SELECT 1 AS ok");
  await assert("postgres responds to SELECT 1", result.rows[0]?.ok === 1);
  await pool.end();
} catch (err) {
  fail("postgres responds to SELECT 1", err.message);
}

// ── 2. Health endpoint ────────────────────────────────────────────────────────
console.log("\n2. Health endpoint");
try {
  const { status, json } = await fetchJSON("/api/health");
  await assert("GET /api/health returns 200", status === 200, `got ${status}`);
  await assert("health.service is dummyshop", json?.service === "dummyshop", `got ${json?.service}`);
  await assert(
    "health.storage is a known mode",
    ["postgres", "memory", "unavailable"].includes(json?.storage),
    `got ${json?.storage}`
  );
} catch (err) {
  fail("GET /api/health", err.message);
}

// ── 3. Admin auth ─────────────────────────────────────────────────────────────
console.log("\n3. Admin auth");
try {
  const { status: noToken } = await fetchJSON("/api/admin/reset", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId: "integration_test" })
  });
  await assert("POST /api/admin/reset without token → 401", noToken === 401, `got ${noToken}`);
} catch (err) {
  fail("POST /api/admin/reset without token", err.message);
}

try {
  const { status: wrongToken } = await fetchJSON("/api/admin/reset", {
    method: "POST",
    headers: { "x-admin-token": "definitely-wrong", "content-type": "application/json" },
    body: JSON.stringify({ sessionId: "integration_test" })
  });
  await assert("POST /api/admin/reset with wrong token → 401", wrongToken === 401, `got ${wrongToken}`);
} catch (err) {
  fail("POST /api/admin/reset with wrong token", err.message);
}

if (!ADMIN_TOKEN) {
  console.log("  SKIP  ADMIN_RESET_TOKEN not set — skipping authenticated reset/verify tests");
} else {
  // ── 4. Admin reset with correct token ─────────────────────────────────────
  console.log("\n4. Admin reset (authenticated)");
  try {
    const { status, json } = await fetchJSON("/api/admin/reset", {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ sessionId: "integration_session_a" })
    });
    await assert("POST /api/admin/reset with correct token → 200", status === 200, `got ${status}`);
    await assert("reset response contains ok:true", json?.ok === true, `got ${JSON.stringify(json)}`);
    await assert("reset response contains resetAt timestamp", typeof json?.resetAt === "string", `got ${json?.resetAt}`);
  } catch (err) {
    fail("POST /api/admin/reset (authenticated)", err.message);
  }

  // ── 5. Session isolation ───────────────────────────────────────────────────
  // Reset both sessions to start clean, then verify they don't see each other.
  console.log("\n5. Session isolation");
  const SESSION_A = `int_shop_a_${Date.now()}`;
  const SESSION_B = `int_shop_b_${Date.now()}`;

  try {
    await fetchJSON("/api/admin/reset", {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ sessionId: SESSION_A })
    });
    await fetchJSON("/api/admin/reset", {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ sessionId: SESSION_B })
    });

    // Verify session A starts clean (no cart items → verify fails)
    const { status: vaStatus, json: vaJson } = await fetchJSON("/api/admin/verify", {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ taskId: "shop_001", sessionId: SESSION_A })
    });
    await assert("verify session A after reset → 200", vaStatus === 200, `got ${vaStatus}`);
    await assert(
      "session A starts with no qualifying items (passed=false)",
      vaJson?.passed === false,
      `got passed=${vaJson?.passed}`
    );

    // Verify session B is independent (also clean)
    const { status: vbStatus, json: vbJson } = await fetchJSON("/api/admin/verify", {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ taskId: "shop_001", sessionId: SESSION_B })
    });
    await assert("verify session B after reset → 200", vbStatus === 200, `got ${vbStatus}`);
    await assert(
      "session B starts independently clean (passed=false)",
      vbJson?.passed === false,
      `got passed=${vbJson?.passed}`
    );

    // Reset only session A — session B should remain (already verified clean; no items to check)
    await fetchJSON("/api/admin/reset", {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ sessionId: SESSION_A })
    });
    const { json: vbAfterJson } = await fetchJSON("/api/admin/verify", {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ taskId: "shop_001", sessionId: SESSION_B })
    });
    await assert(
      "session B verify unchanged after session A reset",
      vbAfterJson?.passed === false,
      `got passed=${vbAfterJson?.passed}`
    );
  } catch (err) {
    fail("session isolation checks", err.message);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
