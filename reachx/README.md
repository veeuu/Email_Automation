# ReachX

An email campaign platform built with Next.js. Create campaigns, manage contacts, validate emails, and track delivery — all in one place.

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Auth** — NextAuth v5 with Prisma adapter
- **Database** — PostgreSQL via Prisma ORM
- **Email** — Brevo (transactional email API)
- **Queue** — BullMQ + Redis (background email sending)
- **UI** — Tailwind CSS v4 + shadcn/ui components

## Features

- Email validation (format, MX records, mailbox check)
- Campaign creation and management
- Contact management with CSV import
- Background email sending via BullMQ workers
- Per-campaign analytics (sent, opened, clicked, bounced)
- Auth with credential-based login and registration

## Project Structure

```
reachx/
├── app/
│   ├── api/              # API routes (auth, campaigns, contacts, validate, stats)
│   ├── dashboard/        # Protected dashboard pages
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── validate/         # Public email validator page
│   └── page.tsx          # Landing page
├── components/
│   ├── sidebar.tsx       # Dashboard sidebar
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── brevo.ts          # Brevo email client
│   ├── prisma.ts         # Prisma client
│   ├── queue.ts          # BullMQ queue setup
│   └── utils.ts          # Shared utilities
├── prisma/
│   └── schema.prisma     # Database schema
├── types/
│   └── next-auth.d.ts    # NextAuth type extensions
└── workers/
    └── emailWorker.ts    # BullMQ email worker
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/reachx"

AUTH_SECRET="your-auth-secret"

BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="you@yourdomain.com"
BREVO_SENDER_NAME="ReachX"

REDIS_URL="redis://localhost:6379"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

| Model | Description |
|---|---|
| `User` | Registered users |
| `Contact` | User's email contacts |
| `Campaign` | Email campaigns (draft → sending → sent) |
| `Recipient` | Per-campaign recipients with validation status |
| `EmailEvent` | Delivery events (sent, opened, clicked, bounced, spam) |

## Email Queue

Emails are sent asynchronously via BullMQ. When a campaign is triggered, jobs are enqueued and processed by `workers/emailWorker.ts` with:
- Concurrency of 5
- 3 retry attempts with exponential backoff (5s base delay)

To run the worker in production, start it as a separate process alongside the Next.js server.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
