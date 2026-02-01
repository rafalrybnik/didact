<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  placeholder?: string
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
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-slate max-w-none focus:outline-none min-h-[200px] px-4 py-3',
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
      editor.value.commands.setContent(value, false)
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setLink() {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL:', previousUrl)

  if (url === null) {
    return
  }

  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

interface ToolbarButton {
  icon: any
  title: string
  action: () => void
  isActive?: () => boolean
}

const toolbarButtons = computed<ToolbarButton[]>(() => [
  {
    icon: Bold,
    title: 'Pogrubienie',
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive('bold') ?? false,
  },
  {
    icon: Italic,
    title: 'Kursywa',
    action: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive('italic') ?? false,
  },
  {
    icon: Heading1,
    title: 'Nagłówek 1',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 1 }) ?? false,
  },
  {
    icon: Heading2,
    title: 'Nagłówek 2',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 2 }) ?? false,
  },
  {
    icon: Heading3,
    title: 'Nagłówek 3',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 3 }) ?? false,
  },
  {
    icon: List,
    title: 'Lista punktowana',
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive('bulletList') ?? false,
  },
  {
    icon: ListOrdered,
    title: 'Lista numerowana',
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive('orderedList') ?? false,
  },
  {
    icon: Quote,
    title: 'Cytat',
    action: () => editor.value?.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive('blockquote') ?? false,
  },
  {
    icon: LinkIcon,
    title: 'Link',
    action: setLink,
    isActive: () => editor.value?.isActive('link') ?? false,
  },
])
</script>

<template>
  <div class="border border-slate-300 rounded-lg overflow-hidden bg-white">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1 px-2 py-1 border-b border-slate-200 bg-slate-50">
      <button
        v-for="button in toolbarButtons"
        :key="button.title"
        type="button"
        :title="button.title"
        class="p-1.5 rounded hover:bg-slate-200 transition-colors"
        :class="{ 'bg-slate-200 text-primary-600': button.isActive?.() }"
        @click="button.action"
      >
        <component :is="button.icon" class="w-4 h-4" />
      </button>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <button
        type="button"
        title="Cofnij"
        class="p-1.5 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
        :disabled="!editor?.can().undo()"
        @click="editor?.chain().focus().undo().run()"
      >
        <Undo class="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Ponów"
        class="p-1.5 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
        :disabled="!editor?.can().redo()"
        @click="editor?.chain().focus().redo().run()"
      >
        <Redo class="w-4 h-4" />
      </button>
    </div>

    <!-- Editor -->
    <EditorContent :editor="editor" />
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
</style>
