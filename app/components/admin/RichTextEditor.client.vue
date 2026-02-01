<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus,
  Plus,
  Trash2,
  Rows2,
  Columns2,
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  minHeight?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary-600 underline hover:text-primary-700',
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Zacznij pisać...',
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight.configure({
      multicolor: false,
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg',
      },
    }),
    Youtube.configure({
      width: 640,
      height: 360,
      HTMLAttributes: {
        class: 'w-full aspect-video rounded-lg',
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse border border-slate-300',
      },
    }),
    TableRow,
    TableHeader.configure({
      HTMLAttributes: {
        class: 'border border-slate-300 bg-slate-100 p-2 font-semibold',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-slate-300 p-2',
      },
    }),
  ],
  editorProps: {
    attributes: {
      class: `prose prose-slate max-w-none focus:outline-none px-4 py-3 ${props.minHeight || 'min-h-[200px]'}`,
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Watch for external changes
watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value?.getHTML() === value
    if (!isSame && editor.value) {
      editor.value.commands.setContent(value, { emitUpdate: false })
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Dialog states
const showLinkDialog = ref(false)
const showImageDialog = ref(false)
const showYoutubeDialog = ref(false)
const showTableMenu = ref(false)

const linkUrl = ref('')
const imageUrl = ref('')
const youtubeUrl = ref('')

function openLinkDialog() {
  linkUrl.value = editor.value?.getAttributes('link').href || ''
  showLinkDialog.value = true
}

function setLink() {
  if (linkUrl.value === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  }
  showLinkDialog.value = false
  linkUrl.value = ''
}

function openImageDialog() {
  imageUrl.value = ''
  showImageDialog.value = true
}

function insertImage() {
  if (imageUrl.value) {
    editor.value?.chain().focus().setImage({ src: imageUrl.value }).run()
  }
  showImageDialog.value = false
  imageUrl.value = ''
}

function openYoutubeDialog() {
  youtubeUrl.value = ''
  showYoutubeDialog.value = true
}

function insertYoutube() {
  if (youtubeUrl.value) {
    editor.value?.chain().focus().setYoutubeVideo({ src: youtubeUrl.value }).run()
  }
  showYoutubeDialog.value = false
  youtubeUrl.value = ''
}

function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  showTableMenu.value = false
}

function addColumnBefore() {
  editor.value?.chain().focus().addColumnBefore().run()
}

function addColumnAfter() {
  editor.value?.chain().focus().addColumnAfter().run()
}

function deleteColumn() {
  editor.value?.chain().focus().deleteColumn().run()
}

function addRowBefore() {
  editor.value?.chain().focus().addRowBefore().run()
}

function addRowAfter() {
  editor.value?.chain().focus().addRowAfter().run()
}

function deleteRow() {
  editor.value?.chain().focus().deleteRow().run()
}

function deleteTable() {
  editor.value?.chain().focus().deleteTable().run()
}

const isInTable = computed(() => editor.value?.isActive('table') ?? false)

// Close menus on click outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.table-menu-container')) {
    showTableMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="border border-slate-300 rounded-lg overflow-hidden bg-white">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
      <!-- Text formatting group -->
      <div class="flex items-center">
        <button
          type="button"
          title="Pogrubienie (Ctrl+B)"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('bold') }"
          @click="editor?.chain().focus().toggleBold().run()"
        >
          <Bold class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Kursywa (Ctrl+I)"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('italic') }"
          @click="editor?.chain().focus().toggleItalic().run()"
        >
          <Italic class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Podkreślenie (Ctrl+U)"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('underline') }"
          @click="editor?.chain().focus().toggleUnderline().run()"
        >
          <UnderlineIcon class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Przekreślenie"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('strike') }"
          @click="editor?.chain().focus().toggleStrike().run()"
        >
          <Strikethrough class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Zaznaczenie"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('highlight') }"
          @click="editor?.chain().focus().toggleHighlight().run()"
        >
          <Highlighter class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Kod"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('code') }"
          @click="editor?.chain().focus().toggleCode().run()"
        >
          <Code class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <!-- Headings group -->
      <div class="flex items-center">
        <button
          type="button"
          title="Nagłówek 1"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('heading', { level: 1 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <Heading1 class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Nagłówek 2"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('heading', { level: 2 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <Heading2 class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Nagłówek 3"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('heading', { level: 3 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <Heading3 class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <!-- Alignment group -->
      <div class="flex items-center">
        <button
          type="button"
          title="Wyrównaj do lewej"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive({ textAlign: 'left' }) }"
          @click="editor?.chain().focus().setTextAlign('left').run()"
        >
          <AlignLeft class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Wyśrodkuj"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive({ textAlign: 'center' }) }"
          @click="editor?.chain().focus().setTextAlign('center').run()"
        >
          <AlignCenter class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Wyrównaj do prawej"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive({ textAlign: 'right' }) }"
          @click="editor?.chain().focus().setTextAlign('right').run()"
        >
          <AlignRight class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <!-- Lists group -->
      <div class="flex items-center">
        <button
          type="button"
          title="Lista punktowana"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('bulletList') }"
          @click="editor?.chain().focus().toggleBulletList().run()"
        >
          <List class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Lista numerowana"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('orderedList') }"
          @click="editor?.chain().focus().toggleOrderedList().run()"
        >
          <ListOrdered class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Cytat"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('blockquote') }"
          @click="editor?.chain().focus().toggleBlockquote().run()"
        >
          <Quote class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <!-- Insert group -->
      <div class="flex items-center">
        <button
          type="button"
          title="Link"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          :class="{ 'bg-slate-200 text-primary-600': editor?.isActive('link') }"
          @click="openLinkDialog"
        >
          <LinkIcon class="w-4 h-4" />
        </button>
        <button
          v-if="editor?.isActive('link')"
          type="button"
          title="Usuń link"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors text-red-600"
          @click="editor?.chain().focus().unsetLink().run()"
        >
          <Unlink class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Obraz (URL)"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          @click="openImageDialog"
        >
          <ImageIcon class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="YouTube"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors"
          @click="openYoutubeDialog"
        >
          <YoutubeIcon class="w-4 h-4" />
        </button>

        <!-- Table dropdown -->
        <div class="relative table-menu-container">
          <button
            type="button"
            title="Tabela"
            class="p-1.5 rounded hover:bg-slate-200 transition-colors"
            :class="{ 'bg-slate-200 text-primary-600': isInTable }"
            @click.stop="showTableMenu = !showTableMenu"
          >
            <TableIcon class="w-4 h-4" />
          </button>

          <!-- Table menu -->
          <div
            v-if="showTableMenu"
            class="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 min-w-[180px]"
          >
            <button
              v-if="!isInTable"
              type="button"
              class="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
              @click="insertTable"
            >
              <Plus class="w-4 h-4" />
              Wstaw tabelę 3x3
            </button>

            <template v-if="isInTable">
              <div class="px-3 py-1 text-xs text-slate-500 font-medium">Kolumny</div>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                @click="addColumnBefore"
              >
                <Columns2 class="w-4 h-4" />
                Dodaj przed
              </button>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                @click="addColumnAfter"
              >
                <Columns2 class="w-4 h-4" />
                Dodaj po
              </button>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2 text-red-600"
                @click="deleteColumn"
              >
                <Minus class="w-4 h-4" />
                Usuń kolumnę
              </button>

              <div class="border-t border-slate-200 my-1" />

              <div class="px-3 py-1 text-xs text-slate-500 font-medium">Wiersze</div>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                @click="addRowBefore"
              >
                <Rows2 class="w-4 h-4" />
                Dodaj przed
              </button>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                @click="addRowAfter"
              >
                <Rows2 class="w-4 h-4" />
                Dodaj po
              </button>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2 text-red-600"
                @click="deleteRow"
              >
                <Minus class="w-4 h-4" />
                Usuń wiersz
              </button>

              <div class="border-t border-slate-200 my-1" />

              <button
                type="button"
                class="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2 text-red-600"
                @click="deleteTable"
              >
                <Trash2 class="w-4 h-4" />
                Usuń tabelę
              </button>
            </template>
          </div>
        </div>
      </div>

      <div class="flex-1" />

      <!-- Undo/Redo -->
      <div class="flex items-center">
        <button
          type="button"
          title="Cofnij (Ctrl+Z)"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
          :disabled="!editor?.can().undo()"
          @click="editor?.chain().focus().undo().run()"
        >
          <Undo class="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Ponów (Ctrl+Y)"
          class="p-1.5 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
          :disabled="!editor?.can().redo()"
          @click="editor?.chain().focus().redo().run()"
        >
          <Redo class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Editor -->
    <EditorContent :editor="editor" />

    <!-- Link Dialog -->
    <Teleport to="body">
      <div
        v-if="showLinkDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showLinkDialog = false"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">Wstaw link</h3>
          <input
            v-model="linkUrl"
            type="url"
            placeholder="https://example.com"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            @keyup.enter="setLink"
          >
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 text-slate-600 hover:text-slate-900"
              @click="showLinkDialog = false"
            >
              Anuluj
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              @click="setLink"
            >
              Zapisz
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Dialog -->
    <Teleport to="body">
      <div
        v-if="showImageDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showImageDialog = false"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">Wstaw obraz</h3>
          <input
            v-model="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            @keyup.enter="insertImage"
          >
          <p class="text-sm text-slate-500 mb-4">
            Podaj URL obrazu. Obsługiwane formaty: JPG, PNG, GIF, WebP.
          </p>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 text-slate-600 hover:text-slate-900"
              @click="showImageDialog = false"
            >
              Anuluj
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              @click="insertImage"
            >
              Wstaw
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- YouTube Dialog -->
    <Teleport to="body">
      <div
        v-if="showYoutubeDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showYoutubeDialog = false"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">Wstaw wideo YouTube</h3>
          <input
            v-model="youtubeUrl"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            @keyup.enter="insertYoutube"
          >
          <p class="text-sm text-slate-500 mb-4">
            Wklej link do wideo YouTube. Obsługiwane formaty: youtube.com/watch?v= oraz youtu.be/
          </p>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 text-slate-600 hover:text-slate-900"
              @click="showYoutubeDialog = false"
            >
              Anuluj
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              @click="insertYoutube"
            >
              Wstaw
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
/* Placeholder styling */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #94a3b8;
  pointer-events: none;
  height: 0;
}

/* Focus ring on the editor container */
.tiptap:focus {
  outline: none;
}

/* Table styling */
.tiptap table {
  border-collapse: collapse;
  margin: 1rem 0;
  overflow: hidden;
  width: 100%;
}

.tiptap table td,
.tiptap table th {
  border: 1px solid #cbd5e1;
  box-sizing: border-box;
  min-width: 1em;
  padding: 0.5rem;
  position: relative;
  vertical-align: top;
}

.tiptap table th {
  background-color: #f1f5f9;
  font-weight: 600;
}

.tiptap table .selectedCell:after {
  background: rgba(59, 130, 246, 0.1);
  content: "";
  left: 0; right: 0; top: 0; bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

.tiptap table .column-resize-handle {
  background-color: #3b82f6;
  bottom: -2px;
  pointer-events: none;
  position: absolute;
  right: -2px;
  top: 0;
  width: 4px;
}

/* Image styling */
.tiptap img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.tiptap img.ProseMirror-selectednode {
  outline: 3px solid #3b82f6;
}

/* YouTube embed styling */
.tiptap div[data-youtube-video] {
  margin: 1rem 0;
}

.tiptap div[data-youtube-video] iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
}

/* Highlight styling */
.tiptap mark {
  background-color: #fef08a;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

/* Code styling */
.tiptap code {
  background-color: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
}

/* Blockquote styling */
.tiptap blockquote {
  border-left: 4px solid #e2e8f0;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #64748b;
  font-style: italic;
}
</style>
