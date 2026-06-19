import type { Product } from "@/lib/types";

const categories = ["protein", "snacks", "drinks", "breakfast", "dairy-alt"];
const diets = ["vegetarian", "vegan", "omnivore"];

export const seededProducts: Product[] = Array.from({ length: 40 }).map((_, i) => {
  const category = categories[i % categories.length];
  const diet = diets[i % diets.length];
  const priceCents = 499 + (i % 8) * 250;
  const rating = 3.8 + (i % 5) * 0.3;
  const stock = i % 9 === 0 ? 0 : 5 + (i % 12);
  const names = [
    "Vegetarian Protein Bars",
    "Plant Protein Powder",
    "Electrolyte Drink Mix",
    "Greek Yogurt Alternative",
    "Budget Recovery Granola",
    "High-Fiber Snack Clusters",
    "Post-Workout Oat Bites",
    "Daily Mineral Hydration"
  ];

  return {
    id: `prod_${String(i + 1).padStart(3, "0")}`,
    name: `${names[i % names.length]} ${i + 1}`,
    description: "Benchmark product used for realistic shopping workflows.",
    category,
    diet,
    priceCents,
    rating: Number(rating.toFixed(1)),
    stock,
    tags: [category, diet]
  };
});
