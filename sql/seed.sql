-- Deterministic product seed starter rows.
-- Extend this list to all 40 rows if seeding in SQL directly.

insert into products (id, name, description, category, diet, price_cents, rating, stock, tags)
values
  ('prod_001', 'Vegetarian Protein Bars 1', 'Benchmark product used for realistic shopping workflows.', 'protein', 'vegetarian', 499, 4.7, 10, '["protein","vegetarian"]'::jsonb),
  ('prod_002', 'Plant Protein Powder 2', 'Benchmark product used for realistic shopping workflows.', 'snacks', 'vegan', 749, 4.5, 8, '["snacks","vegan"]'::jsonb),
  ('prod_003', 'Electrolyte Drink Mix 3', 'Benchmark product used for realistic shopping workflows.', 'drinks', 'omnivore', 999, 4.1, 6, '["drinks","omnivore"]'::jsonb)
on conflict (id) do nothing;
