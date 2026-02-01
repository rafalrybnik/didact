# Analiza Edytorów WYSIWYG dla Didact LMS

## Wymagania projektu

- **Framework**: Nuxt 3 / Vue 3 (Composition API)
- **Renderowanie**: SSR z hydracją (wymaga `<ClientOnly>`)
- **Zastosowania**: Opis sprzedażowy kursu, treść lekcji, strony CMS
- **Pożądane funkcje**: Formatowanie tekstu, nagłówki, listy, linki, cytaty, osadzanie mediów, możliwość rozszerzania

---

## Porównanie edytorów

### 1. TipTap (aktualnie używany)

**Strona**: https://tiptap.dev

**Opis**: Headless, framework-agnostyczny edytor zbudowany na ProseMirror. Oferuje pełną kontrolę nad UI i zachowaniem edytora.

**Zalety**:
- ✅ Licencja MIT (darmowy, open-source)
- ✅ Modularna architektura (tree-shakable)
- ✅ Natywna integracja z Vue 3 (`@tiptap/vue-3`)
- ✅ Mały rozmiar bundle (mniejszy niż CKEditor, TinyMCE)
- ✅ Łatwa rozszerzalność przez extensions
- ✅ Obsługa collaborative editing (Yjs)
- ✅ Aktywny rozwój i duża społeczność

**Wady**:
- ❌ Wymaga więcej początkowej konfiguracji
- ❌ Brak gotowego UI - trzeba budować toolbar samodzielnie
- ❌ Niektóre zaawansowane funkcje (comments, AI) płatne w TipTap Cloud

**Dostępne extensions**:
- StarterKit (podstawowe formatowanie)
- Table, Image, YouTube, Link
- Collaboration, Comments (płatne)
- Możliwość tworzenia własnych extensions

**Ocena dla Didact**: ⭐⭐⭐⭐ (4/5) - Dobry wybór, ale wymaga budowania UI

---

### 2. CKEditor 5

**Strona**: https://ckeditor.com/ckeditor-5/

**Opis**: Enterprise-grade edytor z bogatym zestawem funkcji out-of-the-box. Jeden z najpopularniejszych edytorów na rynku.

**Zalety**:
- ✅ Gotowy, profesjonalny UI
- ✅ Bogaty zestaw pluginów (100+)
- ✅ Real-time collaboration wbudowany
- ✅ Oficjalna integracja Vue 3 (`@ckeditor/ckeditor5-vue`)
- ✅ Wsparcie dla track changes, comments
- ✅ Export do PDF, Word
- ✅ Profesjonalne wsparcie techniczne

**Wady**:
- ❌ Licencja GPL (lub płatna komercyjna)
- ❌ Większy bundle size (~500KB+)
- ❌ Bardziej opiniotwórczy (mniej elastyczny)
- ❌ Płatne funkcje premium (collaboration, export)
- ❌ Wymaga konfiguracji dla SSR

**Ceny**:
- Open Source: GPL (wymaga open-source projektu)
- Commercial: od $75/miesiąc

**Ocena dla Didact**: ⭐⭐⭐⭐⭐ (5/5) - Najlepszy dla LMS, ale wymaga licencji

---

### 3. Quill (v2)

**Strona**: https://quilljs.com

**Opis**: Lekki, popularny edytor używany przez Slack, LinkedIn, Figma. Wersja 2.0 (2024) przepisana w TypeScript.

**Zalety**:
- ✅ Licencja BSD (darmowy)
- ✅ Mały rozmiar (~40KB gzipped)
- ✅ Prosty w użyciu
- ✅ Vue 3 wrapper: `vue-quill`, `vue-quilly`
- ✅ Stabilny, sprawdzony w produkcji
- ✅ Dobra dokumentacja

**Wady**:
- ❌ Mniej rozszerzalny niż TipTap/ProseMirror
- ❌ Ograniczone możliwości customizacji
- ❌ Brak natywnego collaborative editing
- ❌ Styl "blot" mniej elastyczny niż schema ProseMirror
- ❌ Problemy z SSR (wymaga careful handling)

**Ocena dla Didact**: ⭐⭐⭐ (3/5) - Dobry dla prostych przypadków

---

### 4. Lexical (Meta/Facebook)

**Strona**: https://lexical.dev

**Opis**: Framework do budowania edytorów od Meta (Facebook). Używany w produktach Meta.

**Zalety**:
- ✅ Licencja MIT
- ✅ Backing od Meta (duże zasoby)
- ✅ Wysoka wydajność
- ✅ Vue 3 wrapper: `lexical-vue`
- ✅ Accessibility-first design
- ✅ Małe bundle size

**Wady**:
- ❌ Brak wersji 1.0 (nadal w rozwoju)
- ❌ Mniejszy ekosystem niż TipTap
- ❌ Brak "pure decorations" (problem dla collaborative cursors)
- ❌ Stroma krzywa uczenia się
- ❌ Mniej przykładów i tutoriali

**Ocena dla Didact**: ⭐⭐⭐ (3/5) - Obiecujący, ale niedojrzały

---

### 5. BlockNote

**Strona**: https://blocknotejs.org

**Opis**: Block-based edytor (styl Notion) zbudowany na TipTap/ProseMirror. Łatwiejszy w użyciu niż raw TipTap.

**Zalety**:
- ✅ Licencja MPL-2.0
- ✅ Gotowy UI w stylu Notion
- ✅ Zbudowany na TipTap (stabilna baza)
- ✅ TypeScript support
- ✅ Collaborative editing (Yjs)
- ✅ Slash commands, drag & drop
- ✅ Markdown import/export

**Wady**:
- ❌ Głównie React-first (Vue wymaga wrappera)
- ❌ Mniej elastyczny niż raw TipTap
- ❌ Stosunkowo nowy projekt
- ❌ Block-based może nie pasować do wszystkich use cases

**Vue 3 integracja**: Możliwa przez vanilla JS API lub custom wrapper

**Ocena dla Didact**: ⭐⭐⭐⭐ (4/5) - Świetny dla Notion-like UX

---

### 6. TinyMCE

**Strona**: https://www.tiny.cloud

**Opis**: Jeden z najstarszych i najpopularniejszych edytorów WYSIWYG. Enterprise-grade z długą historią.

**Zalety**:
- ✅ Bardzo dojrzały i stabilny
- ✅ Ogromny ekosystem pluginów
- ✅ Oficjalna integracja Vue 3 (`@tinymce/tinymce-vue`)
- ✅ Profesjonalne wsparcie
- ✅ PowerPaste, spell check, accessibility
- ✅ Dobrze udokumentowany

**Wady**:
- ❌ Freemium model (wiele funkcji płatnych)
- ❌ Duży bundle size (~300KB+)
- ❌ Mniej nowoczesna architektura
- ❌ Cloud-based API key required
- ❌ Może wyglądać "przestarzale"

**Ceny**:
- Free: Podstawowe funkcje (z cloud API)
- Paid: od $75/miesiąc dla premium features

**Ocena dla Didact**: ⭐⭐⭐ (3/5) - Dojrzały, ale ciężki i kosztowny

---

### 7. Editor.js

**Strona**: https://editorjs.io

**Opis**: Block-style edytor z czystym JSON output. Używany przez wiele startupów.

**Zalety**:
- ✅ Licencja Apache 2.0
- ✅ Czysty JSON output (łatwy do przechowywania)
- ✅ Block-based architecture
- ✅ Lekki i szybki
- ✅ Łatwe tworzenie custom blocks
- ✅ Vue 3 wrapper: `vue-editor-js`

**Wady**:
- ❌ Wymaga renderera do wyświetlania (JSON → HTML)
- ❌ Mniej "WYSIWYG" - bardziej structured content
- ❌ Ograniczone inline formatting
- ❌ Brak natywnego collaborative editing

**Ocena dla Didact**: ⭐⭐⭐ (3/5) - Dobry dla structured content, mniej dla rich text

---

## Tabela porównawcza

| Cecha | TipTap | CKEditor 5 | Quill | Lexical | BlockNote | TinyMCE | Editor.js |
|-------|--------|------------|-------|---------|-----------|---------|-----------|
| **Licencja** | MIT | GPL/Paid | BSD | MIT | MPL-2.0 | Freemium | Apache 2.0 |
| **Vue 3** | ✅ Native | ✅ Official | ✅ Wrapper | ✅ Wrapper | ⚠️ Vanilla | ✅ Official | ✅ Wrapper |
| **SSR/Nuxt** | ✅ | ⚠️ Config | ⚠️ Config | ⚠️ Config | ⚠️ Config | ⚠️ Config | ✅ |
| **Bundle Size** | ~150KB | ~500KB | ~40KB | ~100KB | ~200KB | ~300KB | ~50KB |
| **Gotowy UI** | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Rozszerzalność** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Collaboration** | ✅ (Yjs) | ✅ Native | ❌ | ✅ (Yjs) | ✅ (Yjs) | ✅ (Paid) | ❌ |
| **Dojrzałość** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Koszt** | Free | $75+/mo | Free | Free | Free | $75+/mo | Free |

---

## Rekomendacja dla Didact LMS

### Opcja 1: Rozbudowany TipTap (Rekomendowane)

Zostajemy przy TipTap, ale rozbudowujemy o:
- Więcej extensions (Table, Image upload, YouTube embed)
- Lepszy toolbar z dropdownami
- Slash commands (styl Notion)
- Vuetify Pro TipTap lub Element TipTap jako baza

**Nakład pracy**: 4-6h
**Koszt**: $0

### Opcja 2: CKEditor 5

Migracja do CKEditor 5 dla pełnego, profesjonalnego rozwiązania.

**Kiedy wybrać**:
- Potrzebne zaawansowane funkcje (track changes, comments)
- Klienci oczekują enterprise-grade UX
- Budżet na licencję komercyjną

**Nakład pracy**: 8-12h (migracja)
**Koszt**: $75+/miesiąc lub GPL

### Opcja 3: BlockNote

Dla Notion-like experience z gotowym UI.

**Kiedy wybrać**:
- Chcemy block-based editing
- Preferujemy gotowy, nowoczesny UI
- Akceptujemy ograniczenia React-first

**Nakład pracy**: 6-10h
**Koszt**: $0

---

## Źródła

- [Liveblocks: Which rich text editor framework should you choose in 2025?](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)
- [Vue Script: 10 Best WYSIWYG Rich Text Editors For Vue.js](https://www.vuescript.com/best-wysiwyg-rich-text-editor/)
- [TinyMCE: Best rich text editors for Vue JS](https://www.tiny.cloud/blog/best-vue-rich-text-editors/)
- [OpenReplay: The Best Rich Text Editor Plugins for Vue](https://blog.openreplay.com/best-rich-text-editor-vue/)
- [npm-compare: Rich Text Editors Comparison](https://npm-compare.com/@tiptap/pm,ckeditor5,draft-js,quill,slate)
- [BlockNote Official](https://www.blocknotejs.org/)
- [Lexical Vue](https://lexical-vue.vercel.app/)
