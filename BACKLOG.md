# Product Backlog & Roadmap

**Project Name:** Simple Single-Tenant LMS
**Prioritization Strategy:** Logic-first (Data -> Admin -> Student -> Payments).

## PHASE 1: The Foundation (Skeleton)
*Goal: Setup infrastructure, database, and authentication.*

* [BE] Initialize Nuxt 3 project with Tailwind CSS & Prisma.
* [DB] Design `schema.prisma` (Users, Courses, Modules, Lessons, Progress).
* [BE] Implement Custom JWT Auth (Login, Register endpoints, Refresh Token logic).
* [BE] Create Middleware (`auth.global.ts` or specific) to protect `/admin` and `/course`.
* [FE] Basic Layouts implementation (Admin Layout vs. Learning Layout).

## PHASE 2: The Creator (Content Management)
*Goal: Allow the Admin to build the product.*

* [BE] API: CRUD for Courses (Create, Update, Delete, Set Status).
* [FE] Admin: Course Settings Form (Price, Name, Structure Mode: Modular/Flat/Freestyle).
* [BE] API: CRUD for Course Content (Modules/Lessons).
* [FE] Admin: Lesson Editor.
    * Integration of WYSIWYG editor (e.g., Tiptap or Quill).
    * Video Input (URL parser for YouTube/Vimeo -> specific Embed generator).
* [BE] Logic: Handle "Freestyle" vs "Structured" data retrieval.

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
* [FE] Quiz Component: Take quiz, calculate score locally (or server-side for security), show result.
* [FE] Homework Component: File upload / Text area.
* [BE] Admin Grading Interface: List submissions, Input Grade (Pass/Fail), Input Feedback.
* [FE] Student View: Display feedback on graded lessons.

## PHASE 5: Commerce (Stripe)
*Goal: Enable sales.*

* [BE] Integration: Stripe Checkout Session creation.
* [FE] Checkout Flow: "Buy" button -> capture "Invoice Details" (Textarea) -> Redirect to Stripe.
* [BE] Webhook: Handle `checkout.session.completed`.
    * Verify payment.
    * Create User (if new).
    * Create `Enrollment` record.
    * Send email (via SMTP/Resend/SendGrid).

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