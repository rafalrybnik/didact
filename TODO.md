# TODO.md - Pozostałe zadania Didact LMS

## Status
Fazy 1-6 z oryginalnego planu zostały zaimplementowane. Poniżej lista brakujących funkcjonalności zidentyfikowanych podczas audytu dokumentacji (PRD, FRS, BACKLOG).

---

## PRIORYTET 1: Krytyczne dla produkcji

### 1.1 Reset hasła (REQ-002)
**Opis:** Użytkownicy muszą móc zresetować hasło przez email.

- [ ] `server/api/auth/forgot-password.post.ts` - generowanie tokenu reset
- [ ] `server/api/auth/reset-password.post.ts` - walidacja tokenu i zmiana hasła
- [ ] `app/pages/forgot-password.vue` - formularz "Zapomniałem hasła"
- [ ] `app/pages/reset-password.vue` - formularz nowego hasła (z tokenem w URL)
- [ ] Model `PasswordResetToken` w schema.prisma (token, userId, expiresAt)
- [ ] Migracja DB

**Zależności:** Wymaga implementacji systemu email (1.2)

### 1.2 System email (REQ-001, Notifications)
**Opis:** Email jest wymagany do: reset hasła, powitanie po zakupie, powiadomienia o ocenie zadania.

- [ ] `server/utils/email.ts` - klient email (Resend lub Nodemailer)
- [ ] Konfiguracja zmiennych: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` lub `RESEND_API_KEY`
- [ ] Template: Welcome email (po zakupie - z linkiem do kursu)
- [ ] Template: Password reset (z linkiem do resetu)
- [ ] Template: Homework graded (powiadomienie o ocenie)
- [ ] Template: Access granted (gdy istniejący user kupuje kolejny kurs)

### 1.3 Produkcyjny storage (pliki)
**Opis:** Railway nie ma persistent storage. Thumbnails i pliki homework muszą być na zewnętrznym storage.

- [ ] Konfiguracja Cloudflare R2 lub AWS S3
- [ ] Aktualizacja `server/utils/storage.ts` - adapter dla R2/S3
- [ ] Zmienne środowiskowe: `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`
- [ ] Migracja istniejących plików (jeśli są)
- [ ] Konfiguracja CORS dla storage bucket

---

## PRIORYTET 2: Wymagania PRD/FRS (funkcjonalne)

### 2.1 Dane do faktury (REQ-051)
**Opis:** Przed przekierowaniem do Stripe, użytkownik może zaznaczyć "Chcę fakturę" i podać dane.

- [ ] `app/pages/checkout/[slug].vue` - strona pośrednia przed Stripe:
  - Checkbox "Chcę fakturę"
  - Textarea na dane do faktury (bez walidacji)
  - Przycisk "Przejdź do płatności"
- [ ] Aktualizacja `server/api/checkout/create-session.post.ts` - przyjmowanie `invoiceData`
- [ ] Wyświetlanie danych faktury w `/admin/orders` przy zamówieniu

### 2.2 Dynamiczne linki w stopce (REQ-062)
**Opis:** Stopka powinna zawierać linki do opublikowanych stron CMS (np. Regulamin, Polityka Prywatności).

- [ ] `server/api/public/pages.get.ts` - lista opublikowanych stron (slug, title)
- [ ] Aktualizacja `app/layouts/public.vue` - dynamiczne pobieranie i wyświetlanie linków
- [ ] Cache linków (composable lub useState)

### 2.3 Materiały do pobrania (REQ-011 - częściowe)
**Opis:** Admin może dodać pliki PDF/ZIP do lekcji jako materiały do pobrania.

- [ ] Rozszerzenie modelu `Lesson` - pole `attachments` (JSON array lub relacja)
- [ ] UI w edytorze lekcji - upload wielu plików
- [ ] Wyświetlanie listy załączników w playerze kursu
- [ ] Endpoint pobierania z weryfikacją dostępu

---

## PRIORYTET 3: Ulepszenia UX/DX

### 3.1 Edytor WYSIWYG (RichTextEditor)
**Opis:** Pełnoprawny edytor dla sales_description i content_html.

- [ ] `app/components/admin/RichTextEditor.vue` - TipTap lub podobny
- [ ] Obsługa: nagłówki, bold/italic, listy, linki, obrazki
- [ ] Integracja z edytorem kursu i stron

### 3.2 CSRF Protection
**Opis:** Dodatkowa warstwa bezpieczeństwa via nuxt-security.

- [ ] Weryfikacja konfiguracji `nuxt-security` w `nuxt.config.ts`
- [ ] Testy ochrony CSRF

---

## PRIORYTET 4: Nice-to-have

### 4.1 Testy E2E
**Opis:** Automatyczne testy podstawowego flow (opcjonalne).

- [ ] Konfiguracja Playwright
- [ ] Test: Rejestracja -> Zakup -> Dostęp do kursu
- [ ] Test: Admin tworzy kurs -> Publikuje -> Widoczny w katalogu

### 4.2 Pełna ekstrakcja i18n
**Opis:** Wszystkie hardcoded teksty do plików tłumaczeń.

- [ ] Audyt komponentów pod kątem hardcoded tekstów
- [ ] Ekstrakcja do `lang/pl.json`
- [ ] Użycie composable `useI18n` wszędzie

---

## Szacowany nakład pracy

| Priorytet | Zadanie | Szacunek |
|-----------|---------|----------|
| P1 | Reset hasła | 2-3h |
| P1 | System email | 3-4h |
| P1 | Produkcyjny storage | 2-3h |
| P2 | Dane do faktury | 1-2h |
| P2 | Dynamiczne linki stopki | 1h |
| P2 | Materiały do pobrania | 2-3h |
| P3 | RichTextEditor | 2-3h |
| P3 | CSRF | 0.5h |
| P4 | Testy E2E | 3-4h |
| P4 | i18n extraction | 2-3h |

**Łącznie P1-P3:** ~15-20h
**Łącznie wszystko:** ~22-28h

---

## Rekomendacja

Dla MVP produkcyjnego wymagane są zadania z **Priorytetu 1**:
1. Reset hasła (krytyczne dla użytkowników)
2. System email (wymagany przez reset hasła i notyfikacje)
3. Produkcyjny storage (bez tego pliki znikną po restarcie)

Priorytet 2 i 3 mogą być dodane iteracyjnie po launchu.
