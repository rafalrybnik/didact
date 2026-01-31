# Technical Architecture & Stack Strategy

**Project Name:** Simple Single-Tenant LMS
**Status:** DEFINED

## 1. Core Stack
| Layer          | Technology                       | Justification                                                |
| -------------- | -------------------------------- | ------------------------------------------------------------ |
| **Framework**  | **Nuxt 3** (Vue 3 + Nitro)       | Hybrid rendering: SSR for Sales Pages (SEO), SPA for Course Player. |
| **Database**   | **PostgreSQL**                   | Relational data integrity for Orders/Progress.               |
| **ORM**        | **Prisma**                       | Type-safe database access. Schema as the single source of truth. |
| **Styling**    | **Tailwind CSS**                 | Rapid UI development, utility-first.                         |
| **Validation** | **Zod**                          | Runtime validation for API bodies (Server) and Forms (Client). |
| **Auth**       | **Custom JWT** (HttpOnly Cookie) | Lightweight, controlled via Nuxt middleware.                 |
| **Hosting**    | **Docker** (Railway/VPS)         | Containerized deployment.                                    |

## 2. Directory Structure (Nuxt Standard)
The project will strictly follow the provided reference structure:

```text
didact/
├── app/
│   ├── components/     # UI Components (Atoms/Molecules)
│   ├── composables/    # Business Logic (e.g., useCourseProgress, useCart)
│   ├── pages/          # File-based routing
│   │   ├── admin/      # Protected Admin routes
│   │   ├── course/     # Protected Student routes
│   │   └── index.vue   # Public Sales page
│   └── layouts/        # AppLayout (Student), AdminLayout, PublicLayout
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
* **SSR-First:** Landing pages and Course Details rendered on server.
* **Security:** Zod validation on ALL server endpoints.
* **i18n:** No UI for translations. Text loaded from `/lang` JSON/CSV files.
* **Video:** No local video hosting. Only Embeds/Links stored in DB.