# DummyShop Benchmark Backend

## Required Environment Variables

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
TEST_DATABASE_URL=postgresql://USER:PASSWORD@HOST/TEST_DATABASE?sslmode=require
ADMIN_RESET_TOKEN=replace-with-a-long-random-token
ALLOW_IN_MEMORY_STORE=false
```

## Storage behavior

- `postgres`: when `DATABASE_URL` is set.
- `memory`: only in `NODE_ENV=development` with `ALLOW_IN_MEMORY_STORE=true`, and in test mode.
- `unavailable`: fails closed for backend calls requiring persistence.

## Commands

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:reset
pnpm db:check
pnpm test:unit
pnpm test:contract
pnpm test:integration
pnpm build
```

## Protected Admin Endpoints

- `POST /api/admin/reset` (requires `x-admin-token`)
- `POST /api/admin/verify` (requires `x-admin-token`)
- `GET /api/health`

## Canonical Task IDs

- `shop_001`: cheapest vegetarian protein under $20 with rating >= 4.5, quantity exactly 2, no checkout.

## Vercel setup

Add `DATABASE_URL` and `ADMIN_RESET_TOKEN` to Production Environment Variables. Do not expose in client code.

## Integration safety

- Integration tests require `TEST_DATABASE_URL`.
- Integration test command refuses when `TEST_DATABASE_URL` is missing or looks production-like.
