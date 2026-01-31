<script setup lang="ts">
import { BookOpen, Play, CheckCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

const { data, pending, error } = await useFetch('/api/account/enrollments')

const enrollments = computed(() => data.value?.enrollments || [])
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-slate-900 mb-6">Moje kursy</h1>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UiCard v-for="i in 3" :key="i">
        <UiSkeleton width="100%" height="160px" class="mb-4 rounded-lg" />
        <UiSkeleton width="80%" height="1.5rem" class="mb-2" />
        <UiSkeleton width="40%" height="1rem" />
      </UiCard>
    </div>

    <!-- Error -->
    <UiCard v-else-if="error">
      <p class="text-red-600">Nie udało się załadować kursów</p>
    </UiCard>

    <!-- Empty state -->
    <UiCard v-else-if="enrollments.length === 0" class="text-center py-12">
      <BookOpen class="h-12 w-12 text-slate-300 mx-auto mb-4" />
      <h2 class="text-lg font-medium text-slate-900 mb-2">Nie masz jeszcze żadnych kursów</h2>
      <p class="text-slate-500 mb-4">Przeglądaj dostępne kursy i znajdź coś dla siebie.</p>
      <NuxtLink to="/">
        <UiButton variant="primary">Przeglądaj kursy</UiButton>
      </NuxtLink>
    </UiCard>

    <!-- Course list -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UiCard
        v-for="enrollment in enrollments"
        :key="enrollment.id"
        class="overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Thumbnail -->
        <div class="aspect-video bg-slate-100 -mx-6 -mt-6 mb-4">
          <img
            v-if="enrollment.course.thumbnailUrl"
            :src="enrollment.course.thumbnailUrl"
            :alt="enrollment.course.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <BookOpen class="h-12 w-12 text-slate-300" />
          </div>
        </div>

        <!-- Content -->
        <h3 class="font-semibold text-slate-900 mb-2 line-clamp-2">
          {{ enrollment.course.title }}
        </h3>

        <!-- Progress -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-slate-500 mb-1">
            <span>Postęp</span>
            <span>{{ enrollment.progress.percentage }}%</span>
          </div>
          <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-300"
              :class="enrollment.progress.percentage === 100 ? 'bg-green-500' : 'bg-primary-500'"
              :style="{ width: `${enrollment.progress.percentage}%` }"
            />
          </div>
          <p class="text-sm text-slate-500 mt-1">
            {{ enrollment.progress.completed }}/{{ enrollment.progress.total }} lekcji
          </p>
        </div>

        <!-- Action -->
        <NuxtLink :to="`/course/${enrollment.course.slug}`">
          <UiButton
            variant="primary"
            class="w-full"
          >
            <component
              :is="enrollment.progress.percentage === 100 ? CheckCircle : Play"
              class="h-4 w-4"
            />
            {{ enrollment.progress.percentage === 100 ? 'Powtórz kurs' : enrollment.progress.percentage > 0 ? 'Kontynuuj' : 'Rozpocznij' }}
          </UiButton>
        </NuxtLink>
      </UiCard>
    </div>
  </div>
</template>
