# TODO.md - Plan Implementacji Didact LMS

## Podsumowanie

Plan implementacji w 7 fazach, zgodnie z BACKLOG.md. Każda faza zawiera konkretne zadania programistyczne z zależnościami.

**Target deployment:** Railway (Docker container + PostgreSQL add-on)

---

## FAZA 1: Fundament (Infrastruktura)

### 1.1 Inicjalizacja projektu
- [x] `npx nuxi init didact` - utworzenie projektu Nuxt 3
- [x] Instalacja zależności: `@nuxtjs/tailwindcss`, `prisma`, `@prisma/client`, `zod`, `jsonwebtoken`, `bcrypt`, `lucide-vue-next`, `nuxt-security`
- [x] Konfiguracja `nuxt.config.ts`:
  - Moduły (`tailwindcss`, `nuxt-security`)
  - runtimeConfig dla JWT_SECRET, STRIPE_KEY, DATABASE_URL
  - Nitro preset: `node-server`
  - Host: `0.0.0.0`, Port: `process.env.PORT || 3000` (Railway requirement)
- [x] Setup Vitest (konfiguracja środowiska testowego)

### 1.2 Docker - Środowisko lokalne i produkcyjne
- [x] `Dockerfile` (multi-stage build):
  - Stage 1: `node:20-alpine` - instalacja dependencies + build
  - Stage 2: `node:20-alpine` - tylko produkcyjne pliki + `node .output/server/index.mjs`
  - Prisma generate w buildzie
  - **WAŻNE:** Migracje (`prisma migrate deploy`) NIE mogą być w buildzie. Będą uruchamiane jako Railway Deploy Command.
- [x] `docker-compose.yml` (dev):
  - Serwis `db` - PostgreSQL 16
  - Network dla komunikacji między serwisami
- [x] `docker-compose.prod.yml` - wersja produkcyjna do testów lokalnych
- [x] `.dockerignore` (node_modules, .nuxt, .output, .git)
- [x] `.env.example` z wymaganymi zmiennymi:
  ```
  DATABASE_URL=postgresql://user:pass@localhost:5432/didact
  JWT_SECRET=your-secret-key
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### 1.3 Design System - Global Styles
*Filozofia: "Content First" - UI ustępuje miejsca treści kursu. Styl: "Refined Utility".*

- [ ] `tailwind.config.ts` - rozszerzenie konfiguracji:
  - Font: **Inter** lub **Plus Jakarta Sans** (weights: 400, 500, 600)
  - Primary color: Deep Indigo/Teal/Slate (jeden kolor brandowy)
  - Neutrals: Slate/Zinc scale (bez czystej czerni - używać `#0f172a`)
  - Semantic colors: Success (green), Error (red), Warning (amber)
  - Border radius: `rounded-lg` (0.5rem) jako domyślny
- [ ] `app/assets/css/main.css` - globalne style:
  - Import fontu (Google Fonts lub local)
  - Bazowa typografia (generous whitespace, czytelność)
  - Utility classes dla subtle shadows i borders
- [ ] Konfiguracja Lucide icons w Nuxt

### 1.4 UI Component Library (Base)
*Zasada "10% Magic" - wyróżniające się elementy tylko w: przycisk "Kup", sidebar playera, logo/header.*

- [ ] `app/components/ui/Button.vue` - Primary (brand color), Secondary (outline/ghost), active state (scale 98%)
- [ ] `app/components/ui/Input.vue` - subtle border, clear focus state
- [ ] `app/components/ui/Card.vue` - white bg, `shadow-sm`, `hover:shadow-md` lift effect
- [ ] `app/components/ui/Badge.vue` - statusy: Draft, Published, Completed, Pending
- [ ] `app/components/ui/Skeleton.vue` - shimmer loader (zamiast spinnerów)
- [ ] `app/components/ui/Toast.vue` - notifications dla akcji ("Zapisano", "Błąd")
- [ ] `app/composables/useToast.ts` - zarządzanie toastami

### 1.5 Baza danych - Prisma Schema
- [x] Inicjalizacja Prisma: `npx prisma init`
- [x] Model `User` (id, email, password_hash, name, avatar_url, role: ADMIN/STUDENT, created_at)
- [ ] Model `Course` (id, title, slug, description, sales_description, thumbnail_url, price, currency, structure_mode: MODULAR/FLAT/FREESTYLE, status: DRAFT/PUBLISHED/ARCHIVED, enforce_sequential, require_assignment_pass, created_at)
- [ ] Model `Module` (id, course_id, title, order)
- [ ] Model `Lesson` (id, course_id, module_id?, title, content_html, video_url, video_iframe, order, created_at)
- [ ] Model `Enrollment` (id, user_id, course_id, created_at)
- [ ] Model `Progress` (id, user_id, lesson_id, completed, completed_at)
- [ ] Relacje między modelami
- [ ] Pierwsza migracja: `npx prisma migrate dev --name init`

### 1.6 Autentykacja - Backend
- [ ] `server/utils/prisma.ts` - singleton klienta Prisma
- [ ] `server/utils/jwt.ts` - funkcje signToken, verifyToken
- [ ] `server/utils/password.ts` - hashPassword, comparePassword (bcrypt)
- [ ] `server/api/auth/register.post.ts` - rejestracja (Zod walidacja, hash hasła, zapis do DB)
- [ ] `server/api/auth/login.post.ts` - logowanie (weryfikacja, generowanie JWT, HttpOnly cookie)
- [ ] `server/api/auth/logout.post.ts` - wylogowanie (czyszczenie cookie)
- [ ] `server/api/auth/me.get.ts` - pobranie aktualnego użytkownika z tokenu
- [ ] `server/middleware/auth.ts` - middleware weryfikujący JWT dla chronionych route'ów

### 1.7 Layouty i podstawowa struktura stron
- [ ] `app/layouts/default.vue` - bazowy layout
- [ ] `app/layouts/public.vue` - layout publiczny (header z logo/auth, footer)
- [ ] `app/layouts/admin.vue` - layout admina (sidebar z nawigacją)
- [ ] `app/layouts/app.vue` - layout studenta (uproszczony header)
- [ ] `app/pages/index.vue` - placeholder strony głównej
- [ ] `app/pages/login.vue` - strona logowania
- [ ] `app/pages/register.vue` - strona rejestracji
- [ ] `app/middleware/auth.global.ts` - Nuxt middleware chroniący /admin i /course

### 1.8 Composables bazowe
- [ ] `app/composables/useAuth.ts` - stan autentykacji, login(), logout(), user ref
- [ ] `app/composables/useApi.ts` - wrapper na $fetch z obsługą błędów

---

## FAZA 2: Panel Admina i CMS

### 2.1 Rozszerzenie schematu DB
- [ ] Model `Page` (id, title, slug, content_html, meta_description, published, created_at)
- [ ] Migracja: `npx prisma migrate dev --name add_pages`

### 2.2 API - Kursy (CRUD)
- [ ] `server/api/admin/courses/index.get.ts` - lista kursów
- [ ] `server/api/admin/courses/index.post.ts` - tworzenie kursu (Zod)
- [ ] `server/api/admin/courses/[id].get.ts` - szczegóły kursu
- [ ] `server/api/admin/courses/[id].put.ts` - aktualizacja kursu
- [ ] `server/api/admin/courses/[id].delete.ts` - usunięcie kursu

### 2.3 API - Moduły i Lekcje (CRUD)
- [ ] `server/api/admin/courses/[courseId]/modules/index.post.ts` - dodanie modułu
- [ ] `server/api/admin/courses/[courseId]/modules/[id].put.ts` - edycja modułu
- [ ] `server/api/admin/courses/[courseId]/modules/[id].delete.ts` - usunięcie modułu
- [ ] `server/api/admin/courses/[courseId]/lessons/index.post.ts` - dodanie lekcji
- [ ] `server/api/admin/courses/[courseId]/lessons/[id].get.ts` - szczegóły lekcji
- [ ] `server/api/admin/courses/[courseId]/lessons/[id].put.ts` - edycja lekcji
- [ ] `server/api/admin/courses/[courseId]/lessons/[id].delete.ts` - usunięcie lekcji
- [ ] `server/api/admin/courses/[courseId]/reorder.post.ts` - zmiana kolejności lekcji/modułów

### 2.4 API - Strony statyczne (CRUD)
- [ ] `server/api/admin/pages/index.get.ts` - lista stron
- [ ] `server/api/admin/pages/index.post.ts` - tworzenie strony
- [ ] `server/api/admin/pages/[id].get.ts` - szczegóły strony
- [ ] `server/api/admin/pages/[id].put.ts` - aktualizacja strony
- [ ] `server/api/admin/pages/[id].delete.ts` - usunięcie strony

### 2.5 Panel Admina - UI
*Vibe: Dense data, Control. Data tables, metrics cards.*

- [ ] `app/pages/admin/index.vue` - dashboard:
  - Metrics cards (Total Revenue, Students, Courses) z subtle shadows
  - Skeleton loaders podczas ładowania danych
- [ ] `app/pages/admin/courses/index.vue` - lista kursów z akcjami, status badges
- [ ] `app/pages/admin/courses/new.vue` - formularz tworzenia kursu
- [ ] `app/pages/admin/courses/[id]/index.vue` - edycja kursu (tabs: Ogólne, Sales, Curriculum)
- [ ] `app/pages/admin/courses/[id]/curriculum.vue` - zarządzanie modułami/lekcjami
- [ ] `app/pages/admin/courses/[id]/lessons/[lessonId].vue` - edytor lekcji
- [ ] `app/pages/admin/pages/index.vue` - lista stron statycznych
- [ ] `app/pages/admin/pages/new.vue` - tworzenie strony
- [ ] `app/pages/admin/pages/[id].vue` - edycja strony
- [ ] `app/pages/admin/users/index.vue` - data table użytkowników
- [ ] `app/components/admin/DataTable.vue` - reusable table component
- [ ] `app/components/admin/MetricCard.vue` - karta statystyki

### 2.6 Storage dla plików
- [ ] `server/utils/storage.ts` - adapter storage (interfejs dla lokalnego dev i zewnętrznego prod). **WAŻNE:** Ścisły interfejs (upload, delete, getPublicUrl), żadnych bezpośrednich operacji `fs` w kontrolerach.
- [ ] `server/api/upload/image.post.ts` - endpoint uploadu obrazów
- [ ] Konfiguracja: lokalny storage dla dev, przygotowanie pod R2/S3 dla prod

### 2.7 Komponenty edytora
- [ ] `app/components/admin/RichTextEditor.vue` - WYSIWYG (TipTap lub podobny)
- [ ] `app/components/admin/CourseForm.vue` - formularz kursu
- [ ] `app/components/admin/LessonForm.vue` - formularz lekcji
- [ ] `app/components/admin/CurriculumTree.vue` - drzewo modułów/lekcji z drag&drop
- [ ] `app/components/admin/ImageUploader.vue` - upload miniaturek (via storage adapter)

---

## FAZA 3: Doświadczenie Studenta

### 3.1 API - Kurs dla studenta
- [ ] `server/api/courses/[slug].get.ts` - szczegóły kursu (sprawdzenie enrollmentu)
- [ ] `server/api/courses/[slug]/curriculum.get.ts` - struktura kursu z postępem
- [ ] `server/api/courses/[slug]/lessons/[lessonId].get.ts` - treść lekcji (sprawdzenie dostępu)
- [ ] `server/api/courses/[slug]/lessons/[lessonId]/complete.post.ts` - oznacz jako ukończoną

### 3.2 Player kursu - UI
*Vibe: Focus, Distraction-free. Sidebar ciemniejsza/muted, main area paper-like.*

- [ ] `app/pages/course/[slug]/index.vue` - widok główny kursu (redirect do pierwszej lekcji)
- [ ] `app/pages/course/[slug]/[lessonId].vue` - widok lekcji (layout: sidebar + main)
- [ ] `app/components/course/CourseSidebar.vue` - darker/muted bg, current lesson highlighted, ikony statusu (Lucide)
- [ ] `app/components/course/LessonContent.vue` - white paper-like bg, `max-w-prose` dla czytelności
- [ ] `app/components/course/VideoEmbed.vue` - 16:9 aspect ratio, rounded corners, sanityzacja iframe
- [ ] `app/components/course/LessonNavigation.vue` - przyciski Poprzednia/Następna
- [ ] `app/components/course/ProgressBar.vue` - pasek postępu kursu

### 3.3 Composables studenta
- [ ] `app/composables/useCourseProgress.ts` - zarządzanie postępem, unlocking lekcji
- [ ] `app/composables/useCourse.ts` - pobieranie danych kursu

### 3.4 Konto użytkownika
- [ ] `app/pages/account/index.vue` - lista zakupionych kursów
- [ ] `app/pages/account/settings.vue` - edycja profilu (imię, avatar)

---

## FAZA 4: Oceny i Zadania

### 4.1 Rozszerzenie schematu DB
- [ ] Model `Quiz` (id, lesson_id, passing_score, max_retries)
- [ ] Model `Question` (id, quiz_id, question_text, options: JSON, correct_option, order)
- [ ] Model `QuizAttempt` (id, user_id, quiz_id, score, passed, created_at)
- [ ] Model `Homework` (id, lesson_id, prompt, allow_file, allow_text)
- [ ] Model `Submission` (id, user_id, homework_id, content_text, file_url, status: PENDING/PASSED/REJECTED, feedback, graded_at)
- [ ] Migracja: `npx prisma migrate dev --name add_assessments`

### 4.2 API - Quizy
- [ ] `server/api/admin/lessons/[lessonId]/quiz.post.ts` - tworzenie quizu
- [ ] `server/api/admin/lessons/[lessonId]/quiz.put.ts` - edycja quizu
- [ ] `server/api/admin/lessons/[lessonId]/quiz/questions.post.ts` - dodanie pytania
- [ ] `server/api/courses/[slug]/lessons/[lessonId]/quiz.get.ts` - pobranie quizu (bez odpowiedzi)
- [ ] `server/api/courses/[slug]/lessons/[lessonId]/quiz/submit.post.ts` - wysłanie odpowiedzi, obliczenie wyniku

### 4.3 API - Zadania domowe
- [ ] `server/api/admin/lessons/[lessonId]/homework.post.ts` - tworzenie zadania
- [ ] `server/api/admin/submissions/index.get.ts` - lista zgłoszeń do oceny
- [ ] `server/api/admin/submissions/[id].put.ts` - ocena zgłoszenia (PASSED/REJECTED + feedback)
- [ ] `server/api/courses/[slug]/lessons/[lessonId]/homework/submit.post.ts` - wysłanie zadania (tekst lub plik via storage adapter)

### 4.4 UI - Quizy i Zadania
- [ ] `app/components/course/QuizPlayer.vue` - interfejs rozwiązywania quizu
- [ ] `app/components/course/QuizResult.vue` - wynik quizu
- [ ] `app/components/course/HomeworkForm.vue` - formularz zadania (tekst/plik)
- [ ] `app/components/course/SubmissionStatus.vue` - status zgłoszenia z feedbackiem
- [ ] `app/pages/admin/submissions/index.vue` - lista zgłoszeń do oceny
- [ ] `app/pages/admin/submissions/[id].vue` - widok oceniania
- [ ] `app/components/admin/QuizEditor.vue` - edytor quizu z pytaniami
- [ ] `app/components/admin/HomeworkEditor.vue` - edytor zadania

---

## FAZA 5: Sklep i Strony Publiczne

### 5.1 Rozszerzenie schematu DB
- [ ] Model `Order` (id, user_id, course_id, amount, currency, stripe_session_id, invoice_data, status: PENDING/COMPLETED/FAILED, created_at)
- [ ] Migracja: `npx prisma migrate dev --name add_orders`

### 5.2 API - Stripe
- [ ] `server/utils/stripe.ts` - klient Stripe
- [ ] `server/api/checkout/create-session.post.ts` - tworzenie Stripe Checkout Session
- [ ] `server/api/webhooks/stripe.post.ts` - obsługa webhooków (checkout.session.completed)
  - Utworzenie użytkownika jeśli nie istnieje
  - Utworzenie Enrollment
  - Wysłanie emaila powitalnego

### 5.3 Strony publiczne - SSR
*Vibe: Marketing, High Trust.*

- [ ] `app/pages/index.vue` - katalog kursów (grid z Published courses, skeleton loading)
- [ ] `app/pages/c/[slug].vue` - strona sprzedażowa kursu (SSR):
  - Hero section: tytuł, duży thumbnail
  - Sticky "Kup" card po prawej (desktop) / na dole (mobile)
  - Wyświetlenie sales_description, cena
  - Logika: enrolled? -> "Przejdź do kursu" : "Kup teraz" (wyróżniony przycisk)
- [ ] `app/pages/[slug].vue` - renderer stron statycznych (SSR)
- [ ] `app/pages/checkout/[courseSlug].vue` - strona pre-checkout (dane do faktury)
- [ ] `app/pages/checkout/success.vue` - potwierdzenie zakupu
- [ ] `app/pages/checkout/cancel.vue` - anulowanie

### 5.4 Komponenty publiczne
- [ ] `app/components/public/CourseCard.vue` - karta kursu: thumbnail, title, price, `shadow-sm`, `hover:shadow-md`
- [ ] `app/components/public/Header.vue` - nagłówek z logo (branding element) i auth buttons
- [ ] `app/components/public/Footer.vue` - stopka z linkami do stron
- [ ] `app/components/public/InvoiceForm.vue` - checkbox + textarea na dane faktury
- [ ] `app/components/public/HeroSection.vue` - hero dla strony sprzedażowej

### 5.5 Admin - Zamówienia
- [ ] `server/api/admin/orders/index.get.ts` - lista zamówień
- [ ] `app/pages/admin/orders/index.vue` - widok zamówień

---

## FAZA 6: Społeczność

### 6.1 Rozszerzenie schematu DB
- [ ] Model `Post` (id, course_id, user_id, content, image_url, created_at)
- [ ] Model `Comment` (id, post_id, user_id, content, created_at)
- [ ] Model `Thread` (id, user_id, admin_id, created_at)
- [ ] Model `Message` (id, thread_id, sender_id, content, created_at)
- [ ] Migracja: `npx prisma migrate dev --name add_community`

### 6.2 API - Feed kursu
- [ ] `server/api/courses/[slug]/feed/index.get.ts` - lista postów
- [ ] `server/api/courses/[slug]/feed/index.post.ts` - dodanie posta
- [ ] `server/api/courses/[slug]/feed/[postId]/comments.get.ts` - komentarze
- [ ] `server/api/courses/[slug]/feed/[postId]/comments.post.ts` - dodanie komentarza
- [ ] `server/api/admin/feed/[postId].delete.ts` - usunięcie posta (admin)

### 6.3 API - Wiadomości prywatne
- [ ] `server/api/messages/threads/index.get.ts` - lista wątków użytkownika
- [ ] `server/api/messages/threads/index.post.ts` - utworzenie wątku (student -> admin)
- [ ] `server/api/messages/threads/[threadId].get.ts` - wiadomości w wątku
- [ ] `server/api/messages/threads/[threadId].post.ts` - wysłanie wiadomości

### 6.4 UI - Społeczność
- [ ] `app/components/course/CourseFeed.vue` - feed z postami
- [ ] `app/components/course/PostCard.vue` - pojedynczy post z komentarzami
- [ ] `app/components/course/PostForm.vue` - formularz dodawania posta
- [ ] `app/components/course/CommentForm.vue` - formularz komentarza
- [ ] `app/pages/messages/index.vue` - inbox (lista wątków)
- [ ] `app/pages/messages/[threadId].vue` - widok konwersacji
- [ ] `app/pages/admin/messages/index.vue` - inbox admina

---

## FAZA 7: Dopracowanie i Wdrożenie

### 7.1 Internacjonalizacja (i18n)
- [ ] Utworzenie `lang/pl.json` z wszystkimi stringami UI
- [ ] `app/composables/useI18n.ts` - prosty composable do tłumaczeń
- [ ] Przegląd i ekstrakcja hardcodowanych tekstów z komponentów

### 7.2 Bezpieczeństwo
- [ ] Audyt wszystkich endpointów - walidacja Zod
- [ ] Sanityzacja HTML (sales_description, content_html) - DOMPurify
- [ ] Sanityzacja iframe video
- [ ] Rate limiting na auth endpoints
- [ ] Walidacja rozszerzeń i rozmiaru plików (homework, thumbnails)
- [ ] CSRF protection

### 7.3 Email
- [ ] `server/utils/email.ts` - klient email (Resend/Nodemailer)
- [ ] Template: Welcome email (po zakupie)
- [ ] Template: Password reset
- [ ] Template: Homework graded notification

### 7.4 Deployment - Railway

#### Konfiguracja Railway
- [x] `railway.toml` - konfiguracja deploymentu:
  ```toml
  [build]
  builder = "dockerfile"
  dockerfilePath = "Dockerfile"

  [deploy]
  healthcheckPath = "/api/health"
  healthcheckTimeout = 30
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 3
  ```
- [x] Endpoint health check: `server/api/health.get.ts` (zwraca status)
- [ ] Railway PostgreSQL add-on - konfiguracja DATABASE_URL jako shared variable
- [ ] Konfiguracja zmiennych środowiskowych w Railway Dashboard:
  - `DATABASE_URL` (z PostgreSQL add-on)
  - `JWT_SECRET`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NUXT_PUBLIC_APP_URL` (dla linków w emailach)

#### Pliki uploadów (thumbnails, homework)
- [ ] Konfiguracja produkcyjnego storage (Cloudflare R2 lub S3)
- [ ] Zmienne środowiskowe: `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`
- [ ] Konfiguracja CORS dla storage bucket

#### CI/CD
- [ ] Railway auto-deploy z GitHub main branch
- [ ] Konfiguracja "Deploy Command" w Railway: `npx prisma migrate deploy` (uruchamiane przed startem aplikacji)

#### Dokumentacja
- [ ] README.md - instrukcja deploymentu na Railway
- [ ] README.md - instrukcja uruchomienia lokalnego z Docker Compose

### 7.5 Testy
- [ ] Testy jednostkowe: utils (jwt, password, validators)
- [ ] Testy API: auth, courses CRUD
- [ ] Testy E2E: podstawowy flow zakupu (opcjonalnie Playwright)

---

## Zależności między fazami

```
FAZA 1 (Fundament)
    ↓
FAZA 2 (Admin/CMS) ──────────────────┐
    ↓                                 │
FAZA 3 (Student)                      │
    ↓                                 │
FAZA 4 (Oceny) ←──────────────────────┤
    ↓                                 │
FAZA 5 (Sklep) ←──────────────────────┘
    ↓
FAZA 6 (Społeczność)
    ↓
FAZA 7 (Polish)
```

**Uwagi:**
- Fazy 1-3 muszą być wykonane sekwencyjnie
- Faza 4 wymaga Fazy 2 (edytor lekcji) i Fazy 3 (player)
- Faza 5 wymaga Fazy 2 (dane sprzedażowe kursu)
- Faza 6 może być rozpoczęta po Fazie 3
- Faza 7 jest finalizacją całości

**Railway - kluczowe kwestie:**
- Railway nie ma persistent storage - pliki uploadowane (thumbnails, homework) muszą być na zewnętrznym storage (R2/S3) lub w DB jako base64/URL
- PORT jest dynamicznie przydzielany przez Railway - aplikacja musi używać `process.env.PORT`
- PostgreSQL jako Railway add-on - DATABASE_URL automatycznie dostępny
- Health check wymagany dla stabilnego deploymentu
- Migracje Prisma uruchamiane podczas buildu (nie runtime)

**UI/UX - kluczowe zasady (docs/UI.md):**
- Filozofia "Content First" - UI ustępuje miejsca treści
- Styl "Refined Utility" - nie Bootstrap, nie Dribbble
- Zasada "10% Magic" - wyróżniające elementy tylko w: przycisk "Kup", sidebar playera, logo
- Skeleton loaders zamiast spinnerów
- Transitions: `transition-all duration-200` na interaktywnych elementach
- Toast notifications dla akcji użytkownika
- Ikony: Lucide (spójny zestaw)

---

## Szacowana struktura plików po implementacji

```
didact/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css    # Global styles, typography
│   ├── components/
│   │   ├── admin/          # ~10 komponentów (DataTable, MetricCard, edytory...)
│   │   ├── course/         # ~10 komponentów (Sidebar, LessonContent, VideoEmbed...)
│   │   ├── public/         # ~5 komponentów (CourseCard, Header, Footer, HeroSection...)
│   │   └── ui/             # ~7 komponentów (Button, Input, Card, Badge, Skeleton, Toast, Modal)
│   ├── composables/        # ~7 composables (useAuth, useApi, useToast, useCourse...)
│   ├── layouts/            # 4 layouty
│   ├── middleware/         # 1-2 middleware
│   └── pages/              # ~25 stron
├── server/
│   ├── api/                # ~40 endpointów
│   ├── middleware/         # 1 auth middleware
│   └── utils/              # ~6 utils (prisma, jwt, password, stripe, email, storage)
├── prisma/
│   └── schema.prisma
├── lang/
│   └── pl.json
├── public/
├── docs/
├── Dockerfile              # Multi-stage build dla produkcji
├── docker-compose.yml      # Lokalne środowisko dev
├── docker-compose.prod.yml # Lokalne testowanie produkcji
├── railway.toml            # Konfiguracja Railway
├── .dockerignore
└── .env.example
```

---

## Rozpoczęcie implementacji

Gdy zaakceptujesz plan, zacznę od **FAZY 1.1** (Inicjalizacja projektu).
