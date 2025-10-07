This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase schema and setup

This project is designed to use Supabase for authentication and the database. A complete schema and basic seed data are included under `supabase/`.

Contents:
- `supabase/schema.sql` — tables, enums, constraints, indexes, RLS policies, and storage policies
- `supabase/seed.sql` — optional seed data for accommodations and safety alerts

Quick start (requires Supabase CLI):

1) Login and link your project (once)

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

2) Apply the schema and seed

```bash
supabase db push --file supabase/schema.sql
supabase db push --file supabase/seed.sql
```

3) Generate types for TypeScript (optional but recommended)

```bash
supabase gen types typescript --linked --schema public > src/lib/db-types.ts
```

Notes:
- The schema uses RLS with per-user access for private tables and public read for catalog/alerts.
- A private Storage bucket `id-documents` is preconfigured with RLS so users can only access their own files at `id-documents/{user_id}/...`.
- The `profiles` table mirrors basic user fields. You can populate it via a signup hook or after user registration using a server action or Edge Function.

Environment variables (required):

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Phone login: The UI shows a Phone tab, but the current flow supports email/password. To enable phone OTP, we can integrate `supabase.auth.signInWithOtp` and add a minimal OTP input—open an issue and I’ll wire it in.

