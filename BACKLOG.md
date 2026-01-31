* # Product Backlog & Roadmap

  **Project Name:** Simple Single-Tenant LMS
  **Version:** 1.1
  **Prioritization Strategy:** Logic-first (Data -> Admin -> Student -> Public/Sales).

  ## PHASE 1: The Foundation (Skeleton)
  *Goal: Setup infrastructure, database, and authentication.*

  * [BE] Initialize Nuxt 3 project with Tailwind CSS & Prisma.
  * [DB] Design `schema.prisma` (Users, Courses, Modules, Lessons, Progress).
  * [BE] Implement Custom JWT Auth (Login, Register endpoints, Refresh Token logic).
  * [BE] Create Middleware (`auth.global.ts` or specific) to protect `/admin` and `/course`.
  * [FE] Basic Layouts implementation:
      * `AdminLayout` (Dashboard).
      * `AppLayout` (Student Learning).
      * `PublicLayout` (Header/Footer for Catalog/Sales).

  ## PHASE 2: The Creator & CMS (Content Management)
  *Goal: Allow the Admin to build the product AND the marketing content.*

  * [DB] Update Schema: Add `Page` model (slug, title, content, meta_desc).
  * [DB] Update Schema: Add `Course` sales fields (`sales_description`, `thumbnail_url`, `slug`).
  * [BE] API: CRUD for Courses (Create, Update, Delete, Set Status).
  * [BE] API: CRUD for Static Pages.
  * [FE] Admin: Course Settings Form.
      * General: Name, Price, Structure Mode.
      * **Sales Tab (New):** Rich Text Editor for description, Thumbnail uploader, Slug input.
  * [FE] Admin: Static Page Editor (Create/Edit generic pages like "About Us").
  * [FE] Admin: Lesson Editor (Curriculum management, Video embeds).

  ## PHASE 3: The Student (Learning Experience)
  *Goal: Allow the user to consume content.*

  * [BE] API: `getCourseDetails` (checks access rights).
  * [FE] Player UI: Sidebar navigation (Dynamic based on structure mode).
  * [FE] Player UI: Content renderer (Video embed + Text).
  * [BE/FE] Progress Tracking:
      * "Mark as Complete" button logic.
      * Visual progress bar.
      * Logic: Unlock next lesson if "Sequential Order" is active.

  ## PHASE 4: Assignments & Assessment
  *Goal: Verify student knowledge.*

  * [DB] Update Schema: `Quiz`, `Question`, `Homework`, `Submission`.
  * [FE] Quiz Component: Take quiz, calculate score locally (or server-side), show result.
  * [FE] Homework Component: File upload / Text area.
  * [BE] Admin Grading Interface: List submissions, Input Grade, Input Feedback.
  * [FE] Student View: Display feedback on graded lessons.

  ## PHASE 5: Commerce & Public Front
  *Goal: Enable sales and public browsing.*

  * [FE] Public Layout: Implement Header (Logo, Auth buttons) and Footer (Dynamic Page Links).
  * [FE] **Page: Course Catalog** (Grid of courses from DB where status=Published).
  * [FE] **Page: Single Course Landing Page (SSR)**.
      * Display Sales Description & Price.
      * Logic: Check if user owns course -> Show "Go to Course" button.
      * Logic: If not owned -> Show "Buy" button.
  * [FE] **Page: Static Page Renderer** (Dynamic route `/[slug].vue`).
  * [BE] Integration: Stripe Checkout Session creation (linked from Landing Page).
  * [FE] Checkout Flow: "Buy" button -> capture "Invoice Details" -> Redirect to Stripe.
  * [BE] Webhook: Handle `checkout.session.completed` (Create User, Enrollment, Email).

  ## PHASE 6: Community (Social)
  *Goal: Enable interaction.*

  * [DB] Update Schema: `Post`, `Comment`, `Thread`.
  * [FE] Course Feed Component:
      * Post input.
      * List posts.
      * Comment input (nested level 1).
  * [FE] Messaging Component: Simple inbox for Student <-> Admin.

  ## PHASE 7: Polish & Launch
  * [dev] Security Audit (Zod validation check on all endpoints).
  * [dev] Extract all hardcoded strings to `/lang/pl.json`.
  * [ops] Dockerize and Deploy to staging.