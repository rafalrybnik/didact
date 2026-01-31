# Functional Requirements Specification (FRS)

**Project Name:** Simple Single-Tenant LMS
**Version:** 1.0
**Status:** DRAFT
**Dependencies:** PRD v1.0

## 1. Actors & Roles
* **ADMIN (Creator):** Full access to system configuration, course creation, user management, and financial overview.
* **STUDENT:** Access to purchased courses, profile management, and communication with the Admin.
* **SYSTEM:** Automated background processes (cron jobs, webhooks).

---

## 2. Functional Requirements

### 2.1 Authentication & User Management

**REQ-001: Registration via Purchase**
* **Description:** New users are created automatically when a payment is confirmed via Stripe Webhook.
* **Acceptance Criteria:**
    * IF the email from Stripe does not exist in DB -> Create new user, generate random password, send "Welcome Email" with login link/credentials.
    * IF the email exists -> Grant access to the new course and send "Access Granted" email.

**REQ-002: Manual Registration / Login**
* **Description:** Standard email/password login and optional manual registration (if free courses exist or for pre-sales).
* **Acceptance Criteria:**
    * User can reset password via email link.
    * User can update basic profile data (Name, Avatar).

---

### 2.2 Course Management (Admin Side)

**REQ-010: Create/Edit Course**
* **Description:** Admin creates a course entity.
* **Acceptance Criteria:**
    * Admin selects structure mode: `Modular`, `Flat List`, or `Freestyle`.
    * Admin sets "Publication Status": `Draft`, `Published`, `Archived`.
    * Admin sets price (currency hardcoded to PLN for MVP or selectable).

**REQ-011: Content Management (Curriculum)**
* **Description:** Adding lessons/materials to the course.
* **Acceptance Criteria:**
    * Admin can add "Lesson" or "Section" (depending on structure mode).
    * **Lesson Content Types:**
        * **Rich Text:** WYSIWYG editor.
        * **Video:** Input field for URL (YouTube/Vimeo) or raw `<iframe>` code.
        * **Downloadable Assets:** Upload PDF/Zip (hosted on local server for MVP).
    * Admin can reorder lessons via drag-and-drop or simple "Move Up/Down" buttons.

**REQ-012: Access Logic Settings**
* **Description:** Defining how students progress.
* **Acceptance Criteria:**
    * Checkbox: "Enforce Sequential Order" (Next lesson locked until current is completed).
    * Checkbox: "Require Assignment Pass" (Next lesson locked until Quiz/Homework passed).

---

### 2.3 Learning Experience (Student Side)

**REQ-020: Course Player Interface**
* **Description:** The main view where students consume content.
* **Acceptance Criteria:**
    * Sidebar (or Drawer): Shows curriculum tree with progress indicators (Locked, Completed, In Progress).
    * Main Content Area: Renders the lesson content.
    * Navigation: "Previous" and "Next" buttons.
    * "Mark as Complete" button (if no quiz/homework required).

**REQ-021: Video Playback**
* **Description:** Rendering video content.
* **Acceptance Criteria:**
    * System sanitizes and renders the `<iframe>` provided by Admin.
    * Responsive aspect ratio (16:9).

---

### 2.4 Assessments

**REQ-030: Quizzes**
* **Description:** Simple multiple-choice tests.
* **Acceptance Criteria:**
    * Admin defines questions and correct answers.
    * Student takes quiz -> System calculates score immediately.
    * IF score >= Threshold (set by Admin) -> Lesson marked "Passed".
    * IF score < Threshold -> Student can retry (Admin configures max retries or infinite).

**REQ-031: Homework (Manual Grading)**
* **Description:** Assignments requiring file upload or text input.
* **Acceptance Criteria:**
    * Student sees prompt and form to upload file/write text.
    * Status changes to "Pending Review".
    * Admin sees notification "New Homework to Grade".
    * Admin provides:
        * Status: `Pass` or `Reject`.
        * Feedback: Text comment.
    * Student receives notification.
    * IF `Pass` -> Next lesson unlocks (if sequential mode active).

---

### 2.5 Community & Messaging

**REQ-040: Course Feed**
* **Description:** A social wall specific to each course.
* **Acceptance Criteria:**
    * List of posts ordered chronologically.
    * "Add Post" form (Text + optional image).
    * "Reply" button on posts (Max depth: 1 level).
    * Admin visual distinction (e.g., "Instructor" badge).

**REQ-041: Private Messaging**
* **Description:** 1-on-1 communication.
* **Acceptance Criteria:**
    * Student selects "Contact Instructor".
    * Admin sees inbox with conversation threads.
    * Student CANNOT search for or message other students.

---

### 2.6 Payments & Orders

**REQ-050: Checkout Integration**
* **Description:** Handling purchase intent.
* **Acceptance Criteria:**
    * "Buy Now" button redirects to Stripe Checkout Session.
    * Metadata passed to Stripe: `course_id`, `user_id` (if logged in).

**REQ-051: Invoice Data Capture**
* **Description:** Optional data collection for invoices.
* **Acceptance Criteria:**
    * Before redirecting to Stripe, user sees checkbox "I want an invoice".
    * If checked -> Show `textarea` (Label: "Invoice Details").
    * Input is saved in local Order database record.
    * NO validation performed on this field.

---

## 3. Non-Functional Requirements

**NFR-001: Internationalization (i18n)**
* Architecture must support language separation.
* All UI labels must be stored in translation files (e.g., `.json`, `.po`, or `.php` arrays), NOT hardcoded in templates.
* Default file: `pl.json` (or equivalent).

**NFR-002: Security**
* Passwords hashed (Argon2 or Bcrypt).
* Video embeds sanitized (prevent XSS from malicious iframes if Admin account is compromised, though Admin is trusted).
* File uploads (Homework) restricted by extension (e.g., no .exe, .php).

**NFR-003: Performance**
* Page load time < 2s on standard 4G.
* Database optimized for read-heavy operations (Students reading content).