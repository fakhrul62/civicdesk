# CivicDesk

CivicDesk is a government complaint management portal built to make civic issue reporting transparent, trackable, and easier to manage. Citizens can submit complaints, follow ticket progress, and receive status updates, while administrators and service teams get a structured workspace for triage, assignment, SLA tracking, audit history, and resolution.

The project is designed for municipal service workflows where accountability matters: every complaint becomes a ticket, every ticket has a lifecycle, and both citizens and staff can see the information relevant to their role.

## What It Does

- Citizen complaint submission with category, location, description, and attachment support.
- Public ticket tracking by ticket ID.
- Citizen dashboard for complaint history and status visibility.
- Admin workspace for tickets, agents, analytics, audit logs, and service settings.
- Role-aware access for citizens, agents, supervisors, and admins.
- Ticket messages, internal notes, timeline events, notifications, and immutable audit logs.
- SLA-oriented categories with priority and department ownership.
- Light/dark theme support and English/Bangla interface support.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Base UI component primitives
- Prisma 7 with PostgreSQL
- Supabase integration for auth/session and storage-facing workflows
- Upstash Redis for optional rate-limiting support
- Resend for transactional email
- ESLint 9

## Project Structure

```text
actions/       Server actions for auth, tickets, messages, and admin workflows
app/           Next.js App Router pages, layouts, and route-level clients
components/    Shared navigation, providers, and reusable UI components
lib/           Auth, database, email, validation, utility, and integration helpers
prisma/        Database schema, setup scripts, SQL, and category seed data
public/        Static assets served by Next.js
```

## Main Routes

```text
/                 Public landing page with stats and ticket lookup
/submit           Citizen complaint submission
/track            Public ticket tracking
/dashboard        Citizen complaint dashboard
/complaints/[id]  Complaint detail page
/login            Sign in
/signup           Account creation
/admin            Admin overview
/admin/tickets    Ticket management
/admin/agents     User and staff management
/admin/analytics  Service analytics
/admin/audit-log  Audit history
/admin/settings   Category and SLA settings
```

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL database
- Supabase project credentials
- Optional: Upstash Redis credentials
- Optional: Resend API key and verified sender

## Environment Variables

Create a local `.env` file with the values needed for your environment:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_URL="https://your-project.supabase.co"

NEXTAUTH_URL="http://localhost:3000"

UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

RESEND_API_KEY=""
RESEND_FROM_EMAIL="CivicDesk <noreply@example.com>"
```

Only `DATABASE_URL`, `JWT_SECRET`, and the Supabase values are required for the core app. Redis and Resend can be left empty for local UI and database workflow testing if those integrations are not being exercised.

## Getting Started

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npm run postinstall
```

Apply the schema to the database:

```bash
npm run db:push
```

Seed the complaint categories:

```bash
npm run db:seed
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

If port `3000` is already in use, run:

```bash
npx next dev -p 3001 -H 127.0.0.1
```

## Available Scripts

```bash
npm run dev        # Start the Next.js development server
npm run build      # Generate Prisma client and build for production
npm run start      # Start the production server after a build
npm run lint       # Run ESLint
npm run db:push    # Push Prisma schema changes to the database
npm run db:migrate # Create and apply a development migration
npm run db:seed    # Seed active complaint categories
npm run db:studio  # Open Prisma Studio
npm run db:reset   # Reset the database and seed categories
```

## Database Model

The Prisma schema models the complaint lifecycle around:

- `User` records for citizens and staff roles.
- `Ticket` records for submitted complaints.
- `Category` records for departments, SLA hours, and default priority.
- `Message` records for public and internal ticket communication.
- `Attachment` records for submitted files.
- `TimelineEvent` records for visible ticket progress.
- `AuditLog` records for administrative accountability.
- `Notification` records for user-facing updates.
- `SystemSetting` records for operational configuration.

## Development Notes

- This app uses Next.js 16, so check `node_modules/next/dist/docs/` before changing framework-specific conventions.
- UI components are built on Base UI patterns, not Radix `asChild` assumptions.
- The seed script creates complaint categories only. It does not create users, tickets, messages, or demo credentials.
- Keep `.env`, `.next`, `.vercel`, `node_modules`, generated Prisma output, and local dev logs out of version control.

## Production Build

Run:

```bash
npm run build
npm run start
```

Before deploying, confirm production environment variables are configured in the hosting provider and that the database schema has been applied.
