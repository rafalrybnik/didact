# Didact LMS

Single-tenant Learning Management System for individual course creators. Built with Nuxt 3.

## Features

- **Course Management** - Create courses with modular or flat structure
- **Lesson Player** - Video embeds (YouTube/Vimeo), rich text content
- **Assessments** - Quizzes with auto-grading, homework with manual review
- **Payments** - Stripe integration with Polish payment methods (BLIK, P24)
- **Community** - Course feed with posts/comments, private messaging
- **Admin Dashboard** - Full CMS for content, orders, and submissions

## Tech Stack

- **Framework:** Nuxt 3 (Vue 3 + Nitro)
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** Tailwind CSS
- **Auth:** Custom JWT (HttpOnly cookies)
- **Payments:** Stripe
- **Deployment:** Docker (Railway)

## Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Quick Start

```bash
# 1. Clone and install
git clone https://github.com/rafalrybnik/didact.git
cd didact
npm install

# 2. Setup environment
cp .env.example .env

# 3. Start PostgreSQL
docker compose up -d

# 4. Run dev server
npm run dev
```

App runs at http://localhost:3000

### Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run tests

# Database
npx prisma migrate dev    # Run migrations
npx prisma studio         # Database GUI

# Docker
docker compose up -d      # Start PostgreSQL
docker compose down       # Stop containers
```

## Production

### Local Production Testing

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Deploy to Railway

1. **Create Railway Project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL**
   - Go to Railway Dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - The `DATABASE_URL` is automatically shared

3. **Configure Environment Variables**
   In Railway Dashboard → Variables:
   ```
   JWT_SECRET=your-secret-key-min-32-chars
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NUXT_PUBLIC_APP_URL=https://your-app.up.railway.app
   ```

4. **Deploy**
   ```bash
   railway up
   ```
   Or connect GitHub for auto-deploy on push.

5. **Generate Domain**
   ```bash
   railway domain
   ```

6. **Configure Stripe Webhook**
   In Stripe Dashboard → Webhooks:
   - Endpoint: `https://your-app.up.railway.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing (min 32 chars) |
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NUXT_PUBLIC_APP_URL` | No | Public app URL (for emails, redirects) |

## Project Structure

```
didact/
├── app/
│   ├── components/     # UI components
│   ├── composables/    # Business logic
│   ├── layouts/        # Page layouts
│   └── pages/          # File-based routing
├── server/
│   ├── api/            # REST endpoints
│   └── utils/          # Server helpers
├── prisma/
│   └── schema.prisma   # Database schema
└── docs/               # Documentation
```

## License

MIT
