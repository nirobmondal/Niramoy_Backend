# Niramoy Backend

Backend API for the Niramoy OTC medicine marketplace.

Built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Better Auth (cookie-based sessions).

## Live Links

- Frontend Live: `https://niramoy-two.vercel.app/`
- Backend Live: `https://niramoy-backend.onrender.com/`

## Features

- Role-based marketplace APIs: `CUSTOMER`, `SELLER`, `ADMIN`
- Better Auth integration with email/password and Google OAuth
- Seller medicine and order management
- Cart, checkout, order lifecycle, and cancellation with stock restore
- Review system with customer/admin moderation rules
- Admin dashboard and operational management endpoints

## Tech Stack

- Runtime: Node.js
- Framework: Express 5
- Language: TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Auth: Better Auth (cookie sessions)
- Build tools: `tsx`, `tsup`

## Prerequisites

- Node.js `18+` (recommended `20+`)
- npm `9+`
- PostgreSQL database

## Quick Start

1. Clone and enter backend directory

```bash
git clone <your-repo-url>
cd Niramoy_Backend
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env
```

If `.env.example` does not exist, create `.env` manually from the template in the Environment Variables section below.

4. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development with creating new migrations:

```bash
npx prisma migrate dev
```

5. Seed admin user

```bash
npm run seed:admin
```

6. Start development server

```bash
npm run dev
```

Server starts at `http://localhost:5000` by default.

## Available Scripts

- `npm run dev` -> Start backend in watch mode (`tsx watch src/server.ts`)
- `npm run build` -> Build production bundle (`tsup src/server.ts --format esm --clean`)
- `npm run start` -> Run built app (`node dist/server.js`)
- `npm run seed:admin` -> Seed initial admin user

## Environment Variables

Create `.env` in project root:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require&channel_binding=require"
BETTER_AUTH_SECRET="your_better_auth_secret"
BETTER_AUTH_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### Notes

- `DATABASE_URL` is required for Prisma and app startup.
- `BETTER_AUTH_SECRET` is required by Better Auth for signing/encrypting session data.
- `FRONTEND_URL` must match frontend origin for CORS and trusted auth origin.
- `BETTER_AUTH_URL` should be your backend base URL.
- Google variables are required if Google sign-in is used.

## Project Structure

```text
Niramoy_Backend/
├── prisma/
│   ├── migrations/
│   └── schema/
│       ├── schema.prisma
│       ├── auth.prisma
│       ├── cart.prisma
│       ├── categories.prisma
│       ├── manufacturer.prisma
│       ├── medicines.prisma
│       ├── orders.prisma
│       ├── reviews.prisma
│       └── sellerProfile.prisma
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── constant/
│   ├── helpers/
│   ├── lib/
│   ├── middlewares/
│   ├── modules/
│   │   ├── admin/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── manufacturers/
│   │   ├── medicines/
│   │   ├── orders/
│   │   ├── reviews/
│   │   ├── sellers/
│   │   └── users/
│   ├── scripts/
│   └── types/
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

## Authentication and Authorization

- Auth endpoints are provided by Better Auth at:
  - `POST /api/auth/sign-up/email`
  - `POST /api/auth/sign-in/email`
  - `POST /api/auth/sign-out`
  - `GET /api/auth/get-session`
  - and other Better Auth routes under `/api/auth/*`
- Session style: cookie-based session (not Bearer token)
- Route access is controlled via role middleware (`CUSTOMER`, `SELLER`, `ADMIN`)

## API Summary

Base URL: `http://localhost:5000`

### Health

- `GET /` -> Server health check

### Users (Authenticated)

- `GET /api/users/me`
- `PATCH /api/users/me`

### Categories

Public:

- `GET /api/categories`
- `GET /api/categories/:id/medicines`

Admin:

- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

### Manufacturers

Public:

- `GET /api/manufacturers`

Admin:

- `POST /api/admin/manufacturers`

### Medicines

Public:

- `GET /api/medicines`
- `GET /api/medicines/:id`

### Reviews

Medicine-level:

- `GET /api/medicines/:id/reviews` (Public)
- `POST /api/medicines/:id/reviews` (Customer)

Review management:

- `GET /api/reviews` (Admin)
- `PATCH /api/reviews/:id` (Customer/Admin)
- `DELETE /api/reviews/:id` (Customer/Admin)

### Cart (Customer)

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `DELETE /api/cart`

### Orders (Customer)

- `POST /api/orders` (Checkout)
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/cancel`

### Seller

Profile:

- `POST /api/seller/profile` (Customer -> become seller)
- `GET /api/seller/profile` (Seller)
- `PATCH /api/seller/profile` (Seller)

Medicines:

- `GET /api/seller/medicines`
- `POST /api/seller/medicines`
- `PATCH /api/seller/medicines/:id`
- `DELETE /api/seller/medicines/:id`
- `PATCH /api/seller/medicines/:id/stock`

Orders:

- `GET /api/seller/orders`
- `GET /api/seller/orders/:id`
- `PATCH /api/seller/orders/:id/status`

Dashboard:

- `GET /api/seller/dashboard`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/ban`
- `GET /api/admin/orders`
- `GET /api/admin/medicines`
- `POST /api/admin/manufacturers`

## Common Query Parameters

Some list endpoints support these query params:

- `page` (default pagination page)
- `limit` (items per page)
- `search` (keyword filter)

Admin endpoints also support module-specific filters like `role`, `seller`, `category`, `customer`, `date`, or `status` depending on route implementation.

## Error Handling

- Unmatched API routes return not found via `notFound` middleware.
- Errors are centralized through `globalErrorHandler`.
- Auth/role violations return `401/403` as appropriate.

## Build and Run in Production

```bash
npm run build
npm run start
```

## License

GNU General Public License v3.0 (GPL-3.0)
