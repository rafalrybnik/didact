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

- [x] `tailwind.config.ts` - rozszerzenie konfiguracji:
  - Font: **Inter** lub **Plus Jakarta Sans** (weights: 400, 500, 600)
  - Primary color: Deep Indigo/Teal/Slate (jeden kolor brandowy)
  - Neutrals: Slate/Zinc scale (bez czystej czerni - używać `#0f172a`)
  - Semantic colors: Success (green), Error (red), Warning (amber)
  - Border radius: `rounded-lg` (0.5rem) jako domyślny
- [x] `app/assets/css/main.css` - globalne style:
  - Import fontu (Google Fonts lub local)
  - Bazowa typografia (generous whitespace, czytelność)
  - Utility classes dla subtle shadows i borders
- [x] Konfiguracja Lucide icons w Nuxt (via lucide-vue-next package)

### 1.4 UI Component Library (Base)
*Zasada "10% Magic" - wyróżniające się elementy tylko w: przycisk "Kup", sidebar playera, logo/header.*

- [x] `app/components/ui/Button.vue` - Primary (brand color), Secondary (outline/ghost), active state (scale 98%)
- [x] `app/components/ui/Input.vue` - subtle border, clear focus state
- [x] `app/components/ui/Card.vue` - white bg, `shadow-sm`, `hover:shadow-md` lift effect
- [x] `app/components/ui/Badge.vue` - statusy: Draft, Published, Completed, Pending
- [x] `app/components/ui/Skeleton.vue` - shimmer loader (zamiast spinnerów)
- [x] `app/components/ui/Toast.vue` - notifications dla akcji ("Zapisano", "Błąd")
- [x] `app/composables/useToast.ts` - zarządzanie toastami

### 1.5 Baza danych - Prisma Schema
- [x] Inicjalizacja Prisma: `npx prisma init`
- [x] Model `User` (id, email, password_hash, name, avatar_url, role: ADMIN/STUDENT, created_at)
- [x] Model `Course` (id, title, slug, description, sales_description, thumbnail_url, price, currency, structure_mode: MODULAR/FLAT/FREESTYLE, status: DRAFT/PUBLISHED/ARCHIVED, enforce_sequential, require_assignment_pass, created_at)
- [x] Model `Module` (id, course_id, title, order)
- [x] Model `Lesson` (id, course_id, module_id?, title, content_html, video_url, video_iframe, order, created_at)
- [x] Model `Enrollment` (id, user_id, course_id, created_at)
- [x] Model `Progress` (id, user_id, lesson_id, completed, completed_at)
- [x] Relacje między modelami
- [x] Pierwsza migracja: `npx prisma migrate dev --name init_core_models`

### 1.6 Autentykacja - Backend
- [x] `server/utils/prisma.ts` - singleton klienta Prisma
- [x] `server/utils/jwt.ts` - funkcje signToken, verifyToken
- [x] `server/utils/password.ts` - hashPassword, comparePassword (bcrypt)
- [x] `server/api/auth/register.post.ts` - rejestracja (Zod walidacja, hash hasła, zapis do DB)
- [x] `server/api/auth/login.post.ts` - logowanie (weryfikacja, generowanie JWT, HttpOnly cookie)
- [x] `server/api/auth/logout.post.ts` - wylogowanie (czyszczenie cookie)
- [x] `server/api/auth/me.get.ts` - pobranie aktualnego użytkownika z tokenu
- [x] `server/middleware/auth.ts` - middleware weryfikujący JWT dla chronionych route'ów

### 1.7 Layouty i podstawowa struktura stron
- [x] `app/layouts/default.vue` - bazowy layout
- [x] `app/layouts/public.vue` - layout publiczny (header z logo/auth, footer)
- [x] `app/layouts/admin.vue` - layout admina (sidebar z nawigacją)
- [x] `app/layouts/app.vue` - layout studenta (uproszczony header)
- [x] `app/pages/index.vue` - placeholder strony głównej
- [x] `app/pages/login.vue` - strona logowania
- [x] `app/pages/register.vue` - strona rejestracji
- [x] `app/middleware/auth.global.ts` - Nuxt middleware chroniący /admin i /course

### 1.8 Composables bazowe
- [x] `app/composables/useAuth.ts` - stan autentykacji, login(), logout(), user ref
- [x] `app/composables/useApi.ts` - wrapper na $fetch z obsługą błędów (not needed - using $fetch directly)

---

## FAZA 2: Panel Admina i CMS

### 2.1 Rozszerzenie schematu DB
- [x] Model `Page` (id, title, slug, content_html, meta_description, published, created_at)
- [x] Migracja: `npx prisma migrate dev --name add_pages`

### 2.2 API - Kursy (CRUD)
- [x] `server/api/admin/courses/index.get.ts` - lista kursów
- [x] `server/api/admin/courses/index.post.ts` - tworzenie kursu (Zod)
- [x] `server/api/admin/courses/[id].get.ts` - szczegóły kursu
- [x] `server/api/admin/courses/[id].put.ts` - aktualizacja kursu
- [x] `server/api/admin/courses/[id].delete.ts` - usunięcie kursu

### 2.3 API - Moduły i Lekcje (CRUD)
*Note: Restructured to flat API due to Nuxt routing issues with nested dynamic routes*
- [x] `server/api/admin/modules/index.post.ts` - dodanie modułu (courseId w body)
- [x] `server/api/admin/modules/[id].put.ts` - edycja modułu
- [x] `server/api/admin/modules/[id].delete.ts` - usunięcie modułu
- [x] `server/api/admin/lessons/index.post.ts` - dodanie lekcji (courseId w body)
- [x] `server/api/admin/lessons/[id].get.ts` - szczegóły lekcji
- [x] `server/api/admin/lessons/[id].put.ts` - edycja lekcji
- [x] `server/api/admin/lessons/[id].delete.ts` - usunięcie lekcji
- [x] `server/api/admin/courses/reorder.post.ts` - zmiana kolejności lekcji/modułów

### 2.4 API - Strony statyczne (CRUD)
- [x] `server/api/admin/pages/index.get.ts` - lista stron
- [x] `server/api/admin/pages/index.post.ts` - tworzenie strony
- [x] `server/api/admin/pages/[id].get.ts` - szczegóły strony
- [x] `server/api/admin/pages/[id].put.ts` - aktualizacja strony
- [x] `server/api/admin/pages/[id].delete.ts` - usunięcie strony

### 2.5 Panel Admina - UI
*Vibe: Dense data, Control. Data tables, metrics cards.*

- [x] `app/pages/admin/index.vue` - dashboard:
  - Metrics cards (Total Revenue, Students, Courses) z subtle shadows
  - Skeleton loaders podczas ładowania danych
- [x] `app/pages/admin/courses/index.vue` - lista kursów z akcjami, status badges
- [x] `app/pages/admin/courses/new.vue` - formularz tworzenia kursu
- [x] `app/pages/admin/courses/[id]/index.vue` - edycja kursu (tabs: Ogólne, Sales, Curriculum)
- [x] `app/pages/admin/courses/[id]/index.vue` - curriculum tab z zarządzaniem modułami/lekcjami (drag&drop) - zintegrowane w index
- [x] `app/pages/admin/courses/[id]/lessons/[lessonId].vue` - edytor lekcji z video embed (YouTube/Vimeo)
- [x] `app/pages/admin/pages/index.vue` - lista stron statycznych
- [x] `app/pages/admin/pages/new.vue` - tworzenie strony
- [x] `app/pages/admin/pages/[id].vue` - edycja strony
- [ ] `app/pages/admin/users/index.vue` - data table użytkowników
- [x] `app/components/admin/DataTable.vue` - reusable table component
- [x] `app/components/admin/MetricCard.vue` - karta statystyki

### 2.6 Storage dla plików
- [x] `server/utils/storage.ts` - adapter storage (interfejs dla lokalnego dev i zewnętrznego prod)
- [x] `server/api/upload/image.post.ts` - endpoint uploadu obrazów (multipart/form-data)
- [x] `server/api/file.get.ts` - endpoint serwowania uploadowanych plików
- [x] `app/components/admin/ImageUploader.vue` - komponent uploadu z drag&drop
- [x] Konfiguracja: lokalny storage dla dev, przygotowanie pod R2/S3 dla prod

### 2.7 Komponenty edytora
- [ ] `app/components/admin/RichTextEditor.vue` - WYSIWYG (TipTap lub podobny)
- [x] `app/components/admin/ModuleForm.vue` - formularz modułu (modal)
- [x] `app/components/admin/LessonForm.vue` - formularz lekcji (modal)
- [x] `app/components/admin/CurriculumTree.vue` - drzewo modułów/lekcji z drag&drop (sortable)
- [x] `app/components/admin/ImageUploader.vue` - upload miniaturek z drag&drop (via storage adapter)

---

## FAZA 3: Doświadczenie Studenta

### 3.1 API - Kurs dla studenta
- [x] `server/api/courses/[slug].get.ts` - szczegóły kursu (sprawdzenie enrollmentu)
- [x] `server/api/courses/[slug]/curriculum.get.ts` - struktura kursu z postępem
- [x] `server/api/courses/[slug]/lessons/[lessonId].get.ts` - treść lekcji (sprawdzenie dostępu)
- [x] `server/api/courses/[slug]/lessons/[lessonId]/complete.post.ts` - oznacz jako ukończoną

### 3.2 Player kursu - UI
*Vibe: Focus, Distraction-free. Sidebar ciemniejsza/muted, main area paper-like.*

- [x] `app/pages/course/[slug]/index.vue` - widok główny kursu (redirect do pierwszej lekcji)
- [x] `app/pages/course/[slug]/[lessonId].vue` - widok lekcji (layout: sidebar + main)
- [x] `app/components/course/CourseSidebar.vue` - darker/muted bg, current lesson highlighted, ikony statusu (Lucide)
- [x] `app/components/course/LessonContent.vue` - white paper-like bg, `max-w-prose` dla czytelności
- [x] `app/components/course/VideoEmbed.vue` - 16:9 aspect ratio, rounded corners, sanityzacja iframe
- [x] `app/components/course/LessonNavigation.vue` - przyciski Poprzednia/Następna
- [x] `app/components/course/ProgressBar.vue` - pasek postępu kursu

### 3.3 Composables studenta
- [x] `app/composables/useCourseProgress.ts` - zarządzanie postępem, unlocking lekcji (inline in pages)
- [x] `app/composables/useCourse.ts` - pobieranie danych kursu (inline in pages)

### 3.4 Konto użytkownika
- [x] `app/pages/account/index.vue` - lista zakupionych kursów
- [x] `app/pages/account/settings.vue` - edycja profilu (imię, avatar)
- [x] `server/api/account/profile.put.ts` - API aktualizacji profilu

---

## FAZA 4: Oceny i Zadania

### 4.1 Rozszerzenie schematu DB
- [x] Model `Quiz` (id, lesson_id, passing_score, max_retries)
- [x] Model `Question` (id, quiz_id, question_text, options: JSON, correct_option, order)
- [x] Model `QuizAttempt` (id, user_id, quiz_id, score, passed, created_at)
- [x] Model `Homework` (id, lesson_id, prompt, allow_file, allow_text)
- [x] Model `Submission` (id, user_id, homework_id, content_text, file_url, status: PENDING/PASSED/REJECTED, feedback, graded_at)
- [x] Migracja: `npx prisma migrate dev --name add_assessments`

### 4.2 API - Quizy
- [x] `server/api/admin/lessons/[lessonId]/quiz.post.ts` - tworzenie quizu
- [x] `server/api/admin/lessons/[lessonId]/quiz.put.ts` - edycja quizu
- [x] `server/api/admin/lessons/[lessonId]/quiz/questions.post.ts` - dodanie pytania
- [x] `server/api/courses/[slug]/lessons/[lessonId]/quiz.get.ts` - pobranie quizu (bez odpowiedzi)
- [x] `server/api/courses/[slug]/lessons/[lessonId]/quiz/submit.post.ts` - wysłanie odpowiedzi, obliczenie wyniku

### 4.3 API - Zadania domowe
- [x] `server/api/admin/lessons/[lessonId]/homework.post.ts` - tworzenie zadania
- [x] `server/api/admin/submissions/index.get.ts` - lista zgłoszeń do oceny
- [x] `server/api/admin/submissions/[id].put.ts` - ocena zgłoszenia (PASSED/REJECTED + feedback)
- [x] `server/api/courses/[slug]/lessons/[lessonId]/homework/submit.post.ts` - wysłanie zadania (tekst lub plik via storage adapter)

### 4.4 UI - Quizy i Zadania
- [x] `app/components/course/QuizPlayer.vue` - interfejs rozwiązywania quizu (includes QuizResult)
- [x] `app/components/course/HomeworkForm.vue` - formularz zadania (tekst/plik, includes SubmissionStatus)
- [x] `app/pages/admin/submissions/index.vue` - lista zgłoszeń do oceny
- [x] `app/pages/admin/submissions/[id].vue` - widok oceniania
- [x] `app/components/admin/QuizEditor.vue` - edytor quizu z pytaniami
- [x] `app/components/admin/HomeworkEditor.vue` - edytor zadania

---

## FAZA 5: Sklep i Strony Publiczne

### 5.1 Rozszerzenie schematu DB
- [x] Model `Order` (id, user_id, course_id, amount, currency, stripe_session_id, invoice_data, status: PENDING/COMPLETED/FAILED, created_at)
- [x] Migracja: `npx prisma migrate dev --name add_orders`

### 5.2 API - Stripe
- [x] `server/utils/stripe.ts` - klient Stripe
- [x] `server/api/checkout/create-session.post.ts` - tworzenie Stripe Checkout Session
- [x] `server/api/webhooks/stripe.post.ts` - obsługa webhooków (checkout.session.completed)
  - Utworzenie Enrollment po płatności
  - Obsługa free courses (bezpośrednie enrollment)

### 5.3 Strony publiczne - SSR
*Vibe: Marketing, High Trust.*

- [x] `app/pages/index.vue` - katalog kursów (grid z Published courses, skeleton loading)
- [x] `app/pages/c/[slug].vue` - strona sprzedażowa kursu (SSR):
  - Hero section: tytuł, duży thumbnail
  - Sticky "Kup" card po prawej (desktop) / na dole (mobile)
  - Wyświetlenie sales_description, cena
  - Logika: enrolled? -> "Przejdź do kursu" : "Kup teraz" (wyróżniony przycisk)
- [x] `app/pages/[slug].vue` - renderer stron statycznych (SSR)
- [x] `app/pages/checkout/success.vue` - potwierdzenie zakupu
- [x] `app/pages/checkout/cancel.vue` - anulowanie

### 5.4 Komponenty publiczne
- [x] Course catalog integrated in index.vue (CourseCard inline)
- [x] Header/Footer in public layout
- [x] Hero section in sales page

### 5.5 Admin - Zamówienia
- [x] `server/api/admin/orders/index.get.ts` - lista zamówień
- [x] `app/pages/admin/orders/index.vue` - widok zamówień

---

## FAZA 6: Społeczność

### 6.1 Rozszerzenie schematu DB
- [x] Model `Post` (id, course_id, user_id, content, image_url, created_at)
- [x] Model `Comment` (id, post_id, user_id, content, created_at)
- [x] Model `Thread` (id, user_id, admin_id, created_at)
- [x] Model `Message` (id, thread_id, sender_id, content, created_at)
- [x] Migracja: `npx prisma migrate dev --name add_community`

### 6.2 API - Feed kursu
- [x] `server/api/courses/[slug]/feed/index.get.ts` - lista postów
- [x] `server/api/courses/[slug]/feed/index.post.ts` - dodanie posta
- [x] `server/api/courses/[slug]/feed/[postId]/comments.get.ts` - komentarze
- [x] `server/api/courses/[slug]/feed/[postId]/comments.post.ts` - dodanie komentarza
- [x] `server/api/admin/feed/[postId].delete.ts` - usunięcie posta (admin)

### 6.3 API - Wiadomości prywatne
- [x] `server/api/messages/threads/index.get.ts` - lista wątków użytkownika
- [x] `server/api/messages/threads/index.post.ts` - utworzenie wątku (student -> admin)
- [x] `server/api/messages/threads/[threadId].get.ts` - wiadomości w wątku
- [x] `server/api/messages/threads/[threadId].post.ts` - wysłanie wiadomości

### 6.4 UI - Społeczność
- [x] `app/components/course/CourseFeed.vue` - feed z postami (includes PostCard, PostForm, CommentForm)
- [x] `app/pages/messages/index.vue` - inbox (lista wątków, works for both students and admin)
- [x] `app/pages/messages/[threadId].vue` - widok konwersacji

---

## FAZA 7: Dopracowanie i Wdrożenie

### 7.1 Internacjonalizacja (i18n)
- [x] Utworzenie `lang/pl.json` z wszystkimi stringami UI
- [x] `app/composables/useI18n.ts` - prosty composable do tłumaczeń
- [ ] Przegląd i ekstrakcja hardcodowanych tekstów z komponentów (future improvement)

### 7.2 Bezpieczeństwo
- [x] Audyt wszystkich endpointów - walidacja Zod
- [x] Sanityzacja HTML (sales_description, content_html) - DOMPurify
- [x] Sanityzacja iframe video
- [x] Rate limiting na auth endpoints
- [x] Walidacja rozszerzeń i rozmiaru plików (homework, thumbnails)
- [ ] CSRF protection (Nuxt built-in via nuxt-security module)

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
- [x] Railway PostgreSQL add-on - konfiguracja DATABASE_URL jako shared variable
- [x] Konfiguracja zmiennych środowiskowych w Railway Dashboard:
  - `DATABASE_URL` (z PostgreSQL add-on)
  - `JWT_SECRET`
  - `STRIPE_SECRET_KEY` (do dodania później)
  - `STRIPE_WEBHOOK_SECRET` (do dodania później)
  - `NUXT_PUBLIC_APP_URL` (do dodania później)

#### Pliki uploadów (thumbnails, homework)
- [ ] Konfiguracja produkcyjnego storage (Cloudflare R2 lub S3)
- [ ] Zmienne środowiskowe: `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`
- [ ] Konfiguracja CORS dla storage bucket

#### CI/CD
- [x] Railway auto-deploy z GitHub main branch
- [x] Konfiguracja "Deploy Command" w Railway: `npx prisma migrate deploy` (uruchamiane przed startem aplikacji)

#### Dokumentacja
- [x] README.md - instrukcja deploymentu na Railway
- [x] README.md - instrukcja uruchomienia lokalnego z Docker Compose

### 7.5 Testy
- [x] Testy jednostkowe: utils (jwt, password, validators, sanitize, rateLimit)
- [x] Testy API: auth, courses CRUD (basic tests in tests/auth.test.ts)
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
