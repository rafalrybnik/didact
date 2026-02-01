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

## DO ZROBIENIA 🟢

### FAZA A: Infrastruktura Email (wymagane dla pozostałych)

#### A.1 System email
**Cel:** Podstawowa infrastruktura do wysyłania maili.

| Krok | Plik | Opis |
|------|------|------|
| 1 | `server/utils/email.ts` | Klient email z Resend SDK |
| 2 | `.env.example` | Dodanie `RESEND_API_KEY` |
| 3 | `server/utils/emailTemplates.ts` | Bazowy szablon HTML |

**Zależności:** Konto Resend, domena do wysyłki

---

### FAZA B: Reset hasła (REQ-002)

**Cel:** Użytkownicy mogą resetować hasło przez email.

| Krok | Plik | Opis |
|------|------|------|
| 1 | `prisma/schema.prisma` | Model `PasswordResetToken` |
| 2 | Migracja | `npx prisma migrate dev` |
| 3 | `server/api/auth/forgot-password.post.ts` | Generowanie tokenu + wysyłka email |
| 4 | `server/api/auth/reset-password.post.ts` | Walidacja tokenu + zmiana hasła |
| 5 | `app/pages/forgot-password.vue` | Formularz "Zapomniałem hasła" |
| 6 | `app/pages/reset-password.vue` | Formularz nowego hasła |
| 7 | `app/pages/login.vue` | Link do forgot-password |

**Schemat bazy:**
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

**Zależności:** Faza A (email)

---

### FAZA C: Powiadomienia email

**Cel:** Automatyczne maile przy kluczowych wydarzeniach.

| Krok | Plik | Opis |
|------|------|------|
| 1 | `server/utils/emailTemplates.ts` | Template: Welcome (po zakupie) |
| 2 | `server/api/webhooks/stripe.post.ts` | Wysyłka welcome email po płatności |
| 3 | `server/utils/emailTemplates.ts` | Template: Homework graded |
| 4 | `server/api/admin/submissions/[id].put.ts` | Wysyłka email po ocenie |
| 5 | `server/utils/emailTemplates.ts` | Template: Access granted |

**Zależności:** Faza A (email)

---

### FAZA D: Drip Content

**Cel:** Automatyczne udostępnianie lekcji według harmonogramu.

| Krok | Plik | Opis |
|------|------|------|
| 1 | `prisma/schema.prisma` | Pole `Lesson.dripDays` (Int?) |
| 2 | Migracja | `npx prisma migrate dev` |
| 3 | `app/pages/admin/courses/[id]/lessons/[lessonId].vue` | Input "Dni od zapisania" |
| 4 | `server/api/admin/lessons/[lessonId].put.ts` | Zapis dripDays |
| 5 | `server/api/courses/[slug]/lessons/[lessonId].get.ts` | Walidacja dostępu (enrollment date + dripDays) |
| 6 | `server/api/courses/[slug]/curriculum.get.ts` | Status "locked until" per lekcja |
| 7 | `app/components/course/Sidebar.vue` | UI: ikona zamka + data odblokowania |

**Schemat:**
```prisma
model Lesson {
  // ... existing fields
  dripDays  Int?  // null = dostępna od razu
}
```

**Logika:** `lesson.dripDays ? enrollment.createdAt + dripDays <= now : true`

---

### FAZA E: Dashboard z analityką

**Cel:** Rozbudowany dashboard z wykresami dla admina.

| Krok | Plik | Opis |
|------|------|------|
| 1 | `npm install chart.js vue-chartjs` | Instalacja Chart.js |
| 2 | `server/api/admin/analytics/sales.get.ts` | Dane sprzedaży (ostatnie 30 dni) |
| 3 | `server/api/admin/analytics/courses.get.ts` | Statystyki kursów (enrollments, completion) |
| 4 | `server/api/admin/analytics/users.get.ts` | Aktywni użytkownicy |
| 5 | `app/components/admin/SalesChart.client.vue` | Wykres sprzedaży |
| 6 | `app/components/admin/StatsCards.vue` | Karty ze statystykami |
| 7 | `app/pages/admin/index.vue` | Integracja komponentów |

**Metryki:**
- Przychód dzienny/tygodniowy/miesięczny
- Liczba nowych zapisów
- Najpopularniejsze kursy
- Wskaźnik ukończenia kursów
- Aktywni użytkownicy (ostatnie 7 dni)

---

## KOLEJNOŚĆ IMPLEMENTACJI

```
FAZA A (Email)
    ↓
FAZA B (Reset hasła) ←── wymaga A
    ↓
FAZA C (Powiadomienia) ←── wymaga A
    ↓
FAZA D (Drip Content) ←── niezależna
    ↓
FAZA E (Dashboard) ←── niezależna
```

**Szacowany czas:**
| Faza | Czas |
|------|------|
| A | 1-2h |
| B | 2-3h |
| C | 2-3h |
| D | 3-4h |
| E | 4-5h |
| **Razem** | **12-17h** |

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
