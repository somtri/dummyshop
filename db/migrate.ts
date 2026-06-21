import { readFileSync } from "node:fs";
import path from "node:path";
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
  const sql = readFileSync(path.join(process.cwd(), "sql", "schema.sql"), "utf8");
  await pool.query(sql);
  await pool.end();
  console.log("dummyshop migrations applied");
}

main().catch((error) => {
  console.error("migration failed");
  console.error(error instanceof Error ? error.message : "unknown_error");
  process.exit(1);
});
