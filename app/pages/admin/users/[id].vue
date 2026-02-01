<script setup lang="ts">
import { ArrowLeft, User, Shield, Save, Trash2, Plus, BookOpen, ShoppingCart, Calendar } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { addToast } = useToast()
const userId = route.params.id as string

interface Course {
  id: string
  title: string
  slug: string
}

interface Enrollment {
  id: string
  createdAt: string
  course: Course
}

interface Order {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  course: {
    id: string
    title: string
  }
}

interface UserData {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'STUDENT'
  avatarUrl: string | null
  createdAt: string
  enrollments: Enrollment[]
  orders: Order[]
}

const { data, pending, error, refresh } = await useFetch<{ user: UserData; availableCourses: Course[] }>(`/api/admin/users/${userId}`)

const user = computed(() => data.value?.user)
const availableCourses = computed(() => data.value?.availableCourses || [])

// Form state
const formName = ref('')
const formRole = ref<'ADMIN' | 'STUDENT'>('STUDENT')
const saving = ref(false)

// Initialize form when data loads
watch(user, (u) => {
  if (u) {
    formName.value = u.name || ''
    formRole.value = u.role
  }
}, { immediate: true })

// Enrollment state
const selectedCourseId = ref('')
const addingEnrollment = ref(false)
const deletingEnrollmentId = ref<string | null>(null)

async function saveUser() {
  saving.value = true
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: {
        name: formName.value || null,
        role: formRole.value,
      },
    })
    addToast({ type: 'success', message: 'Użytkownik został zaktualizowany' })
    refresh()
  } catch (e: any) {
    addToast({ type: 'error', message: e.data?.message || 'Nie udało się zapisać zmian' })
  } finally {
    saving.value = false
  }
}

async function addEnrollment() {
  if (!selectedCourseId.value) return

  addingEnrollment.value = true
  try {
    await $fetch(`/api/admin/users/${userId}/enrollments`, {
      method: 'POST',
      body: {
        courseId: selectedCourseId.value,
      },
    })
    addToast({ type: 'success', message: 'Użytkownik został zapisany na kurs' })
    selectedCourseId.value = ''
    refresh()
  } catch (e: any) {
    addToast({ type: 'error', message: e.data?.message || 'Nie udało się zapisać na kurs' })
  } finally {
    addingEnrollment.value = false
  }
}

async function removeEnrollment(enrollmentId: string) {
  if (!confirm('Czy na pewno chcesz usunąć ten zapis? Postęp użytkownika w kursie zostanie utracony.')) {
    return
  }

  deletingEnrollmentId.value = enrollmentId
  try {
    await $fetch(`/api/admin/users/${userId}/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    })
    addToast({ type: 'success', message: 'Zapis został usunięty' })
    refresh()
  } catch (e: any) {
    addToast({ type: 'error', message: e.data?.message || 'Nie udało się usunąć zapisu' })
  } finally {
    deletingEnrollmentId.value = null
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100)
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: 'Oczekuje',
    COMPLETED: 'Opłacone',
    FAILED: 'Nieudane',
    REFUNDED: 'Zwrot',
  }
  return labels[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-slate-100 text-slate-700',
  }
  return colors[status] || 'bg-slate-100 text-slate-700'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink to="/admin/users" class="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft class="w-4 h-4" />
        Powrót do listy
      </NuxtLink>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              v-if="user?.avatarUrl"
              :src="user.avatarUrl"
              class="w-full h-full object-cover"
            />
            <User v-else class="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900">{{ user?.name || 'Bez nazwy' }}</h1>
            <p class="text-slate-500">{{ user?.email }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <UiSkeleton width="100%" height="200px" />
      <UiSkeleton width="100%" height="300px" />
    </div>

    <!-- Error -->
    <UiCard v-else-if="error">
      <p class="text-red-600">Nie udało się załadować danych użytkownika</p>
    </UiCard>

    <!-- Content -->
    <div v-else-if="user" class="space-y-6">
      <!-- Basic info form -->
      <UiCard>
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Dane podstawowe</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nazwa</label>
            <input
              v-model="formName"
              type="text"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Imię i nazwisko"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              :value="user.email"
              type="email"
              disabled
              class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
            />
            <p class="text-xs text-slate-500 mt-1">Email nie może być zmieniony</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Rola</label>
            <select
              v-model="formRole"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div class="flex items-center gap-2 text-sm text-slate-500">
            <Calendar class="w-4 h-4" />
            Dołączył: {{ formatDate(user.createdAt) }}
          </div>

          <div class="pt-4 border-t border-slate-200">
            <UiButton :loading="saving" @click="saveUser">
              <Save class="w-4 h-4" />
              Zapisz zmiany
            </UiButton>
          </div>
        </div>
      </UiCard>

      <!-- Enrollments -->
      <UiCard>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-primary-600" />
            Zapisane kursy ({{ user.enrollments.length }})
          </h2>
        </div>

        <!-- Add enrollment -->
        <div v-if="availableCourses.length > 0" class="flex gap-2 mb-4">
          <select
            v-model="selectedCourseId"
            class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Wybierz kurs do dodania...</option>
            <option v-for="course in availableCourses" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
          <UiButton
            :disabled="!selectedCourseId"
            :loading="addingEnrollment"
            @click="addEnrollment"
          >
            <Plus class="w-4 h-4" />
            Dodaj
          </UiButton>
        </div>

        <!-- Enrollments list -->
        <div v-if="user.enrollments.length > 0" class="divide-y divide-slate-200">
          <div
            v-for="enrollment in user.enrollments"
            :key="enrollment.id"
            class="py-3 flex items-center justify-between"
          >
            <div>
              <p class="font-medium text-slate-900">{{ enrollment.course.title }}</p>
              <p class="text-sm text-slate-500">
                Zapisany: {{ formatDate(enrollment.createdAt) }}
              </p>
            </div>
            <button
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              :disabled="deletingEnrollmentId === enrollment.id"
              @click="removeEnrollment(enrollment.id)"
            >
              <Trash2 v-if="deletingEnrollmentId !== enrollment.id" class="w-4 h-4" />
              <span v-else class="w-4 h-4 block border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </button>
          </div>
        </div>

        <p v-else class="text-slate-500 text-center py-4">
          Użytkownik nie jest zapisany na żaden kurs
        </p>
      </UiCard>

      <!-- Recent orders -->
      <UiCard>
        <h2 class="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <ShoppingCart class="w-5 h-5 text-primary-600" />
          Ostatnie zamówienia
        </h2>

        <div v-if="user.orders.length > 0" class="divide-y divide-slate-200">
          <div
            v-for="order in user.orders"
            :key="order.id"
            class="py-3 flex items-center justify-between"
          >
            <div>
              <p class="font-medium text-slate-900">{{ order.course.title }}</p>
              <p class="text-sm text-slate-500">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-slate-900">{{ formatPrice(order.amount, order.currency) }}</p>
              <span :class="['text-xs px-2 py-0.5 rounded-full', getStatusColor(order.status)]">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
          </div>
        </div>

        <p v-else class="text-slate-500 text-center py-4">
          Brak zamówień
        </p>
      </UiCard>
    </div>
  </div>
</template>
