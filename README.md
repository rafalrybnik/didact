# Didact LMS

Single-tenant Learning Management System for individual course creators. Built with Nuxt 3.

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

### Build Docker Image

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `NUXT_PUBLIC_APP_URL` | Public app URL |

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
