# Technical Architecture & Stack Strategy

**Project Name:** Simple Single-Tenant LMS
**Version:** 1.1
**Status:** APPROVED

## 1. Core Stack
| Layer          | Technology                       | Justification                                                |
| -------------- | -------------------------------- | ------------------------------------------------------------ |
| **Framework** | **Nuxt 3** (Vue 3 + Nitro)       | Hybrid rendering: SSR for Sales Pages/CMS (SEO), SPA for Course Player. |
| **Database** | **PostgreSQL** | Relational data integrity for Orders/Progress.               |
| **ORM** | **Prisma** | Type-safe database access. Schema as the single source of truth. |
| **Styling** | **Tailwind CSS** | Rapid UI development, utility-first.                         |
| **Validation** | **Zod** | Runtime validation for API bodies (Server) and Forms (Client). |
| **Auth** | **Custom JWT** (HttpOnly Cookie) | Lightweight, controlled via Nuxt middleware.                 |
| **Hosting** | **Docker** (Railway/VPS)         | Containerized deployment.                                    |

## 2. Directory Structure (Nuxt Standard)
The project will strictly follow the provided reference structure.
Note the distinction between public (SEO) routes and protected app routes.

```text
didact/
├── app/
│   ├── components/     # UI Components (Atoms/Molecules)
│   ├── composables/    # Business Logic (e.g., useCourseProgress, useCart)
│   ├── layouts/        # AppLayout (Student), AdminLayout, PublicLayout
│   ├── pages/          # File-based routing
│   │   ├── admin/      # [PROTECTED] Admin Dashboard & CMS Editor
│   │   ├── course/     # [PROTECTED] Student Learning Player
│   │   ├── c/
│   │   │   └── [slug].vue # [PUBLIC] Course Sales Page (SSR)
│   │   ├── index.vue   # [PUBLIC] Homepage / Course Catalog
│   │   └── [slug].vue  # [PUBLIC] Generic CMS Pages (e.g. /about, /terms)
├── server/
│   ├── api/            # REST Endpoints (Nitro routes)
│   │   ├── auth/       # Login/Register
│   │   ├── webhooks/   # Stripe listener
│   │   └── ...
│   ├── utils/          # Shared server helpers (prisma client, stripe client)
│   └── middleware/     # Server-side auth verification (guard)
├── prisma/
│   └── schema.prisma   # DB Model
├── lang/               # Translation files (e.g., pl.json) - simple key-value
└── docker-compose.yml

```

## 3. Key Patterns

* **SSR-First:** Public pages (Catalog, Sales Page, Generic Content) are rendered on the server for SEO.
* **Hybrid Routing:** Protected routes (`/course/...`, `/admin/...`) can act as SPA for better UX.
* **Security:** Zod validation on ALL server endpoints.
* **i18n:** No UI for translations. Text loaded from `/lang` JSON/CSV files.
* **Video:** No local video hosting. Only Embeds/Links stored in DB.