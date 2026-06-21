# DummyShop

## Commands

```bash
# Install
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Tests
pnpm test              # unit tests
pnpm test:contract     # contract tests
pnpm test:integration  # integration tests (requires TEST_DATABASE_URL)

# Database
pnpm db:migrate   # apply schema
pnpm db:seed      # seed fixture data
pnpm db:reset     # reset mutable state
pnpm db:check     # verify connectivity
```

A realistic fake e-commerce website for testing shopping workflows through a normal human UI.

## Demo

Live URL: add after deploy  
Screenshot/GIF: add after deploy

## Why this exists

DummyShop is a human-facing benchmark website for browser-agent evaluation. It intentionally has realistic UI flows (search, filters, cart, checkout) but no real payments or auth.

## Features

- Product catalog with 40 deterministic seeded products
- Search and filters (`q`, category, diet, max price, min rating, in-stock, sort)
- Product detail pages
- Cart add/remove and totals
- Fake checkout and confirmation
- Admin reset endpoint
- Admin verify endpoint

## Architecture

Next.js App Router app with route handlers under `app/api`.  
API routes are now PostgreSQL-backed when `DATABASE_URL` is present, with deterministic in-memory fallback for local no-DB development.

## Tech Stack

Next.js, TypeScript, Tailwind CSS, Zod, Vitest.

## Running Locally

```bash
pnpm install
pnpm dev
```

## Environment Variables

- `DATABASE_URL`
- `ADMIN_RESET_TOKEN`
- `NEXT_PUBLIC_SITE_NAME`

## Seeding Data

```bash
pnpm seed
```

## Database Migration Path

- SQL files: `sql/schema.sql`, `sql/seed.sql`
- Prisma model: `prisma/schema.prisma`
- Current runtime is deterministic in-memory for fast benchmark iteration; migrate route handlers to Prisma queries when turning on persistent DB mode.

## Testing

```bash
pnpm test
pnpm lint
pnpm build
```

## Deployment

Deploy as a standalone Vercel project named `dummyshop`. Add env vars in Vercel project settings.

### Free option

- Vercel Hobby + Neon Free Postgres
- See `docs/free-deploy-checklist.md`
- Optional endpoint smoke script: `node scripts/verify-endpoints.mjs`

## Benchmark Tasks

1. Search `protein`, filter vegetarian, max price 20, min rating 4.5, add 2 to cart.
2. Complete fake checkout from cart.
3. Verify expected cart constraints with `/api/admin/verify`.

## Known Limitations

No real payment, no auth, no agent endpoints.

## Future Work

Switch state layer to Neon/Supabase Postgres with Drizzle/Prisma migrations.
