<script setup lang="ts">
import { Upload, FileText, CheckCircle, Clock, XCircle, Send } from 'lucide-vue-next'

interface HomeworkData {
  id: string
  lessonId: string
  prompt: string
  allowFile: boolean
  allowText: boolean
}

interface SubmissionData {
  id: string
  contentText: string | null
  fileUrl: string | null
  status: 'PENDING' | 'PASSED' | 'REJECTED'
  feedback: string | null
  gradedAt: string | null
  createdAt: string
}

interface Props {
  homework: HomeworkData
  submission: SubmissionData | null
  courseSlug: string
  lessonId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'submitted'): void
}>()

const { error: showError, success: showSuccess } = useToast()

// State
const contentText = ref('')
const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)
const currentSubmission = ref(props.submission)

// Computed
const statusInfo = computed(() => {
  if (!currentSubmission.value) return null

  switch (currentSubmission.value.status) {
    case 'PENDING':
      return {
        icon: Clock,
        label: 'Oczekuje na ocenę',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      }
    case 'PASSED':
      return {
        icon: CheckCircle,
        label: 'Zaliczone',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      }
    case 'REJECTED':
      return {
        icon: XCircle,
        label: 'Do poprawy',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      }
  }
})

const canSubmit = computed(() => {
  if (!currentSubmission.value) return true
  return currentSubmission.value.status === 'REJECTED'
})

// Methods
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('Błąd', 'Plik jest za duży (max 10MB)')
      return
    }
    selectedFile.value = file
  }
}

function removeFile() {
  selectedFile.value = null
}

async function submitHomework() {
  if (isSubmitting.value) return

  // Validate
  if (!contentText.value.trim() && !selectedFile.value) {
    showError('Błąd', 'Dodaj tekst lub plik')
    return
  }

  if (!props.homework.allowText && contentText.value.trim()) {
    showError('Błąd', 'Odpowiedź tekstowa nie jest dozwolona')
    return
  }

  if (!props.homework.allowFile && selectedFile.value) {
    showError('Błąd', 'Przesyłanie plików nie jest dozwolone')
    return
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()

    if (contentText.value.trim()) {
      formData.append('contentText', contentText.value.trim())
    }

    if (selectedFile.value) {
      formData.append('file', selectedFile.value)
    }

    const response = await $fetch<{ submission: SubmissionData }>(
      `/api/courses/${props.courseSlug}/lessons/${props.lessonId}/homework/submit`,
      {
        method: 'POST',
        body: formData,
      }
    )

    currentSubmission.value = response.submission
    showSuccess('Wysłano', 'Zadanie zostało przesłane do oceny')
    emit('submitted')

    // Clear form
    contentText.value = ''
    selectedFile.value = null
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się wysłać zadania')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
      <h3 class="font-semibold text-slate-900">Zadanie domowe</h3>
    </div>

    <div class="p-6">
      <!-- Prompt -->
      <div class="prose prose-sm max-w-none mb-6">
        <p class="text-slate-700 whitespace-pre-wrap">{{ homework.prompt }}</p>
      </div>

      <!-- Existing submission status -->
      <div
        v-if="currentSubmission && statusInfo"
        class="mb-6 p-4 rounded-lg border"
        :class="[statusInfo.bgColor, statusInfo.borderColor]"
      >
        <div class="flex items-center gap-2 mb-2">
          <component :is="statusInfo.icon" class="w-5 h-5" :class="statusInfo.color" />
          <span class="font-medium" :class="statusInfo.color">{{ statusInfo.label }}</span>
        </div>

        <p class="text-sm text-slate-600 mb-2">
          Wysłano: {{ new Date(currentSubmission.createdAt).toLocaleDateString('pl-PL') }}
        </p>

        <div v-if="currentSubmission.contentText" class="mt-3 p-3 bg-white rounded border border-slate-200">
          <p class="text-sm text-slate-500 mb-1">Twoja odpowiedź:</p>
          <p class="text-slate-700 whitespace-pre-wrap">{{ currentSubmission.contentText }}</p>
        </div>

        <div v-if="currentSubmission.fileUrl" class="mt-3">
          <a
            :href="currentSubmission.fileUrl"
            target="_blank"
            class="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
          >
            <FileText class="w-4 h-4" />
            Zobacz przesłany plik
          </a>
        </div>

        <div v-if="currentSubmission.feedback" class="mt-3 p-3 bg-white rounded border border-slate-200">
          <p class="text-sm text-slate-500 mb-1">Feedback:</p>
          <p class="text-slate-700 whitespace-pre-wrap">{{ currentSubmission.feedback }}</p>
        </div>
      </div>

      <!-- Submission form -->
      <div v-if="canSubmit">
        <div v-if="currentSubmission?.status === 'REJECTED'" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p class="text-sm text-amber-700">
            Twoje poprzednie zgłoszenie zostało odrzucone. Możesz przesłać poprawioną wersję.
          </p>
        </div>

        <!-- Text input -->
        <div v-if="homework.allowText" class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Odpowiedź tekstowa
          </label>
          <textarea
            v-model="contentText"
            rows="6"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
            placeholder="Wpisz swoją odpowiedź..."
          />
        </div>

        <!-- File upload -->
        <div v-if="homework.allowFile" class="mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Plik
          </label>

          <div v-if="selectedFile" class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <FileText class="w-5 h-5 text-slate-500" />
            <span class="flex-1 truncate text-sm text-slate-700">{{ selectedFile.name }}</span>
            <button
              type="button"
              class="text-sm text-red-600 hover:underline"
              @click="removeFile"
            >
              Usuń
            </button>
          </div>

          <label
            v-else
            class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
          >
            <Upload class="w-8 h-8 text-slate-400 mb-2" />
            <span class="text-sm text-slate-500">Kliknij, aby wybrać plik</span>
            <span class="text-xs text-slate-400 mt-1">Max 10MB</span>
            <input
              type="file"
              class="hidden"
              @change="handleFileSelect"
            />
          </label>
        </div>

        <!-- Submit button -->
        <UiButton
          variant="primary"
          :disabled="isSubmitting || (!contentText.trim() && !selectedFile)"
          @click="submitHomework"
        >
          <Send class="w-4 h-4" />
          {{ isSubmitting ? 'Wysyłanie...' : 'Wyślij zadanie' }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
