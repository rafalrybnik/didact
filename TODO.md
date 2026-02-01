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

## DO ZROBIENIA

### PRIORYTET 2: Infrastruktura Produkcyjna (Email & Auth)

#### 2.1 Reset hasła (REQ-002)
- [ ] `server/api/auth/forgot-password.post.ts` - generowanie tokenu
- [ ] `server/api/auth/reset-password.post.ts` - zmiana hasła
- [ ] `app/pages/forgot-password.vue` - formularz
- [ ] `app/pages/reset-password.vue` - formularz z tokenem
- [ ] Model `PasswordResetToken` w Prisma
- [ ] Migracja DB

#### 2.2 System email (REQ-001, Notifications)
- [ ] `server/utils/email.ts` - klient (Resend lub Nodemailer)
- [ ] Template: Welcome email (po zakupie)
- [ ] Template: Password reset
- [ ] Template: Homework graded
- [ ] Template: Access granted

---

## PROPOZYCJE NOWYCH FUNKCJI (do akceptacji)

Poniżej 20 propozycji nowych funkcji podzielonych na kategorie. Po akceptacji zostaną dodane do backlogu z priorytetami.

### A. Doświadczenie ucznia (Student Experience)

#### A1. Certyfikaty ukończenia kursu
**Opis:** Automatyczne generowanie certyfikatów PDF po ukończeniu kursu.
**Zakres:**
- Konfigurowalny szablon certyfikatu w panelu admin
- Dane: imię ucznia, nazwa kursu, data ukończenia
- Generowanie PDF (np. puppeteer lub jsPDF)
- Pobieranie z profilu użytkownika
- Opcjonalny unikalny numer certyfikatu z weryfikacją

#### A2. Notatki ucznia
**Opis:** Możliwość robienia notatek podczas oglądania lekcji.
**Zakres:**
- Panel notatek przy playerze lekcji
- Zapisywanie notatek per lekcja
- Eksport notatek do PDF/Markdown
- Wyszukiwarka notatek

#### A3. Zakładki i ulubione lekcje
**Opis:** Oznaczanie lekcji do późniejszego powrotu.
**Zakres:**
- Przycisk zakładki przy każdej lekcji
- Lista zakładek w profilu użytkownika
- Szybki dostęp z dashboardu

#### A4. Tryb ciemny (Dark Mode)
**Opis:** Opcja przełączania między jasnym a ciemnym motywem.
**Zakres:**
- Toggle w ustawieniach użytkownika
- Zapisywanie preferencji
- Automatyczne wykrywanie preferencji systemowych
- Stylizacja wszystkich komponentów

#### A5. Powiadomienia push (Web Push)
**Opis:** Powiadomienia o nowych lekcjach, ocenionych zadaniach, odpowiedziach.
**Zakres:**
- Service Worker dla push notifications
- Ustawienia powiadomień per typ
- Endpoint do wysyłania powiadomień
- Integracja z systemem email (fallback)

### B. Funkcje kursu (Course Features)

#### B6. Drip Content (Scheduled Release)
**Opis:** Automatyczne udostępnianie lekcji według harmonogramu.
**Zakres:**
- Konfiguracja "dni od zapisania" per lekcja
- Harmonogram oparty na dacie
- UI pokazujące kiedy lekcja będzie dostępna
- Powiadomienia o nowych lekcjach

#### B7. Prerekvizity lekcji
**Opis:** Wymaganie ukończenia konkretnych lekcji przed dostępem do następnych.
**Zakres:**
- Relacja "wymaga lekcji X" w edytorze
- Walidacja dostępu do lekcji
- Wizualna mapa zależności (opcjonalne)

#### B8. Wersjonowanie kursów
**Opis:** Możliwość aktualizacji kursu z zachowaniem dostępu do starej wersji.
**Zakres:**
- Kopiowanie kursu jako nowa wersja
- Migracja uczniów do nowej wersji (opcjonalna)
- Historia zmian

#### B9. Pakiety kursów (Bundles)
**Opis:** Sprzedaż wielu kursów w pakiecie ze zniżką.
**Zakres:**
- Model Bundle (kursy + cena)
- Strona sprzedażowa pakietu
- Checkout dla pakietu
- Panel admin do zarządzania

#### B10. Kod dostępu / kupony
**Opis:** Jednorazowe kody dające dostęp do kursu lub zniżkę.
**Zakres:**
- Model Coupon (kod, typ rabatu, limit użyć)
- Walidacja przy checkout
- Raporty użycia kuponów
- Kody 100% zniżki = darmowy dostęp

### C. Panel administracyjny (Admin Features)

#### C11. Dashboard z analityką
**Opis:** Rozbudowany dashboard z wykresami i statystykami.
**Zakres:**
- Wykres sprzedaży (dzienny/tygodniowy/miesięczny)
- Najpopularniejsze kursy
- Wskaźnik ukończenia kursów
- Aktywni użytkownicy
- Integracja z Chart.js lub similar

#### C12. Export danych (GDPR)
**Opis:** Eksport danych użytkownika zgodnie z GDPR.
**Zakres:**
- Endpoint eksportu danych użytkownika
- Format JSON/CSV
- Żądanie eksportu z profilu
- Usunięcie konta (prawo do bycia zapomnianym)

#### C13. Bulk operations
**Opis:** Masowe operacje na kursach, użytkownikach, zamówieniach.
**Zakres:**
- Zaznaczanie wielu rekordów
- Bulk delete, archive, publish
- Bulk email do uczniów kursu
- Import użytkowników z CSV

#### C14. Audit log
**Opis:** Historia działań administratorów.
**Zakres:**
- Logowanie wszystkich akcji admin
- Filtrowanie po typie, dacie, użytkowniku
- Przechowywanie przez X dni

#### C15. Role i uprawnienia
**Opis:** Rozbudowany system ról (super admin, content editor, support).
**Zakres:**
- Tabela ról i uprawnień
- Przypisywanie ról użytkownikom
- Middleware sprawdzający uprawnienia
- UI zarządzania rolami

### D. Komunikacja i społeczność

#### D16. Komentarze pod lekcjami
**Opis:** Dyskusja pod każdą lekcją.
**Zakres:**
- Model Comment (treść, autor, lekcja)
- Zagnieżdżone odpowiedzi
- Moderacja (usuwanie, edycja)
- Powiadomienia o odpowiedziach

#### D17. Forum kursu
**Opis:** Dedykowane forum dla uczestników kursu.
**Zakres:**
- Kategorie tematyczne
- Wątki i odpowiedzi
- Pinowanie ważnych wątków
- Wyszukiwarka

#### D18. Live Q&A / Webinary
**Opis:** Integracja z narzędziami do live streaming.
**Zakres:**
- Harmonogram webinarów
- Integracja z Zoom/YouTube Live
- Nagrania dostępne jako lekcje
- Powiadomienia o nadchodzących sesjach

### E. Monetyzacja i marketing

#### E19. Subskrypcje (recurring payments)
**Opis:** Model subskrypcyjny zamiast jednorazowej płatności.
**Zakres:**
- Plany subskrypcyjne w Stripe
- Zarządzanie subskrypcją (anulowanie, zmiana planu)
- Dostęp do kursów na czas subskrypcji
- Dunning management (nieudane płatności)

#### E20. Program afiliacyjny
**Opis:** System poleceń z prowizją.
**Zakres:**
- Unikalne linki afiliacyjne
- Śledzenie konwersji
- Wypłaty prowizji
- Panel afilianta

---

## Priorytetyzacja (propozycja)

| ID | Funkcja | Priorytet | Złożoność | Wartość |
|----|---------|-----------|-----------|---------|
| A1 | Certyfikaty | Wysoki | Średnia | Wysoka |
| A4 | Dark Mode | Średni | Niska | Średnia |
| B10 | Kupony/kody | Wysoki | Średnia | Wysoka |
| C11 | Dashboard analityka | Wysoki | Średnia | Wysoka |
| C12 | Export GDPR | Wysoki | Niska | Wysoka |
| D16 | Komentarze | Średni | Średnia | Średnia |
| B6 | Drip Content | Średni | Średnia | Średnia |
| A2 | Notatki | Niski | Średnia | Średnia |
| E19 | Subskrypcje | Średni | Wysoka | Wysoka |
| B9 | Pakiety | Niski | Średnia | Średnia |

---

## Następne kroki

1. **Akceptacja propozycji** - wybór funkcji do implementacji
2. **Priorytet 2** - dokończenie resetu hasła i systemu email
3. **Wybrane funkcje** - implementacja według zaakceptowanej listy

---

*Ostatnia aktualizacja: 2025-02-01*
