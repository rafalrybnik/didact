<script setup lang="ts">
import { Paperclip, Upload, Trash2, File, FileText } from 'lucide-vue-next'

const props = defineProps<{
  lessonId: string
}>()

const { error: showError, success: showSuccess } = useToast()

interface Attachment {
  name: string
  url: string
  size: number
  type: string
}

// Fetch attachments
const { data, refresh } = await useFetch<{ lesson: { attachments: Attachment[] | null } }>(
  `/api/admin/lessons/${props.lessonId}`
)
const attachments = computed(() => data.value?.lesson?.attachments || [])

const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.includes('pdf')) return FileText
  return File
}

function triggerFileSelect() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (!files || files.length === 0) return

  isUploading.value = true

  try {
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i])
    }

    await $fetch(`/api/admin/lessons/${props.lessonId}/attachments`, {
      method: 'POST',
      body: formData,
    })

    showSuccess('Przesłano', 'Pliki zostały dodane')
    refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się przesłać plików')
  } finally {
    isUploading.value = false
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

async function handleDelete(index: number) {
  if (!confirm('Czy na pewno chcesz usunąć ten załącznik?')) return

  try {
    await $fetch(`/api/admin/lessons/${props.lessonId}/attachments/${index}`, {
      method: 'DELETE',
    })

    showSuccess('Usunięto', 'Załącznik został usunięty')
    refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się usunąć załącznika')
  }
}
</script>

<template>
  <UiCard>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium text-slate-900 flex items-center gap-2">
        <Paperclip class="h-5 w-5" />
        Materiały do pobrania
      </h2>
    </div>

    <!-- Upload area -->
    <div class="mb-4">
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".pdf,.zip,.doc,.docx,.xls,.xlsx,.txt"
        class="hidden"
        @change="handleFileSelect"
      />
      <button
        type="button"
        class="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors"
        :class="{ 'opacity-50 cursor-wait': isUploading }"
        :disabled="isUploading"
        @click="triggerFileSelect"
      >
        <Upload class="h-6 w-6 mx-auto text-slate-400 mb-2" />
        <p class="text-sm text-slate-600">
          {{ isUploading ? 'Przesyłanie...' : 'Kliknij, aby dodać pliki' }}
        </p>
        <p class="text-xs text-slate-400 mt-1">
          PDF, ZIP, Word, Excel, TXT (max 20MB)
        </p>
      </button>
    </div>

    <!-- Attachments list -->
    <div v-if="attachments.length > 0" class="space-y-2">
      <div
        v-for="(attachment, index) in attachments"
        :key="index"
        class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
      >
        <component :is="getFileIcon(attachment.type)" class="h-5 w-5 text-slate-400 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 truncate">
            {{ attachment.name }}
          </p>
          <p class="text-xs text-slate-500">
            {{ formatFileSize(attachment.size) }}
          </p>
        </div>
        <button
          type="button"
          class="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
          title="Usuń załącznik"
          @click="handleDelete(index)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </div>

    <p v-else class="text-sm text-slate-500 text-center py-4">
      Brak załączników
    </p>
  </UiCard>
</template>
