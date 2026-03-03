# HEI Origination Platform

## Overview

Mortgage/Home Equity Investment (HEI) origination platform. Handles loan applications, form validation, PDF document generation (via Puppeteer), and file storage (via AWS S3). Built as a Next.js full-stack application with Prisma ORM and PostgreSQL.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.6
- **UI:** React 18.3, Tailwind CSS 3.4, Radix UI, shadcn/ui
- **ORM:** Prisma 5.22 with PostgreSQL
- **Validation:** Zod 3.23, React Hook Form 7.53
- **PDF Generation:** Puppeteer 24
- **Storage:** AWS S3 (presigned URLs via @aws-sdk/client-s3)
- **Math:** decimal.js for financial calculations
- **Package Manager:** npm

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint with auto-fix
npm run format           # Prettier format all files
npm run format:check     # Prettier check (CI)

# Database
npm run prisma:migrate   # Run Prisma migrations (dev)
npm run prisma:generate  # Generate Prisma client
npm run studio           # Open Prisma Studio
npm run seed             # Seed the database
```

## Project Structure

```
app/                    # Next.js App Router pages and API routes
components/             # React components (shadcn/ui pattern)
lib/                    # Shared utilities, helpers, and business logic
prisma/
  schema.prisma         # Database schema (source of truth)
  seed.ts               # Database seed script
  migrations/           # Prisma migration history
```

## Conventions

- **Database:** Prisma is the ORM. All schema changes go through `prisma/schema.prisma` and are applied via `prisma migrate dev`. Never write raw SQL unless absolutely necessary.
- **Validation:** Zod schemas for all input validation. React Hook Form with `@hookform/resolvers` for form state management.
- **PDF Generation:** Puppeteer renders HTML templates to PDF. PDF generation runs server-side only (API routes).
- **File Storage:** AWS S3 with presigned URLs for uploads and downloads. Never expose S3 credentials to the client.
- **Financial Math:** Use `decimal.js` for all monetary calculations. Never use native JavaScript floating-point arithmetic for financial values.
- **UI Components:** Follow shadcn/ui patterns. Components in `components/` directory. Use `class-variance-authority` for component variants.
- **Styling:** Tailwind CSS with `tailwind-merge` and `clsx` for class composition.
- **Environment:** `.env` for local development (not committed). `.env.example` has placeholder structure.
- **TypeScript:** Strict mode. No `any` types — use `unknown` if the type is genuinely unknown.
- **Error Handling:** All API routes must have try/catch with appropriate HTTP status codes. Never leak internal error details to the client.
