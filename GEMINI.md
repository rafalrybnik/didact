## Roles & Collaboration
*   **Gemini (Tech Lead & Architect):** Acts as the primary advisor and controller. Responsible for architectural decisions, code quality oversight, security standards, and high-level strategy.
*   **Claude (Lead Developer):** The primary implementer. Responsible for writing the majority of the code, executing the roadmap, and following the architectural guidelines set by the Tech Lead.

## Project Overview
**Didact** is a planned single-tenant Learning Management System (LMS) designed for individual course creators. It aims to provide a streamlined, purpose-built platform for building, selling, and delivering online courses without the complexity of larger LMS solutions like Moodle.

**Current Status:** 🚧 **Planning Phase**
The repository currently contains documentation and requirements. The actual codebase (Nuxt 3 application) has **not yet been initialized**.

## Documentation
The core project definition is located in the `docs/` directory:
*   `docs/PRD.md`: **Product Requirements Document** - Detailed scope, user personas, and functional requirements.
*   `docs/BACKLOG.md`: **Roadmap** - A 7-phase implementation plan.
*   `docs/FRS.md`: **Functional Requirements Specification**.
*   `docs/TECH_STACK.md`: **Technical Architecture**.

## Planned Tech Stack
*   **Framework:** Nuxt 3 (Vue 3 + Nitro)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Styling:** Tailwind CSS
*   **Authentication:** Custom JWT (HttpOnly cookies)
*   **Payments:** Stripe Integration

## Intended Architecture
Based on `CLAUDE.md` and `PRD.md`, the application will follow this structure once initialized:

*   **Public Frontend (SSR):**
    *   Course Catalog
    *   Sales/Landing Pages (separate from learning content)
    *   Static CMS Pages (About, Terms, etc.)
*   **Protected App (SPA):**
    *   `/admin`: Creator dashboard for managing courses, users, and generic pages.
    *   `/course`: Student learning player.

## Development Workflow (Future)
Once the project is initialized (Phase 1 of Backlog), the following commands are planned:

*   `npm run dev`: Start development server.
*   `npm run build`: Build for production.
*   `npx prisma migrate dev`: Run database migrations.
*   `npx prisma studio`: Open database GUI.

## Next Steps
The immediate next task is **Phase 1: The Foundation**, which involves:
1.  Initializing the Nuxt 3 project.
2.  Setting up Tailwind CSS and Prisma.
3.  Designing the initial database schema (`schema.prisma`).
