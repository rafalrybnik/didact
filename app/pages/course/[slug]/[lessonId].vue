<script setup lang="ts">
definePageMeta({
  layout: false, // Custom layout for course player
})

const route = useRoute()
const { error: showError, success: showSuccess } = useToast()

const slug = route.params.slug as string
const lessonId = route.params.lessonId as string

// Get headers for SSR cookie forwarding
const headers = useRequestHeaders(['cookie'])

// Fetch lesson data
const { data: lessonData, error: lessonError, refresh: refreshLesson } = await useFetch(
  `/api/courses/${slug}/lessons/${lessonId}`,
  { headers }
)

// Fetch curriculum for sidebar (lazy load, don't block page)
const { data: curriculumData, refresh: refreshCurriculum } = useLazyFetch(
  `/api/courses/${slug}/curriculum`,
  { headers, server: false }
)

const lesson = computed(() => lessonData.value?.lesson)
const navigation = computed(() => lessonData.value?.navigation)
const course = computed(() => lessonData.value?.course)
const curriculum = computed(() => curriculumData.value)

// Mark lesson as complete
const isMarkingComplete = ref(false)

async function markComplete() {
  if (isMarkingComplete.value) return

  isMarkingComplete.value = true
  try {
    await $fetch(`/api/courses/${slug}/lessons/${lessonId}/complete`, {
      method: 'POST',
    })

    showSuccess('Ukończono', 'Lekcja została oznaczona jako ukończona')

    // Refresh data
    await Promise.all([refreshLesson(), refreshCurriculum()])
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się oznaczyć lekcji')
  } finally {
    isMarkingComplete.value = false
  }
}

// Mobile sidebar toggle
const showMobileSidebar = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Error state -->
    <div v-if="lessonError" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <p class="text-red-600 mb-4">{{ lessonError.data?.message || 'Nie można załadować lekcji' }}</p>
        <NuxtLink to="/" class="text-primary-600 hover:underline">Wróć do strony głównej</NuxtLink>
      </div>
    </div>

    <!-- Main layout -->
    <div v-else class="flex h-screen">
      <!-- Sidebar (desktop) -->
      <div class="hidden lg:block">
        <CourseSidebar
          v-if="curriculum && course"
          :course-slug="slug"
          :course-title="course.title"
          :modules="curriculum.modules"
          :standalone-lessons="curriculum.standaloneLessons"
          :current-lesson-id="lessonId"
          :progress="curriculum.progress"
        />
      </div>

      <!-- Mobile sidebar overlay -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showMobileSidebar"
            class="fixed inset-0 bg-black/50 z-40 lg:hidden"
            @click="showMobileSidebar = false"
          />
        </Transition>
        <Transition
          enter-active-class="transition-transform duration-200"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-200"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
        >
          <div v-if="showMobileSidebar" class="fixed inset-y-0 left-0 z-50 lg:hidden">
            <CourseSidebar
              v-if="curriculum && course"
              :course-slug="slug"
              :course-title="course.title"
              :modules="curriculum.modules"
              :standalone-lessons="curriculum.standaloneLessons"
              :current-lesson-id="lessonId"
              :progress="curriculum.progress"
            />
          </div>
        </Transition>
      </Teleport>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto">
        <!-- Mobile header -->
        <header class="lg:hidden sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 z-30">
          <button
            class="p-2 -ml-2 text-slate-600 hover:text-slate-900"
            @click="showMobileSidebar = true"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span class="font-medium truncate">{{ lesson?.title || 'Ładowanie...' }}</span>
        </header>

        <!-- Lesson content -->
        <div class="p-6 lg:p-12">
          <template v-if="lesson">
            <CourseLessonContent
              :title="lesson.title"
              :content-html="lesson.contentHtml"
              :video-url="lesson.videoUrl"
              :video-iframe="lesson.videoIframe"
            />

            <CourseLessonNavigation
              v-if="navigation"
              :course-slug="slug"
              :prev-lesson="navigation.prev"
              :next-lesson="navigation.next"
              :is-completed="lesson.isCompleted"
              :current-index="navigation.currentIndex"
              :total-lessons="navigation.totalLessons"
              @mark-complete="markComplete"
            />
          </template>

          <template v-else>
            <div class="max-w-4xl mx-auto space-y-6">
              <UiSkeleton width="60%" height="2.5rem" />
              <UiSkeleton width="100%" height="400px" />
              <UiSkeleton width="100%" height="200px" />
            </div>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>
