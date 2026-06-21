import { readFileSync } from "node:fs";
import { seededProducts } from "@/db/seed-data";
import { Pool } from "pg";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local */ }

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
    for (const product of seededProducts) {
      await pool.query(
        `insert into products (id, name, description, category, diet, price_cents, rating, stock, tags, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,now())
         on conflict (id) do update set
           name = excluded.name,
           description = excluded.description,
           category = excluded.category,
           diet = excluded.diet,
           price_cents = excluded.price_cents,
           rating = excluded.rating,
           stock = excluded.stock,
           tags = excluded.tags`,
        [
          product.id,
          product.name,
          product.description,
          product.category,
          product.diet,
          product.priceCents,
          product.rating,
          product.stock,
          JSON.stringify(product.tags)
        ]
      );
    }
    await pool.query("commit");
    console.log("mutable benchmark state reset and canonical products re-provisioned");
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
