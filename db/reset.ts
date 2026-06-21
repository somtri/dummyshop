import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query("begin");
  try {
    await pool.query("delete from order_items");
    await pool.query("delete from orders");
    await pool.query("delete from cart_items");
    await pool.query("delete from carts");
    await pool.query("delete from audit_events");
    await pool.query("commit");
    console.log("mutable benchmark state reset");
  } catch (error) {
    await pool.query("rollback");
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("reset failed");
  console.error(error instanceof Error ? error.message : "unknown_error");
  process.exit(1);
});
