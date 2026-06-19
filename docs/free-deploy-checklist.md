# DummyShop Free Deployment Checklist

## Stack Choices (Free)

- Hosting: Vercel Hobby
- Database: Neon Free Postgres project (or Supabase Free Postgres)
- ORM option: Prisma or Drizzle (schema artifacts included in this repo)

## Steps

1. Create a new GitHub repository: `dummyshop`.
2. Push this folder as its own repo root.
3. Create a Neon free project named `dummyshop-db`.
4. Run SQL schema/seed from `sql/schema.sql` and `sql/seed.sql`.
5. Create Vercel project from `dummyshop` repo.
6. Add env vars:
   - `DATABASE_URL`
   - `ADMIN_RESET_TOKEN`
   - `NEXT_PUBLIC_SITE_NAME=DummyShop`
7. Deploy and verify:
   - `GET /api/health`
   - `POST /api/admin/reset` with `x-admin-token`
   - `POST /api/admin/verify` with `x-admin-token`

## Expected Free-Tier Outcome

- Public URL available on `*.vercel.app`
- Deterministic benchmark flows available from UI
- Reset + verify endpoints secured by admin token
