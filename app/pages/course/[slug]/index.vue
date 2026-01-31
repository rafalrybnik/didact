<script setup lang="ts">
definePageMeta({
  layout: 'app',
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

// Get headers for SSR cookie forwarding
const headers = useRequestHeaders(['cookie'])

// Fetch curriculum to find first lesson
const { data, error } = await useFetch(`/api/courses/${slug}/curriculum`, { headers })

// Redirect to first lesson
if (data.value) {
  let firstLessonId: string | null = null

  // Check modules first
  if (data.value.modules?.length > 0) {
    const firstModule = data.value.modules[0]
    if (firstModule.lessons?.length > 0) {
      firstLessonId = firstModule.lessons[0].id
    }
  }

  // Check standalone lessons
  if (!firstLessonId && data.value.standaloneLessons?.length > 0) {
    firstLessonId = data.value.standaloneLessons[0].id
  }

  if (firstLessonId) {
    await navigateTo(`/course/${slug}/${firstLessonId}`, { replace: true })
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div v-if="error" class="text-center">
      <p class="text-red-600 mb-4">{{ error.data?.message || 'Nie można załadować kursu' }}</p>
      <NuxtLink to="/" class="text-primary-600 hover:underline">Wróć do strony głównej</NuxtLink>
    </div>
    <div v-else class="text-center">
      <UiSkeleton width="200px" height="24px" class="mx-auto mb-4" />
      <p class="text-slate-500">Ładowanie kursu...</p>
    </div>
  </div>
</template>
