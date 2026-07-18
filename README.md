# Celerey Advisory Admin

Advisor-facing admin foundation for Celerey Advisory. Built with Next.js App Router, shadcn/ui, and a light-only Celerey design system.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo sign-in

1. Enter any email address
2. Enter any 6-digit OTP code
3. Continue to the dashboard

OTP delivery is stubbed for the foundation; any valid-looking email and 6-digit code works.

## What's included

- Secure demo-session auth (HttpOnly cookie + `jose`)
- Route protection via Next.js `proxy.ts`
- Responsive navy sidebar + light dashboard shell
- Dashboard overview with KPI cards, charts, and activity
- Clients table with search, filters, sorting, and pagination
- Typed mock advisory data behind a repository layer

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
