# TODO.md - Pozostałe zadania Didact LMS

## Status
Fazy 1-6 z oryginalnego planu zostały zaimplementowane. Poniżej lista brakujących funkcjonalności zidentyfikowanych podczas audytu dokumentacji (PRD, FRS, BACKLOG).

---

## UKOŃCZONE ✅

### Priorytet 1: Funkcjonalność i UX (Lokalne)

#### 1.1 Dane do faktury (REQ-051) ✅
- [x] Strona checkout z opcją "Chcę fakturę"
- [x] Wyświetlanie danych faktury w panelu admin

#### 1.2 Edytor WYSIWYG (RichTextEditor) ✅
- [x] Implementacja TipTap z rozszerzonymi funkcjami
- [x] Formatowanie: bold, italic, underline, strikethrough, highlight, code
- [x] Nagłówki H1-H3, wyrównanie tekstu
- [x] Listy punktowane/numerowane, cytaty
- [x] Tabele z operacjami dodawania/usuwania wierszy i kolumn
- [x] Upload obrazków (z MinIO/R2)
- [x] Osadzanie YouTube
- [x] Stylizacja Google Docs-like w edytorze lekcji

#### 1.3 Dynamiczne linki w stopce (REQ-062) ✅
- [x] API pobierania opublikowanych stron CMS
- [x] Dynamiczne wyświetlanie w stopce

#### 1.4 Materiały do pobrania (REQ-011) ✅
- [x] Upload załączników do lekcji
- [x] Wyświetlanie w playerze kursu

#### 1.5 Storage S3-compatible ✅
- [x] MinIO w docker-compose dla lokalnego developmentu
- [x] Adapter S3 z AWS SDK dla Cloudflare R2
- [x] Endpoint uploadu obrazków dla edytora

---

## UKOŃCZONE (NOWA SERIA) ✅

### FAZA A: Infrastruktura Email ✅

- [x] `server/utils/email.ts` - Klient email SMTP (Nodemailer)
- [x] `docker-compose.yml` - Mailhog dla lokalnych testów
- [x] `.env.example` - Zmienne SMTP
- [x] `server/utils/emailTemplates.ts` - Szablony HTML

### FAZA B: Reset hasła (REQ-002) ✅

- [x] `prisma/schema.prisma` - Model `PasswordResetToken`
- [x] Migracja
- [x] `server/api/auth/forgot-password.post.ts` - Generowanie tokenu + wysyłka email
- [x] `server/api/auth/reset-password.post.ts` - Walidacja tokenu + zmiana hasła
- [x] `app/pages/forgot-password.vue` - Formularz "Zapomniałem hasła"
- [x] `app/pages/reset-password.vue` - Formularz nowego hasła
- [x] `app/pages/login.vue` - Link do forgot-password

### FAZA C: Powiadomienia email ✅

- [x] `server/utils/emailTemplates.ts` - Template: Welcome (po zakupie)
- [x] `server/api/webhooks/stripe.post.ts` - Wysyłka welcome email po płatności
- [x] `server/utils/emailTemplates.ts` - Template: Homework graded
- [x] `server/api/admin/submissions/[id].put.ts` - Wysyłka email po ocenie
- [x] `server/utils/emailTemplates.ts` - Template: Access granted

### FAZA D: Drip Content ✅

- [x] `prisma/schema.prisma` - Pole `Lesson.dripDays` (Int?)
- [x] Migracja
- [x] `app/pages/admin/courses/[id]/lessons/[lessonId].vue` - Input "Dni od zapisania"
- [x] `server/api/admin/lessons/[id].put.ts` - Zapis dripDays
- [x] `server/api/courses/[slug]/lessons/[lessonId].get.ts` - Walidacja dostępu
- [x] `server/api/courses/[slug]/curriculum.get.ts` - Status "locked until" per lekcja
- [x] `app/components/course/CourseSidebar.vue` - UI: ikona zegara + data odblokowania

### FAZA E: Dashboard z analityką ✅

- [x] `npm install chart.js vue-chartjs` - Instalacja Chart.js
- [x] `server/api/admin/analytics/dashboard.get.ts` - Agregujący endpoint
- [x] `app/components/admin/SalesChart.client.vue` - Wykres sprzedaży
- [x] `app/components/admin/StatsCards.vue` - Karty ze statystykami
- [x] `app/components/admin/CourseStats.vue` - Popularne kursy i wskaźnik ukończenia
- [x] `app/pages/admin/index.vue` - Integracja komponentów

---

## WSZYSTKIE FAZY UKOŃCZONE! ✅

**Cel:** Rozbudowany dashboard z wykresami dla admina.

| Krok | Plik | Opis |
|------|------|------|
| 1 | `npm install chart.js vue-chartjs` | Instalacja Chart.js |
| 2 | `server/api/admin/analytics/dashboard.get.ts` | Agregujący endpoint: sprzedaż, kursy, użytkownicy |
| 3 | `app/components/admin/SalesChart.client.vue` | Wykres sprzedaży |
| 4 | `app/components/admin/StatsCards.vue` | Karty ze statystykami |
| 5 | `app/pages/admin/index.vue` | Integracja komponentów |

**Metryki (w jednym JSON):**
- Przychód dzienny/tygodniowy/miesięczny
- Liczba nowych zapisów
- Najpopularniejsze kursy
- Wskaźnik ukończenia kursów
- Aktywni użytkownicy (ostatnie 7 dni)

---

## STATUS IMPLEMENTACJI

```
FAZA A (Email) ✅
    ↓
FAZA B (Reset hasła) ✅
    ↓
FAZA C (Powiadomienia) ✅
    ↓
FAZA D (Drip Content) ✅
    ↓
FAZA E (Dashboard) ✅
```

**Wszystkie fazy ukończone!**

---

## ODŁOŻONE 🟡

Funkcje do rozważenia w przyszłości (bez szczegółowego planu):

| ID | Funkcja | Opis |
|----|---------|------|
| A1 | Certyfikaty | Generowanie PDF po ukończeniu kursu |
| C12 | Export GDPR | Eksport danych użytkownika, usunięcie konta |
| E20 | Program afiliacyjny | Linki polecające z prowizją |

Szczegóły w archiwum: `docs/archive/REJECTED.md`

---

## ARCHIWUM

Odrzucone funkcje zostały przeniesione do: [`docs/archive/REJECTED.md`](./docs/archive/REJECTED.md)

---

*Ostatnia aktualizacja: 2025-02-01*
