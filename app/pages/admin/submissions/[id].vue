<script setup lang="ts">
import { ArrowLeft, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { error: showError, success: showSuccess } = useToast()

const id = route.params.id as string

interface Submission {
  id: string
  contentText: string | null
  fileUrl: string | null
  status: 'PENDING' | 'PASSED' | 'REJECTED'
  feedback: string | null
  gradedAt: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  homework: {
    prompt: string
    lesson: {
      id: string
      title: string
      course: {
        id: string
        title: string
        slug: string
      }
    }
  }
}

const { data, pending, error } = await useFetch<{ submission: Submission }>(`/api/admin/submissions/${id}`)

const submission = computed(() => data.value?.submission)

// Form state
const feedback = ref('')
const isGrading = ref(false)

// Initialize feedback if exists
watchEffect(() => {
  if (submission.value?.feedback) {
    feedback.value = submission.value.feedback
  }
})

const statusInfo = computed(() => {
  if (!submission.value) return null

  switch (submission.value.status) {
    case 'PENDING':
      return { icon: Clock, label: 'Oczekuje na ocenę', color: 'text-amber-600', bg: 'bg-amber-100' }
    case 'PASSED':
      return { icon: CheckCircle, label: 'Zaliczone', color: 'text-green-600', bg: 'bg-green-100' }
    case 'REJECTED':
      return { icon: XCircle, label: 'Odrzucone', color: 'text-red-600', bg: 'bg-red-100' }
    default:
      return null
  }
})

async function gradeSubmission(status: 'PASSED' | 'REJECTED') {
  if (isGrading.value) return

  isGrading.value = true
  try {
    await $fetch(`/api/admin/submissions/${id}`, {
      method: 'PUT',
      body: {
        status,
        feedback: feedback.value.trim() || undefined,
      },
    })

    showSuccess(
      status === 'PASSED' ? 'Zaliczone' : 'Odrzucone',
      status === 'PASSED' ? 'Zadanie zostało zaliczone' : 'Zadanie zostało odrzucone'
    )

    router.push('/admin/submissions')
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się ocenić zadania')
  } finally {
    isGrading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <div>
      <NuxtLink
        to="/admin/submissions"
        class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft class="w-4 h-4" />
        Wróć do listy
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <UiSkeleton width="100%" height="200px" />
      <UiSkeleton width="100%" height="300px" />
    </div>

    <!-- Error -->
    <UiCard v-else-if="error">
      <p class="text-red-600">Nie udało się załadować zgłoszenia</p>
    </UiCard>

    <!-- Content -->
    <template v-else-if="submission">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Ocena zadania</h1>
          <p class="text-slate-500 mt-1">
            {{ submission.homework.lesson.course.title }} / {{ submission.homework.lesson.title }}
          </p>
        </div>
        <span
          v-if="statusInfo"
          class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
          :class="[statusInfo.bg, statusInfo.color]"
        >
          <component :is="statusInfo.icon" class="w-4 h-4" />
          {{ statusInfo.label }}
        </span>
      </div>

      <!-- Student info -->
      <UiCard>
        <h3 class="font-medium text-slate-900 mb-3">Student</h3>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              v-if="submission.user.avatarUrl"
              :src="submission.user.avatarUrl"
              :alt="submission.user.name || 'User'"
              class="w-full h-full object-cover"
            />
            <User v-else class="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p class="font-medium text-slate-900">
              {{ submission.user.name || 'Brak imienia' }}
            </p>
            <p class="text-sm text-slate-500">{{ submission.user.email }}</p>
          </div>
        </div>
      </UiCard>

      <!-- Homework prompt -->
      <UiCard>
        <h3 class="font-medium text-slate-900 mb-3">Treść zadania</h3>
        <p class="text-slate-700 whitespace-pre-wrap">{{ submission.homework.prompt }}</p>
      </UiCard>

      <!-- Submission content -->
      <UiCard>
        <h3 class="font-medium text-slate-900 mb-3">Odpowiedź studenta</h3>
        <p class="text-xs text-slate-400 mb-3">
          Wysłano: {{ new Date(submission.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
        </p>

        <div v-if="submission.contentText" class="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
          <p class="text-slate-700 whitespace-pre-wrap">{{ submission.contentText }}</p>
        </div>

        <div v-if="submission.fileUrl">
          <a
            :href="submission.fileUrl"
            target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <FileText class="w-5 h-5" />
            Pobierz załącznik
          </a>
        </div>

        <p v-if="!submission.contentText && !submission.fileUrl" class="text-slate-500 italic">
          Brak treści
        </p>
      </UiCard>

      <!-- Grading form -->
      <UiCard>
        <h3 class="font-medium text-slate-900 mb-3">
          {{ submission.status === 'PENDING' ? 'Oceń zadanie' : 'Feedback' }}
        </h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Komentarz (opcjonalny)
          </label>
          <textarea
            v-model="feedback"
            rows="4"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
            placeholder="Dodaj feedback dla studenta..."
            :disabled="submission.status !== 'PENDING'"
          />
        </div>

        <div v-if="submission.status === 'PENDING'" class="flex gap-3">
          <UiButton
            variant="primary"
            :disabled="isGrading"
            @click="gradeSubmission('PASSED')"
          >
            <CheckCircle class="w-4 h-4" />
            Zalicz
          </UiButton>
          <UiButton
            variant="secondary"
            :disabled="isGrading"
            @click="gradeSubmission('REJECTED')"
          >
            <XCircle class="w-4 h-4" />
            Odrzuć
          </UiButton>
        </div>

        <div v-else class="text-sm text-slate-500">
          <span v-if="submission.gradedAt">
            Oceniono: {{ new Date(submission.gradedAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </span>
        </div>
      </UiCard>
    </template>
  </div>
</template>
