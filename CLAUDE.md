# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Didact is a single-tenant Learning Management System (LMS) for individual course creators. Built with Nuxt 3, it enables building, selling, and delivering online courses.

**Status:** Planning phase - implementation follows the 7-phase BACKLOG.md roadmap.

## Team Structure

- **Claude** - główny deweloper, pisze większość kodu
- **Gemini** - tech lead / architekt, funkcja kontrolna i doradcza

Przy decyzjach architektonicznych lub wątpliwościach technicznych - konsultuj z Gemini przed implementacją.

## Tech Stack

- **Framework:** Nuxt 3 (Vue 3 + Nitro for SSR/API)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Icons:** Lucide
- **Validation:** Zod (server and client)
- **Auth:** Custom JWT with HttpOnly cookies
- **Payments:** Stripe
- **Deployment:** Docker on Railway

## Development Commands

```bash
# Docker (recommended)
docker compose up        # Start app + PostgreSQL
docker compose down      # Stop containers

# Local (without Docker)
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npx prisma migrate dev   # Run database migrations
npx prisma generate      # Generate Prisma client
npx prisma studio        # Open database GUI
```

## Architecture

### Directory Structure
```
app/
├── components/      # UI components
├── composables/     # Business logic hooks (useCourseProgress, useCart)
├── layouts/         # AdminLayout, AppLayout (student), PublicLayout
└── pages/
    ├── admin/       # [PROTECTED] Admin dashboard & CMS
    ├── course/      # [PROTECTED] Student learning player
    ├── c/[slug].vue # [PUBLIC SSR] Course sales pages
    └── [slug].vue   # [PUBLIC SSR] Generic CMS pages

server/
├── api/             # REST endpoints (Nitro)
│   ├── auth/        # Login/Register
│   └── webhooks/    # Stripe listener
├── utils/           # Shared helpers (prisma client, stripe client)
└── middleware/      # Server-side auth guards

prisma/
└── schema.prisma    # Database models

lang/                # Translation files (pl.json)
```

### Rendering Strategy
- **SSR:** Public pages (catalog, sales pages, CMS pages) for SEO
- **SPA:** Protected routes (`/admin`, `/course`) for UX

### Route Protection
- `/admin/*` - Admin only (via Nuxt middleware)
- `/course/*` - Enrolled students only
- `/c/*`, `/[slug]`, `/` - Public

### Key Patterns
- All server endpoints must use Zod validation
- No local video hosting - embeds only (YouTube/Vimeo)
- i18n via JSON files in `/lang` directory (Polish primary)
- Direct purchase model (no shopping cart)

## UI/UX Guidelines

See `docs/UI.md` for full details. Key principles:

- **Philosophy:** "Content First" - UI recedes to let course content shine
- **Style:** "Refined Utility" - professional but not generic
- **"10% Magic" rule:** Unique branding only on: Buy button, Course Player sidebar, Logo/Header
- **Typography:** Inter or Plus Jakarta Sans, generous whitespace
- **Colors:** Single brand color + Slate/Zinc neutrals (no pure black)
- **Components:** Skeleton loaders (not spinners), Toast notifications, subtle shadows
- **Transitions:** `transition-all duration-200` on interactive elements

## Database Models

Core entities: Users, Courses, Modules, Lessons, Progress, Orders, Pages, Posts, Threads, Quiz, Homework, Submission

## Documentation

Located in `docs/`:
- `PRD.md` - Product requirements and scope
- `FRS.md` - Functional requirements specification
- `TECH_STACK.md` - Technical architecture decisions
- `BACKLOG.md` - Development roadmap (7 phases)
- `UI.md` - UI/UX design guidelines and component specs
