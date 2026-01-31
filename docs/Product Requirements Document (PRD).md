# Product Requirements Document (PRD)

**Project Name:** Simple Single-Tenant LMS
**Version:** 1.1
**Status:** DRAFT
**Language:** English (Documentation), Polish (System Default)

## 1. Product Overview
### 1.1 Problem Statement
Existing LMS solutions (e.g., Moodle) are overly complex for individual course creators. They suffer from feature bloat, difficult UX, and complicated setup processes. The client requires a streamlined, purpose-built platform to create, sell, and deliver courses with minimal friction.

### 1.2 Product Goal
To build a lightweight, web-based Learning Management System (LMS) operating in a **Single Tenant** model. The system prioritizes:
1.  **Simplicity for the Creator:** Intuitive course construction and student management.
2.  **Simplicity for the Student:** Frictionless purchase flow and content consumption.
3.  **Sales & Marketing Autonomy:** Integrated sales via Stripe and built-in CMS features to manage public offers without external website dependencies.

## 2. Scope
### 2.1 In-Scope (MVP)
* **User Roles:** Admin (Creator), Student, Guest (Public Visitor).
* **Course Management:** Creation of courses with flexible structures (Modules/Lessons/Freestyle).
* **Content Types:** Text, Video (Embeds/Links), Quizzes, Homework assignments.
* **Public Frontend & CMS (NEW):**
    * **Course Catalog:** Publicly accessible list of published courses (thumbnail, price, title).
    * **Course Landing Pages:** Dedicated sales page for each course (separate from learning content) with rich text description and purchase buttons.
    * **Static Pages:** Admin can create generic pages (e.g., FAQ, Terms, About) accessible without login.
* **Sales & Access:**
    * Stripe integration (Payment intent -> Webhook -> Access grant).
    * Manual invoice data collection (simple text area).
* **Learning Experience:**
    * Progress tracking.
    * Gated content (sequential unlock).
* **Community:**
    * Per-course activity feed (posts + comments).
    * Private messaging (Student <-> Instructor only).
* **Tech Foundations:**
    * Polish language hardcoded as canonical.
    * Architecture ready for i18n via text files (CSV/PO), no UI for translations.

### 2.2 Out-of-Scope (Excluded)
* **Marketplace features:** No multiple instructors, no commission splitting.
* **Complex E-commerce:** No "Shopping Cart" (add multiple items). The model is "Direct Purchase" (Click Buy -> Stripe Checkout).
* **Video Hosting:** No direct video file upload to server (MVP uses embeds).
* **Discount Codes:** The application UI will NOT handle discount inputs (relies entirely on Stripe native checkout if configured).
* **Invoice Generation:** System does not generate PDF invoices; only stores data.
* **Translation UI:** No built-in interface for translating the system.
* **Student-to-Student Messaging:** Explicitly excluded.

## 3. User Personas
* **The Creator (Admin):** Focuses on content quality and sales. Wants to build a course in minutes, not hours. Hates technical configuration. Needs to edit sales copy and generic pages easily.
* **The Student:** Wants to pay quickly (BLIK/Card), access content immediately, and ask the instructor questions.
* **The Visitor (Guest):** Browses the catalog, reads course descriptions, and decides to purchase.

## 4. Functional Overview

### 4.1 Course Creation & Structure
* **Flexibility:** Creator selects structure mode per course:
    * *Modular:* Module -> Lesson.
    * *Flat:* List of lessons.
    * *Freestyle:* Unstructured content list.
* **Content Editor:** WYSIWYG editor for text. Fields for video embedding (iframe/URL).
* **Access Control:** Option to force sequential completion (Lesson B requires Lesson A completion).

### 4.2 Assessment & Grading
* **Quizzes:** Automated scoring. Immediate pass/fail result allowing progression.
* **Homework:** Student uploads file/text -> Instructor receives notification -> Instructor grades (Pass/Fail) and leaves text feedback -> Student sees feedback.

### 4.3 Sales & Payments
* **Provider:** Stripe.
* **Flow:** User clicks "Buy" on Public Landing Page -> Redirect/Modal -> Payment Success -> System creates account (if new) and grants access.
* **Invoicing:** Optional checkbox "I want an invoice" during checkout. Displays a generic `textarea` for user to paste billing details. No validation. Data saved with order for Admin reference.

### 4.4 Community & Communication
* **Course Feed:** A single "wall" for each course.
    * Students/Admin can post.
    * Comments allowed (max nesting: 1 level).
    * Admin can delete any post.
* **Private Messages:** Simple inbox. Thread per Student-Admin pair.

### 4.5 Public Frontend & CMS (NEW)
* **Public Catalog:** A grid view displaying all courses with status "Published". Cards show Thumbnail, Title, Price, and "See Details" button.
* **Course Sales Page:** A dedicated view separate from the curriculum.
    * **Admin View:** Specific tab in Course Settings to edit "Sales Description" (Rich Text), upload Thumbnail, and set Price.
    * **Public View:** Renders the Sales Description.
        * IF User NOT enrolled: Shows "Buy for X PLN" button.
        * IF User Enrolled: Shows "Go to Course" button.
* **Static Pages Manager:** Admin can create/edit/delete simple pages (Title, Slug, Content). Used for "About Us", "Regulations", "Privacy Policy". These pages are rendered with the public header/footer.

## 5. MVP Definition (Must-Haves)
1.  **Public Frontend:** Course Catalog, Dynamic Sales Pages, Static Page Renderer (SSR for SEO).
2.  **Admin Panel:** Create/Edit Course (Content + Sales Data), Manage Static Pages, Manage Users, View Orders.
3.  **Course Player:** View content, mark as complete, take quiz, submit homework.
4.  **Stripe Integration:** Checkout flow triggered from Sales Page -> Webhook processing.
5.  **Notification System:** Email/In-app alerts for key events.
6.  **Basic "My Account":** List of purchased courses, Profile settings.

## 6. Assumptions & Constraints
* **Language:** The codebase will use Polish as the primary source language. English keys/structure will be prepared but not active in UI initially.
* **Video:** The Creator is responsible for hosting videos on YouTube/Vimeo and providing valid links.
* **Compliance:** GDPR/RODO compliance features (checkboxes) are minimal but present (e.g., during registration).
* **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge). Mobile responsive.
* **SEO:** Public pages (Catalog, Landing, Static) must be Server-Side Rendered (Nuxt 3 SSR).