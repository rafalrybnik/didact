<script setup lang="ts">
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-vue-next'

interface NavLesson {
  id: string
  title: string
}

interface Props {
  courseSlug: string
  prevLesson?: NavLesson | null
  nextLesson?: NavLesson | null
  isCompleted: boolean
  currentIndex: number
  totalLessons: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  markComplete: []
}>()
</script>

<template>
  <div class="border-t border-slate-200 pt-6 mt-8">
    <!-- Complete button -->
    <div v-if="!isCompleted" class="flex justify-center mb-6">
      <UiButton variant="primary" size="lg" @click="emit('markComplete')">
        <CheckCircle class="h-5 w-5" />
        Oznacz jako ukończoną
      </UiButton>
    </div>
    <div v-else class="flex justify-center mb-6">
      <div class="flex items-center gap-2 text-green-600 font-medium">
        <CheckCircle class="h-5 w-5" />
        Lekcja ukończona
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink
          v-if="prevLesson"
          :to="`/course/${courseSlug}/${prevLesson.id}`"
          class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft class="h-5 w-5" />
          <div class="text-left">
            <div class="text-xs text-slate-400">Poprzednia</div>
            <div class="text-sm font-medium">{{ prevLesson.title }}</div>
          </div>
        </NuxtLink>
      </div>

      <div class="text-sm text-slate-500">
        {{ currentIndex }} / {{ totalLessons }}
      </div>

      <div>
        <NuxtLink
          v-if="nextLesson"
          :to="`/course/${courseSlug}/${nextLesson.id}`"
          class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <div class="text-right">
            <div class="text-xs text-slate-400">Następna</div>
            <div class="text-sm font-medium">{{ nextLesson.title }}</div>
          </div>
          <ArrowRight class="h-5 w-5" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
