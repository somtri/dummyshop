import { readFileSync } from "node:fs";
import { Pool } from "pg";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local */ }

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const categories = ["protein", "snacks", "drinks", "breakfast", "dairy-alt"];
const diets = ["vegetarian", "vegan", "omnivore"];
const names = [
  "Vegetarian Protein Bars", "Plant Protein Powder", "Electrolyte Drink Mix",
  "Greek Yogurt Alternative", "Budget Recovery Granola", "High-Fiber Snack Clusters",
  "Post-Workout Oat Bites", "Daily Mineral Hydration"
];

const products = Array.from({ length: 40 }).map((_, i) => ({
  id: `prod_${String(i + 1).padStart(3, "0")}`,
  name: `${names[i % names.length]} ${i + 1}`,
  description: "Benchmark product used for realistic shopping workflows.",
  category: categories[i % categories.length],
  diet: diets[i % diets.length],
  priceCents: 499 + (i % 8) * 250,
  rating: Number((3.8 + (i % 5) * 0.3).toFixed(1)),
  stock: i % 9 === 0 ? 0 : 5 + (i % 12),
  tags: [categories[i % categories.length], diets[i % diets.length]]
}));

const prod031 = products.find((p) => p.id === "prod_031");
if (prod031) prod031.rating = 4.7;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
for (const p of products) {
  await pool.query(
    `insert into products (id, name, description, category, diet, price_cents, rating, stock, tags, created_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,now())
     on conflict (id) do update set
       name = excluded.name, description = excluded.description,
       category = excluded.category, diet = excluded.diet,
       price_cents = excluded.price_cents, rating = excluded.rating,
       stock = excluded.stock, tags = excluded.tags`,
    [p.id, p.name, p.description, p.category, p.diet, p.priceCents, p.rating, p.stock, JSON.stringify(p.tags)]
  );
}
await pool.end();
console.log(`dummyshop seeded ${products.length} products`);
