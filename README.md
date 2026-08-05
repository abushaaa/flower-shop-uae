# Bloom & Gift — UAE Flower Shop

A full-featured, bilingual (EN/AR with RTL support) e-commerce platform for
a flower and gift shop, built with Next.js and Prisma.

## Features

**Storefront**
- Product catalog with categories, filters, and search
- Cart, checkout, and coupon codes
- Customer accounts with order history
- Newsletter signup, reviews, and product recommendations

**Admin dashboard**
- Product, category, and coupon management
- Order management with a 10-stage status lifecycle
- Customer management
- Sales and performance reports

**Operations**
- Florist workflow dashboard for order preparation
- Delivery tracking with status history, abstracted behind a
  provider interface (supports Careem, Jeebly, and custom couriers)
- Role-based access control (super admin / admin / florist / customer)
- In-app notifications
- Audit logging for administrative actions

## Stack

- **Next.js** — frontend and API routes
- **Prisma** — ORM, 16 data models covering products, orders, payments,
  delivery tracking, florist tasks, notifications, and audit logs
- **Zustand** — client-side state (cart, auth, language, UI)
- **shadcn/ui** + Tailwind CSS — component library and styling
- **SQLite** — database (dev); swap the `DATABASE_URL` in `.env` for
  Postgres/MySQL in production

## Setup

```bash
npm install       # or bun install
cp .env.example .env
npx prisma db push
npx prisma db seed
npm run dev
```

Open `http://localhost:3000`.

## Notes

This project was scaffolded and built iteratively with AI-assisted
development. The core application code (`src/`, `prisma/`) is fully
hand-reviewable; tooling-specific files used during development are
excluded via `.gitignore`.
