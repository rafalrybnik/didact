<script setup lang="ts">
import { BookOpen, Users, Play, CheckCircle, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-vue-next'

definePageMeta({
  layout: 'public',
})

const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch(`/api/public/courses/${slug}`)

const course = computed(() => data.value?.course)
const isEnrolled = computed(() => data.value?.isEnrolled)

const { isLoggedIn } = useAuth()
const { error: showError } = useToast()

// Price formatting
function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Bezpłatny'
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  })
  return formatter.format(price / 100)
}

// Module expansion
const expandedModules = ref<Set<string>>(new Set())

function toggleModule(moduleId: string) {
  if (expandedModules.value.has(moduleId)) {
    expandedModules.value.delete(moduleId)
  } else {
    expandedModules.value.add(moduleId)
  }
}

// Purchase handling
const isPurchasing = ref(false)

async function handlePurchase() {
  if (!isLoggedIn.value) {
    navigateTo(`/login?redirect=/c/${slug}`)
    return
  }

  if (isEnrolled.value) {
    navigateTo(`/course/${slug}`)
    return
  }

  isPurchasing.value = true
  try {
    const response = await $fetch<{
      success: boolean
      free: boolean
      sessionUrl?: string
      redirectUrl?: string
    }>('/api/checkout/create-session', {
      method: 'POST',
      body: { courseSlug: slug },
    })

    if (response.free) {
      navigateTo(response.redirectUrl)
    } else if (response.sessionUrl) {
      window.location.href = response.sessionUrl
    }
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się rozpocząć zakupu')
  } finally {
    isPurchasing.value = false
  }
}

// SEO
useHead(() => ({
  title: course.value?.title ? `${course.value.title} | Didact` : 'Kurs | Didact',
  meta: [
    { name: 'description', content: course.value?.description || '' },
  ],
}))
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="pending" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <UiSkeleton width="80%" height="3rem" />
          <UiSkeleton width="100%" height="300px" />
          <UiSkeleton width="100%" height="200px" />
        </div>
        <div>
          <UiSkeleton width="100%" height="300px" />
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 class="text-2xl font-bold text-slate-900 mb-4">Kurs nie został znaleziony</h1>
      <p class="text-slate-500 mb-6">{{ error.data?.message || 'Kurs nie istnieje lub nie jest dostępny.' }}</p>
      <NuxtLink to="/">
        <UiButton variant="primary">Wróć do strony głównej</UiButton>
      </NuxtLink>
    </div>

    <!-- Course content -->
    <template v-else-if="course">
      <!-- Hero Section -->
      <div class="bg-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div class="grid lg:grid-cols-3 gap-8 items-start">
            <!-- Course Info -->
            <div class="lg:col-span-2">
              <h1 class="text-3xl lg:text-4xl font-bold mb-4">
                {{ course.title }}
              </h1>
              <p v-if="course.description" class="text-lg text-slate-300 mb-6">
                {{ course.description }}
              </p>

              <!-- Stats -->
              <div class="flex flex-wrap gap-6 text-sm">
                <span class="flex items-center gap-2">
                  <Play class="w-5 h-5 text-primary-400" />
                  {{ course.lessonsCount }} lekcji
                </span>
                <span class="flex items-center gap-2">
                  <Users class="w-5 h-5 text-primary-400" />
                  {{ course.studentsCount }} kursantów
                </span>
              </div>
            </div>

            <!-- Purchase Card (Desktop) -->
            <div class="hidden lg:block">
              <div class="bg-white rounded-xl shadow-xl p-6 text-slate-900 sticky top-8">
                <!-- Thumbnail -->
                <div class="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-4">
                  <img
                    v-if="course.thumbnailUrl"
                    :src="course.thumbnailUrl"
                    :alt="course.title"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <BookOpen class="w-12 h-12 text-slate-300" />
                  </div>
                </div>

                <!-- Price -->
                <div class="text-center mb-4">
                  <span class="text-3xl font-bold" :class="course.price === 0 ? 'text-green-600' : ''">
                    {{ formatPrice(course.price, course.currency) }}
                  </span>
                </div>

                <!-- CTA Button -->
                <UiButton
                  variant="primary"
                  class="w-full justify-center text-lg py-3"
                  :disabled="isPurchasing"
                  @click="handlePurchase"
                >
                  <template v-if="isEnrolled">
                    <Play class="w-5 h-5" />
                    Przejdź do kursu
                  </template>
                  <template v-else-if="course.price === 0">
                    <CheckCircle class="w-5 h-5" />
                    {{ isPurchasing ? 'Zapisywanie...' : 'Zapisz się bezpłatnie' }}
                  </template>
                  <template v-else>
                    <ShoppingCart class="w-5 h-5" />
                    {{ isPurchasing ? 'Przekierowanie...' : 'Kup teraz' }}
                  </template>
                </UiButton>

                <!-- Already enrolled message -->
                <p v-if="isEnrolled" class="text-sm text-green-600 text-center mt-3 flex items-center justify-center gap-1">
                  <CheckCircle class="w-4 h-4" />
                  Masz dostęp do tego kursu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Sales Description -->
            <div v-if="course.salesDescription">
              <h2 class="text-2xl font-bold text-slate-900 mb-4">O kursie</h2>
              <div
                class="prose prose-slate max-w-none"
                v-html="course.salesDescription"
              />
            </div>

            <!-- Curriculum -->
            <div v-if="course.modules.length > 0">
              <h2 class="text-2xl font-bold text-slate-900 mb-4">Program kursu</h2>
              <div class="border border-slate-200 rounded-lg divide-y divide-slate-200">
                <div
                  v-for="module in course.modules"
                  :key="module.id"
                >
                  <button
                    class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    @click="toggleModule(module.id)"
                  >
                    <div class="flex items-center gap-3">
                      <BookOpen class="w-5 h-5 text-slate-400" />
                      <span class="font-medium text-slate-900">{{ module.title }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-500">
                      <span>{{ module.lessonsCount }} lekcji</span>
                      <component
                        :is="expandedModules.has(module.id) ? ChevronUp : ChevronDown"
                        class="w-5 h-5"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Spacer for desktop (purchase card is in hero) -->
          <div class="hidden lg:block" />
        </div>
      </div>

      <!-- Mobile Purchase Bar -->
      <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-40">
        <div class="flex items-center justify-between gap-4">
          <div>
            <span class="text-2xl font-bold" :class="course.price === 0 ? 'text-green-600' : 'text-slate-900'">
              {{ formatPrice(course.price, course.currency) }}
            </span>
          </div>
          <UiButton
            variant="primary"
            :disabled="isPurchasing"
            @click="handlePurchase"
          >
            <template v-if="isEnrolled">
              <Play class="w-4 h-4" />
              Przejdź do kursu
            </template>
            <template v-else-if="course.price === 0">
              {{ isPurchasing ? 'Zapisywanie...' : 'Zapisz się' }}
            </template>
            <template v-else>
              {{ isPurchasing ? 'Przekierowanie...' : 'Kup teraz' }}
            </template>
          </UiButton>
        </div>
      </div>

      <!-- Bottom padding for mobile sticky bar -->
      <div class="lg:hidden h-20" />
    </template>
  </div>
</template>
