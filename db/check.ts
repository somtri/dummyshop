import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query("select 1");
  await pool.end();
  console.log("database reachable");
}

main().catch((error) => {
  console.error("db check failed");
  console.error(error instanceof Error ? error.message : "unknown_error");
  process.exit(1);
});
