create table if not exists products (
  id text primary key,
  name text not null,
  description text not null,
  category text not null,
  diet text not null,
  price_cents integer not null,
  rating numeric not null,
  stock integer not null,
  image_url text,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists carts (
  id text primary key,
  benchmark_session_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id text primary key,
  cart_id text not null references carts(id) on delete cascade,
  product_id text not null references products(id),
  quantity integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  cart_id text not null,
  name text not null,
  email text not null,
  address text not null,
  total_cents integer not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id text primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text not null references products(id),
  quantity integer not null,
  price_cents integer not null
);

create table if not exists audit_events (
  id text primary key,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
