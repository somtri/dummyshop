# DummyShop Architecture

- Frontend pages in `app/` render catalog, detail, cart, checkout, and confirmation.
- API routes in `app/api/` handle products, cart mutations, checkout, admin reset, and verify.
- Deterministic seed data in `db/seed-data.ts`.
- Verification logic in `lib/verify.ts` checks task expectations without mutating state.
