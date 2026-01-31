<script setup lang="ts">
import { BookOpen, Users, ShoppingCart, TrendingUp, FileText } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

// Fetch dashboard data
const { data: coursesData, pending: coursesPending } = await useFetch('/api/admin/courses')
const { data: pagesData, pending: pagesPending } = await useFetch('/api/admin/pages')

const isLoading = computed(() => coursesPending.value || pagesPending.value)

const stats = computed(() => [
  {
    name: 'Kursy',
    value: coursesData.value?.courses?.length ?? 0,
    icon: BookOpen,
  },
  {
    name: 'Lekcje',
    value: coursesData.value?.courses?.reduce((acc: number, c: any) => acc + (c._count?.lessons ?? 0), 0) ?? 0,
    icon: FileText,
  },
  {
    name: 'Studenci',
    value: coursesData.value?.courses?.reduce((acc: number, c: any) => acc + (c._count?.enrollments ?? 0), 0) ?? 0,
    icon: Users,
  },
  {
    name: 'Strony',
    value: pagesData.value?.pages?.length ?? 0,
    icon: TrendingUp,
  },
])

// Recent courses
const recentCourses = computed(() => {
  return (coursesData.value?.courses ?? []).slice(0, 5)
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900 mb-6">
      Dashboard
    </h1>

    <!-- Stats Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <template v-if="isLoading">
        <UiCard v-for="i in 4" :key="i">
          <div class="flex items-center gap-4">
            <UiSkeleton width="3rem" height="3rem" rounded="lg" />
            <div>
              <UiSkeleton width="4rem" height="0.875rem" class="mb-2" />
              <UiSkeleton width="3rem" height="1.5rem" />
            </div>
          </div>
        </UiCard>
      </template>
      <template v-else>
        <AdminMetricCard
          v-for="stat in stats"
          :key="stat.name"
          :title="stat.name"
          :value="stat.value"
          :icon="stat.icon"
        />
      </template>
    </div>

    <!-- Recent Courses -->
    <UiCard>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-medium text-slate-900">
          Ostatnie kursy
        </h2>
        <NuxtLink
          to="/admin/courses"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Zobacz wszystkie
        </NuxtLink>
      </div>

      <template v-if="isLoading">
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4">
            <UiSkeleton width="2.5rem" height="2.5rem" rounded="lg" />
            <div class="flex-1">
              <UiSkeleton width="60%" height="1rem" class="mb-1" />
              <UiSkeleton width="40%" height="0.75rem" />
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="recentCourses.length === 0">
        <p class="text-center text-slate-500 py-4">
          Brak kursów. <NuxtLink to="/admin/courses/new" class="text-primary-600 hover:text-primary-700">Utwórz pierwszy kurs</NuxtLink>
        </p>
      </template>
      <template v-else>
        <div class="space-y-3">
          <NuxtLink
            v-for="course in recentCourses"
            :key="course.id"
            :to="`/admin/courses/${course.id}`"
            class="flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-slate-50 transition-colors duration-150"
          >
            <div class="p-2 bg-slate-100 rounded-lg">
              <BookOpen class="h-5 w-5 text-slate-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-900 truncate">{{ course.title }}</p>
              <p class="text-sm text-slate-500">
                {{ course._count?.lessons ?? 0 }} lekcji · {{ course._count?.enrollments ?? 0 }} studentów
              </p>
            </div>
            <UiBadge :variant="course.status === 'PUBLISHED' ? 'success' : course.status === 'ARCHIVED' ? 'warning' : 'default'">
              {{ course.status === 'PUBLISHED' ? 'Opublikowany' : course.status === 'ARCHIVED' ? 'Zarchiwizowany' : 'Szkic' }}
            </UiBadge>
          </NuxtLink>
        </div>
      </template>
    </UiCard>
  </div>
</template>
