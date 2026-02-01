<script setup lang="ts">
import { TrendingUp, BarChart3 } from 'lucide-vue-next'

interface PopularCourse {
  id: string
  title: string
  enrollments: number
}

interface CourseCompletion {
  id: string
  title: string
  completionRate: number
}

interface Props {
  popularCourses: PopularCourse[]
  completionRates: CourseCompletion[]
}

defineProps<Props>()

function getCompletionColor(rate: number): string {
  if (rate >= 70) return 'bg-green-500'
  if (rate >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Popular Courses -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div class="flex items-center gap-2 mb-4">
        <TrendingUp class="h-5 w-5 text-slate-600" />
        <h3 class="text-lg font-semibold text-slate-900">Najpopularniejsze kursy</h3>
      </div>

      <div v-if="popularCourses.length === 0" class="text-sm text-slate-500 py-4 text-center">
        Brak danych
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(course, index) in popularCourses"
          :key="course.id"
          class="flex items-center gap-3"
        >
          <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center justify-center">
            {{ index + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">{{ course.title }}</p>
          </div>
          <span class="text-sm text-slate-600">
            {{ course.enrollments }} {{ course.enrollments === 1 ? 'zapis' : 'zapisów' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Completion Rates -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div class="flex items-center gap-2 mb-4">
        <BarChart3 class="h-5 w-5 text-slate-600" />
        <h3 class="text-lg font-semibold text-slate-900">Wskaźnik ukończenia</h3>
      </div>

      <div v-if="completionRates.length === 0" class="text-sm text-slate-500 py-4 text-center">
        Brak danych
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="course in completionRates"
          :key="course.id"
        >
          <div class="flex items-center justify-between mb-1">
            <p class="text-sm font-medium text-slate-900 truncate flex-1">{{ course.title }}</p>
            <span class="text-sm text-slate-600 ml-2">{{ course.completionRate }}%</span>
          </div>
          <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              :class="[getCompletionColor(course.completionRate), 'h-full transition-all duration-500']"
              :style="{ width: `${course.completionRate}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
