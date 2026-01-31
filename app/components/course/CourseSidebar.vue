<script setup lang="ts">
import { CheckCircle, Circle, Lock, ChevronDown, ChevronRight } from 'lucide-vue-next'

interface Lesson {
  id: string
  title: string
  completed: boolean
  unlocked: boolean
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface Props {
  courseSlug: string
  courseTitle: string
  modules: Module[]
  standaloneLessons: Lesson[]
  currentLessonId?: string
  progress: {
    completed: number
    total: number
    percentage: number
  }
}

const props = defineProps<Props>()

// Track expanded modules
const expandedModules = ref<Set<string>>(new Set())

// Expand module containing current lesson by default
onMounted(() => {
  if (props.currentLessonId) {
    for (const module of props.modules) {
      if (module.lessons.some(l => l.id === props.currentLessonId)) {
        expandedModules.value.add(module.id)
        break
      }
    }
  }
})

function toggleModule(moduleId: string) {
  if (expandedModules.value.has(moduleId)) {
    expandedModules.value.delete(moduleId)
  } else {
    expandedModules.value.add(moduleId)
  }
}

function isModuleExpanded(moduleId: string): boolean {
  return expandedModules.value.has(moduleId)
}

function getModuleProgress(module: Module): number {
  const completed = module.lessons.filter(l => l.completed).length
  return Math.round((completed / module.lessons.length) * 100)
}
</script>

<template>
  <aside class="w-80 bg-slate-800 text-white flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-slate-700">
      <NuxtLink :to="`/course/${courseSlug}`" class="text-lg font-semibold hover:text-slate-300 transition-colors line-clamp-2">
        {{ courseTitle }}
      </NuxtLink>

      <!-- Progress bar -->
      <div class="mt-3">
        <div class="flex justify-between text-sm text-slate-400 mb-1">
          <span>Postęp</span>
          <span>{{ progress.completed }}/{{ progress.total }}</span>
        </div>
        <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary-500 transition-all duration-300"
            :style="{ width: `${progress.percentage}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Curriculum -->
    <nav class="flex-1 overflow-y-auto py-2">
      <!-- Modules -->
      <div v-for="module in modules" :key="module.id" class="mb-1">
        <!-- Module header -->
        <button
          class="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-700/50 transition-colors"
          @click="toggleModule(module.id)"
        >
          <component
            :is="isModuleExpanded(module.id) ? ChevronDown : ChevronRight"
            class="h-4 w-4 text-slate-400 flex-shrink-0"
          />
          <span class="flex-1 text-sm font-medium truncate">{{ module.title }}</span>
          <span class="text-xs text-slate-500">{{ getModuleProgress(module) }}%</span>
        </button>

        <!-- Module lessons -->
        <div v-show="isModuleExpanded(module.id)" class="ml-6 border-l border-slate-700">
          <NuxtLink
            v-for="lesson in module.lessons"
            :key="lesson.id"
            :to="lesson.unlocked ? `/course/${courseSlug}/${lesson.id}` : undefined"
            :class="[
              'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
              lesson.id === currentLessonId
                ? 'bg-slate-700 text-white'
                : lesson.unlocked
                  ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  : 'text-slate-500 cursor-not-allowed',
            ]"
          >
            <component
              :is="lesson.completed ? CheckCircle : lesson.unlocked ? Circle : Lock"
              :class="[
                'h-4 w-4 flex-shrink-0',
                lesson.completed ? 'text-green-500' : lesson.unlocked ? 'text-slate-400' : 'text-slate-600',
              ]"
            />
            <span class="truncate">{{ lesson.title }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Standalone lessons -->
      <div v-if="standaloneLessons.length > 0" class="mt-2 pt-2 border-t border-slate-700">
        <NuxtLink
          v-for="lesson in standaloneLessons"
          :key="lesson.id"
          :to="lesson.unlocked ? `/course/${courseSlug}/${lesson.id}` : undefined"
          :class="[
            'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
            lesson.id === currentLessonId
              ? 'bg-slate-700 text-white'
              : lesson.unlocked
                ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                : 'text-slate-500 cursor-not-allowed',
          ]"
        >
          <component
            :is="lesson.completed ? CheckCircle : lesson.unlocked ? Circle : Lock"
            :class="[
              'h-4 w-4 flex-shrink-0',
              lesson.completed ? 'text-green-500' : lesson.unlocked ? 'text-slate-400' : 'text-slate-600',
            ]"
          />
          <span class="truncate">{{ lesson.title }}</span>
        </NuxtLink>
      </div>
    </nav>
  </aside>
</template>
