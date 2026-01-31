<script setup lang="ts">
import { Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

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

const { data, pending, error, refresh } = await useFetch<{ submissions: Submission[] }>('/api/admin/submissions')

const submissions = computed(() => data.value?.submissions || [])

// Filters
const statusFilter = ref<string>('')

const filteredSubmissions = computed(() => {
  let result = submissions.value

  if (statusFilter.value) {
    result = result.filter(s => s.status === statusFilter.value)
  }

  return result
})

const pendingCount = computed(() => submissions.value.filter(s => s.status === 'PENDING').length)

const statusInfo = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { icon: Clock, label: 'Oczekuje', color: 'text-amber-600', bg: 'bg-amber-100' }
    case 'PASSED':
      return { icon: CheckCircle, label: 'Zaliczone', color: 'text-green-600', bg: 'bg-green-100' }
    case 'REJECTED':
      return { icon: XCircle, label: 'Odrzucone', color: 'text-red-600', bg: 'bg-red-100' }
    default:
      return { icon: Clock, label: status, color: 'text-slate-600', bg: 'bg-slate-100' }
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Zgłoszenia</h1>
        <p class="text-slate-500 mt-1">
          {{ pendingCount }} oczekujących na ocenę
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <Filter class="w-4 h-4 text-slate-500" />
        <span class="text-sm text-slate-500">Status:</span>
      </div>
      <select
        v-model="statusFilter"
        class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="">Wszystkie</option>
        <option value="PENDING">Oczekujące</option>
        <option value="PASSED">Zaliczone</option>
        <option value="REJECTED">Odrzucone</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <UiSkeleton v-for="i in 5" :key="i" width="100%" height="80px" />
    </div>

    <!-- Error -->
    <UiCard v-else-if="error">
      <p class="text-red-600">Nie udało się załadować zgłoszeń</p>
    </UiCard>

    <!-- Empty state -->
    <UiCard v-else-if="filteredSubmissions.length === 0" class="text-center py-12">
      <Clock class="h-12 w-12 text-slate-300 mx-auto mb-4" />
      <h2 class="text-lg font-medium text-slate-900 mb-2">Brak zgłoszeń</h2>
      <p class="text-slate-500">Nie ma żadnych zgłoszeń do wyświetlenia.</p>
    </UiCard>

    <!-- Submissions list -->
    <div v-else class="space-y-4">
      <UiCard
        v-for="submission in filteredSubmissions"
        :key="submission.id"
        class="hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-4">
          <!-- User avatar -->
          <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              v-if="submission.user.avatarUrl"
              :src="submission.user.avatarUrl"
              :alt="submission.user.name || 'User'"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-sm font-medium text-slate-500">
              {{ (submission.user.name || submission.user.email)[0].toUpperCase() }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-slate-900 truncate">
                {{ submission.user.name || submission.user.email }}
              </span>
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                :class="[statusInfo(submission.status).bg, statusInfo(submission.status).color]"
              >
                <component :is="statusInfo(submission.status).icon" class="w-3 h-3" />
                {{ statusInfo(submission.status).label }}
              </span>
            </div>

            <p class="text-sm text-slate-500">
              {{ submission.homework.lesson.course.title }} / {{ submission.homework.lesson.title }}
            </p>

            <p class="text-xs text-slate-400 mt-1">
              Wysłano: {{ new Date(submission.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>

          <!-- Actions -->
          <NuxtLink :to="`/admin/submissions/${submission.id}`">
            <UiButton variant="secondary" size="sm">
              <Eye class="w-4 h-4" />
              {{ submission.status === 'PENDING' ? 'Oceń' : 'Zobacz' }}
            </UiButton>
          </NuxtLink>
        </div>
      </UiCard>
    </div>
  </div>
</template>
