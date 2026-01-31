# UI/UX Design Brief & Implementation Plan

**Project Name:** Didact
**Goal:** Create a visual identity that is "Professional & Trustworthy" but not "Generic Template".
**Philosophy:** "Content First." The UI should recede to let the course content shine.
**Tech Stack Alignment:** Nuxt 3 + Tailwind CSS.

## 1. Visual Direction: "Refined Utility"

We want to avoid the "Bootstrap look" (too blocky/generic) and the "Dribbble look" (too artistic/unusable).

### 1.1 Core Principles
* **Typography is King:** Since 90% of a course is reading/listening, typography must be perfect. Use a high-quality sans-serif font family.
* **Breathing Room:** generous whitespace. Don't cram elements.
* **Subtle Depth:** Use subtle borders and soft shadows instead of flat generic surfaces.
* **Consistent Iconography:** Use a cohesive icon set (e.g., Lucide, Phosphor, Heroicons).

### 1.2 The "10% Magic" Rule
To avoid the generator look, apply unique branding to only 10% of elements:
* The **"Buy" Button** (gradient or specific shadow).
* The **Course Player Sidebar** (distinct background or blur effect).
* The **Logo/Header** area.
* *Everything else should be standard, clean UI components for maximum usability.*

---

## 2. Execution Roadmap (The Mini-Project)

### Phase 1: The Foundations (Global Styles)
*Deliverable: `tailwind.config.ts` updates & `app.css`*

1.  **Typography Selection:**
    * *Recommendation:* **Inter** (Safe, clean) OR **Plus Jakarta Sans** (Modern, friendly).
    * *Action:* Select distinct weights (Regular, Medium, Semibold).
2.  **Color Palette:**
    * **Primary:** Pick ONE brand color (e.g., Deep Indigo, Teal, or Slate).
    * **Neutrals:** A rich scale of grays (Slate or Zinc in Tailwind) for text. DO NOT use pure black (`#000`). Use `#0f172a` or similar.
    * **Semantic:** distinct colors for Success (Green), Error (Red), Warning (Amber).
3.  **Border Radius:**
    * Define a global radius strategy.
    * *Suggestion:* `rounded-lg` (0.5rem) or `rounded-xl` for a modern, approachable feel.

### Phase 2: Key Component Design (The "Legos")
*Deliverable: Vue Components in `/components/ui`*

1.  **Buttons:** Primary (Brand color), Secondary (Outline/Ghost). Add a subtle active state (scale down 98% on click).
2.  **Input Fields:** High readability. Inputs should have a subtle border that highlights clearly on focus.
3.  **Cards:** Used for the Course Catalog. White background, subtle shadow (`shadow-sm`), hover lift effect (`hover:shadow-md`).
4.  **Badges:** For status (Draft, Published, Completed).

### Phase 3: Critical Views Design (Mockups or Code)

**A. The Public Landing Page (Sales)**
* *Vibe:* Marketing, High Trust.
* *Key Element:* A clean "Hero Section" with the Course Title, a large Thumbnail, and a sticky "Buy" card on the right (desktop) or bottom (mobile).

**B. The Course Player (Learning)**
* *Vibe:* Focus, Distraction-free.
* *Layout:*
    * **Sidebar:** Darker or muted background. List of modules. Current lesson highlighted clearly.
    * **Main Area:** White paper-like background. Maximum readability width (max-w-prose).
    * **Video:** 16:9 Aspect Ratio container with rounded corners.

**C. The Admin Dashboard (Management)**
* *Vibe:* Dense data, Control.
* *Key Element:* A clear data table for "Students" and "Orders". Simple metrics cards (Total Revenue).

### Phase 4: Micro-Interactions (The "Premium" Feel)
* **Transitions:** Add `transition-all duration-200` to interactive elements.
* **Loading States:** Use "Skeleton" loaders (shimmering gray shapes) instead of spinning wheels for data fetching.
* **Feedback:** Toast notifications for actions (e.g., "Settings Saved").

---

## 3. Recommended Resources (For Devs/Designers)

* **Icons:** [Lucide Icons](https://lucide.dev/) (Clean, consistent, widely used in Vue).
* **Colors:** [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors).
* **Inspiration:**
    * *Linear.app* (For the dark/sidebar aesthetic).
    * *Refactoring UI* (Book/Philosophy).
    * *Untitled UI* (Figma kit structure).