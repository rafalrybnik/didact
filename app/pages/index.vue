<script setup lang="ts">
import { BookOpen, Users, Play } from 'lucide-vue-next'

definePageMeta({
  layout: 'public',
})

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnailUrl: string | null
  price: number
  currency: string
  lessonsCount: number
  studentsCount: number
}

const { data, pending, error } = await useFetch<{ courses: Course[] }>('/api/public/courses')

const courses = computed(() => data.value?.courses || [])

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Bezpłatny'
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  })
  return formatter.format(price / 100)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-4 text-balance">
        Zdobywaj nowe umiejętności
      </h1>
      <p class="text-lg text-slate-600 max-w-2xl mx-auto">
        Odkryj kursy online, które pomogą Ci rozwinąć karierę i zdobyć nowe kompetencje.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UiCard v-for="i in 3" :key="i" hover padding="none">
        <div class="aspect-video bg-slate-100">
          <UiSkeleton width="100%" height="100%" rounded="none" />
        </div>
        <div class="p-4">
          <UiSkeleton width="70%" height="1.5rem" class="mb-2" />
          <UiSkeleton width="100%" height="1rem" class="mb-1" />
          <UiSkeleton width="60%" height="1rem" class="mb-4" />
          <div class="flex justify-between items-center">
            <UiSkeleton width="4rem" height="1.25rem" />
            <UiSkeleton width="6rem" height="2rem" rounded="lg" />
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Error state -->
    <UiCard v-else-if="error" class="text-center py-12">
      <p class="text-red-600 mb-4">Nie udało się załadować kursów</p>
      <UiButton variant="secondary" @click="() => refreshNuxtData()">Spróbuj ponownie</UiButton>
    </UiCard>

    <!-- Empty state -->
    <div v-else-if="courses.length === 0" class="text-center py-12">
      <BookOpen class="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h2 class="text-xl font-medium text-slate-900 mb-2">Brak dostępnych kursów</h2>
      <p class="text-slate-500">Nowe kursy pojawią się wkrótce.</p>
    </div>

    <!-- Course grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="course in courses"
        :key="course.id"
        :to="`/c/${course.slug}`"
        class="group"
      >
        <UiCard hover padding="none" class="h-full overflow-hidden">
          <!-- Thumbnail -->
          <div class="aspect-video bg-slate-100 relative overflow-hidden">
            <img
              v-if="course.thumbnailUrl"
              :src="course.thumbnailUrl"
              :alt="course.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <BookOpen class="w-12 h-12 text-slate-300" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <h3 class="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {{ course.title }}
            </h3>

            <p v-if="course.description" class="text-sm text-slate-500 mb-4 line-clamp-2">
              {{ course.description }}
            </p>

            <!-- Stats -->
            <div class="flex items-center gap-4 text-sm text-slate-500 mb-4">
              <span class="flex items-center gap-1">
                <Play class="w-4 h-4" />
                {{ course.lessonsCount }} lekcji
              </span>
              <span class="flex items-center gap-1">
                <Users class="w-4 h-4" />
                {{ course.studentsCount }} kursantów
              </span>
            </div>

            <!-- Price -->
            <div class="flex items-center justify-between">
              <span class="font-bold text-lg" :class="course.price === 0 ? 'text-green-600' : 'text-slate-900'">
                {{ formatPrice(course.price, course.currency) }}
              </span>
              <span class="text-sm text-primary-600 font-medium group-hover:underline">
                Zobacz szczegóły
              </span>
            </div>
          </div>
        </UiCard>
      </NuxtLink>
    </div>
  </div>
</template>
