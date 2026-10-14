# Wasla platform

Website + developer platform for the Wasla WhatsApp & AI API:

- **Marketing:** landing page (`/`), pricing (`/pricing`), docs (`/docs/*`).
- **Accounts:** sign-up with email confirmation, sign-in, password reset (emails via [Resend](https://resend.com)).
- **Checkout** (`/checkout`): static for now. Orders are recorded as *pending*; with `CHECKOUT_TEST_MODE=1` a "Simulate payment" button completes them.
- **Dashboard:**
  - API keys: live and test keys, shown once, stored hashed.
  - Usage: messages, AI tokens and credits per day.
  - Credits & billing: balance, history, plans, top-ups.
  - WhatsApp connection: Meta Cloud API number, encrypted token, webhook forwarding.
  - Settings.
- **Public API** (`/api/v1`):
  - `GET /account`
  - `POST /messages`
  - `POST /ai/reply`
  - `GET /usage`
  - `GET|POST /webhooks/whatsapp/:accountId`, the Meta webhook (verified, then forwarded signed to the customer's own webhook).

Stack: Next.js 15 (App Router), TypeScript, Tailwind, Prisma + PostgreSQL, Zod, `@vixer-house/whatsapp-kit`.

Rename the product in `src/lib/brand.ts`. Change prices, plans and credit costs in `src/lib/plans.ts`.

## Local setup

```bash
cp .env.example .env          # fill DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY
# GITHUB_PACKAGES_TOKEN must be set in your shell (classic token, read:packages)
npm install
npx prisma migrate deploy
npm run dev                   # http://localhost:3000
```

With `EMAIL_DEV_LINKS=1`, confirmation and reset links appear on screen instead of being emailed.

Tests (need a Postgres database): `npm test`.

## Deploy (Vercel + Neon)

1. **Push this repo to GitHub.**
2. **Import the repo in Vercel.** Framework preset: Next.js.
   - Build command: `npm run vercel-build`
   - Install command: `npm ci`
3. **Add a database:** Vercel → Storage → **Neon Postgres**. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
4. **Add environment variables** (see `.env.example`):
   - `AUTH_SECRET` and `ENCRYPTION_KEY`: long random strings. Never change `ENCRYPTION_KEY` later.
   - `APP_URL`: the public URL, e.g. `https://wasla.vercel.app` or your domain.
   - `GITHUB_PACKAGES_TOKEN`.
   - `RESEND_API_KEY` and `EMAIL_FROM` (the sender's domain must be verified in Resend).
   - `GEMINI_API_KEY`: optional, enables live AI replies.
   - `CHECKOUT_TEST_MODE`: `0` in production.
5. **Deploy.** `vercel-build` runs the database migrations automatically.
