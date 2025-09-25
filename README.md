# HEI Origination Platform (scaffold)

This is a starter scaffold using:

- Next.js 14 (App Router)
- React
- PostgreSQL with Prisma
- Tailwind CSS
- Small shadcn-like local UI components

Note about shadcn/ui:

- This scaffold includes a very small set of local components in `components/ui/` inspired by the look-and-feel of `shadcn/ui` so the repo is self-contained.
- If you'd like the official `shadcn/ui` integration (recommended for full-featured component set and design system), follow their setup instructions. It typically involves installing `@shadcn/ui` and running their component generator. For a quick integration:

```powershell
npm install @shadcn/ui
npx shadcn-ui@latest init
# then follow prompts to generate components into your project
```

Adjust imports (replace local `components/ui/*` with generated components) as needed.

- React Hook Form + Zod
- Puppeteer for server-side PDF generation

Quick setup (PowerShell):

1. Install dependencies

```powershell
npm install
```

2. Copy env and set `DATABASE_URL` in `.env` or use `.env.example` as a template.

```powershell
cp .env.example .env
# edit .env to point to your Postgres instance
```

3. Generate Prisma client and run migrations

```powershell
npm run prisma:generate
# create an initial migration (requires a running Postgres DB)
npx prisma migrate dev --name init
```

4. Run dev server

```powershell
npm run dev
```

Notes:

- Puppeteer downloads a Chromium binary during `npm install` which can increase install time. In container/CI you might need the `--no-sandbox` flag; the API route already launches Chromium with `--no-sandbox`.
- The project is a scaffold. Wire up secrets, auth, and production configuration before deploying.
