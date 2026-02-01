# Odrzucone funkcje - Didact LMS

> **Data archiwizacji:** 2025-02-01
>
> Poniższe funkcje zostały odrzucone podczas planowania rozwoju aplikacji.
> Mogą zostać ponownie rozważone w przyszłości.

---

## A2. Notatki ucznia
**Opis:** Możliwość robienia notatek podczas oglądania lekcji.

**Zakres:**
- Panel notatek przy playerze lekcji
- Zapisywanie notatek per lekcja
- Eksport notatek do PDF/Markdown
- Wyszukiwarka notatek

**Powód odrzucenia:** Niska priorytetyzacja względem core features.

---

## A3. Zakładki i ulubione lekcje
**Opis:** Oznaczanie lekcji do późniejszego powrotu.

**Zakres:**
- Przycisk zakładki przy każdej lekcji
- Lista zakładek w profilu użytkownika
- Szybki dostęp z dashboardu

**Powód odrzucenia:** Niska priorytetyzacja względem core features.

---

## A4. Tryb ciemny (Dark Mode)
**Opis:** Opcja przełączania między jasnym a ciemnym motywem.

**Zakres:**
- Toggle w ustawieniach użytkownika
- Zapisywanie preferencji
- Automatyczne wykrywanie preferencji systemowych
- Stylizacja wszystkich komponentów

**Powód odrzucenia:** Wymaga znacznego nakładu pracy na stylizację wszystkich komponentów.

---

## A5. Powiadomienia push (Web Push)
**Opis:** Powiadomienia o nowych lekcjach, ocenionych zadaniach, odpowiedziach.

**Zakres:**
- Service Worker dla push notifications
- Ustawienia powiadomień per typ
- Endpoint do wysyłania powiadomień
- Integracja z systemem email (fallback)

**Powód odrzucenia:** Złożoność implementacji Service Workers. Email wystarczający na start.

---

## B7. Prerekvizity lekcji
**Opis:** Wymaganie ukończenia konkretnych lekcji przed dostępem do następnych.

**Zakres:**
- Relacja "wymaga lekcji X" w edytorze
- Walidacja dostępu do lekcji
- Wizualna mapa zależności (opcjonalne)

**Powód odrzucenia:** Istniejący tryb sekwencyjny (`enforceSequential`) pokrywa podstawowe potrzeby.

---

## B8. Wersjonowanie kursów
**Opis:** Możliwość aktualizacji kursu z zachowaniem dostępu do starej wersji.

**Zakres:**
- Kopiowanie kursu jako nowa wersja
- Migracja uczniów do nowej wersji (opcjonalna)
- Historia zmian

**Powód odrzucenia:** Wysoka złożoność, niska wartość dla single-tenant LMS.

---

## B9. Pakiety kursów (Bundles)
**Opis:** Sprzedaż wielu kursów w pakiecie ze zniżką.

**Zakres:**
- Model Bundle (kursy + cena)
- Strona sprzedażowa pakietu
- Checkout dla pakietu
- Panel admin do zarządzania

**Powód odrzucenia:** Odłożone - rozważyć gdy będzie więcej kursów.

---

## B10. Kod dostępu / kupony
**Opis:** Jednorazowe kody dające dostęp do kursu lub zniżkę.

**Zakres:**
- Model Coupon (kod, typ rabatu, limit użyć)
- Walidacja przy checkout
- Raporty użycia kuponów
- Kody 100% zniżki = darmowy dostęp

**Powód odrzucenia:** Stripe obsługuje kupony natywnie - można użyć Stripe Coupons.

---

## C13. Bulk operations
**Opis:** Masowe operacje na kursach, użytkownikach, zamówieniach.

**Zakres:**
- Zaznaczanie wielu rekordów
- Bulk delete, archive, publish
- Bulk email do uczniów kursu
- Import użytkowników z CSV

**Powód odrzucenia:** Niska priorytetyzacja dla single-tenant LMS.

---

## C14. Audit log
**Opis:** Historia działań administratorów.

**Zakres:**
- Logowanie wszystkich akcji admin
- Filtrowanie po typie, dacie, użytkowniku
- Przechowywanie przez X dni

**Powód odrzucenia:** Niska priorytetyzacja - jeden admin.

---

## C15. Role i uprawnienia
**Opis:** Rozbudowany system ról (super admin, content editor, support).

**Zakres:**
- Tabela ról i uprawnień
- Przypisywanie ról użytkownikom
- Middleware sprawdzający uprawnienia
- UI zarządzania rolami

**Powód odrzucenia:** Single-tenant LMS - jeden admin wystarczy na start.

---

## D16. Komentarze pod lekcjami
**Opis:** Dyskusja pod każdą lekcją.

**Zakres:**
- Model Comment (treść, autor, lekcja)
- Zagnieżdżone odpowiedzi
- Moderacja (usuwanie, edycja)
- Powiadomienia o odpowiedziach

**Powód odrzucenia:** Feed kursu pokrywa potrzeby komunikacji.

---

## D17. Forum kursu
**Opis:** Dedykowane forum dla uczestników kursu.

**Zakres:**
- Kategorie tematyczne
- Wątki i odpowiedzi
- Pinowanie ważnych wątków
- Wyszukiwarka

**Powód odrzucenia:** Feed kursu + wiadomości wystarczające na start.

---

## D18. Live Q&A / Webinary
**Opis:** Integracja z narzędziami do live streaming.

**Zakres:**
- Harmonogram webinarów
- Integracja z Zoom/YouTube Live
- Nagrania dostępne jako lekcje
- Powiadomienia o nadchodzących sesjach

**Powód odrzucenia:** Zewnętrzne narzędzia (Zoom, YouTube) wystarczające.

---

## E19. Subskrypcje (recurring payments)
**Opis:** Model subskrypcyjny zamiast jednorazowej płatności.

**Zakres:**
- Plany subskrypcyjne w Stripe
- Zarządzanie subskrypcją (anulowanie, zmiana planu)
- Dostęp do kursów na czas subskrypcji
- Dunning management (nieudane płatności)

**Powód odrzucenia:** Złożoność implementacji. Model jednorazowej płatności na start.

---

*Archiwum utworzone: 2025-02-01*
