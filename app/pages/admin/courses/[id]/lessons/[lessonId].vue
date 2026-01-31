<script setup lang="ts">
import { ArrowLeft, Save, Play, FileText } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { error: showError, success: showSuccess } = useToast()

const courseId = route.params.id as string
const lessonId = route.params.lessonId as string

const { data, pending, refresh } = await useFetch(`/api/admin/lessons/${lessonId}`)
const lesson = computed(() => data.value?.lesson)

// Also fetch course for module selection
const { data: courseData } = await useFetch(`/api/admin/courses/${courseId}`)
const course = computed(() => courseData.value?.course)
const modules = computed(() => course.value?.modules || [])

const form = reactive({
  title: '',
  contentHtml: '',
  videoUrl: '',
  videoIframe: '',
  moduleId: null as string | null,
})

// Populate form when lesson loads
watch(lesson, (l) => {
  if (l) {
    form.title = l.title
    form.contentHtml = l.contentHtml || ''
    form.videoUrl = l.videoUrl || ''
    form.videoIframe = l.videoIframe || ''
    form.moduleId = l.moduleId || null
  }
}, { immediate: true })

const isLoading = ref(false)

async function handleSave() {
  if (!form.title.trim()) {
    showError('Błąd', 'Tytuł jest wymagany')
    return
  }

  isLoading.value = true

  try {
    await $fetch(`/api/admin/lessons/${lessonId}`, {
      method: 'PUT',
      body: form,
    })

    showSuccess('Zapisano', 'Lekcja została zaktualizowana')
    refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się zapisać lekcji')
  } finally {
    isLoading.value = false
  }
}

// Generate iframe from YouTube/Vimeo URL
const generatedIframe = computed(() => {
  if (!form.videoUrl) return ''

  // YouTube
  const youtubeMatch = form.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (youtubeMatch) {
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  }

  // Vimeo
  const vimeoMatch = form.videoUrl.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
  }

  return ''
})

function useGeneratedIframe() {
  if (generatedIframe.value) {
    form.videoIframe = generatedIframe.value
  }
}

// Preview video
const showPreview = ref(false)
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink
        :to="`/admin/courses/${courseId}`"
        class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2"
      >
        <ArrowLeft class="h-4 w-4" />
        Powrót do kursu
      </NuxtLink>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ lesson?.title || 'Ładowanie...' }}
          </h1>
          <p v-if="course" class="text-sm text-slate-500 mt-1">
            {{ course.title }}
          </p>
        </div>

        <UiButton variant="primary" :loading="isLoading" @click="handleSave">
          <Save class="h-4 w-4" />
          Zapisz
        </UiButton>
      </div>
    </div>

    <template v-if="pending">
      <UiCard class="max-w-3xl">
        <div class="space-y-4">
          <UiSkeleton width="100%" height="2.5rem" />
          <UiSkeleton width="100%" height="2.5rem" />
          <UiSkeleton width="100%" height="10rem" />
        </div>
      </UiCard>
    </template>

    <template v-else-if="lesson">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic info -->
          <UiCard>
            <h2 class="text-lg font-medium text-slate-900 mb-4">Informacje podstawowe</h2>

            <div class="space-y-4">
              <UiInput
                v-model="form.title"
                label="Tytuł lekcji"
                required
              />

              <div v-if="modules.length > 0">
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  Moduł
                </label>
                <select v-model="form.moduleId" class="input-base">
                  <option :value="null">Bez modułu</option>
                  <option v-for="module in modules" :key="module.id" :value="module.id">
                    {{ module.title }}
                  </option>
                </select>
              </div>
            </div>
          </UiCard>

          <!-- Video -->
          <UiCard>
            <h2 class="text-lg font-medium text-slate-900 mb-4">Video</h2>

            <div class="space-y-4">
              <div>
                <UiInput
                  v-model="form.videoUrl"
                  label="URL video (YouTube/Vimeo)"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <div v-if="generatedIframe" class="mt-2">
                  <button
                    type="button"
                    class="text-sm text-primary-600 hover:text-primary-700"
                    @click="useGeneratedIframe"
                  >
                    Użyj wygenerowanego iframe
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  Kod iframe (opcjonalnie)
                </label>
                <textarea
                  v-model="form.videoIframe"
                  rows="4"
                  class="input-base font-mono text-sm"
                  placeholder='<iframe src="..." ...></iframe>'
                />
                <p class="text-sm text-slate-500 mt-1">
                  Własny kod iframe dla niestandardowych playerów
                </p>
              </div>

              <!-- Video preview -->
              <div v-if="form.videoIframe" class="mt-4">
                <button
                  type="button"
                  class="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2"
                  @click="showPreview = !showPreview"
                >
                  <Play class="h-4 w-4" />
                  {{ showPreview ? 'Ukryj podgląd' : 'Pokaż podgląd' }}
                </button>
                <div
                  v-if="showPreview"
                  class="aspect-video bg-slate-100 rounded-lg overflow-hidden"
                  v-html="form.videoIframe"
                />
              </div>
            </div>
          </UiCard>

          <!-- Content -->
          <UiCard>
            <h2 class="text-lg font-medium text-slate-900 mb-4">Treść lekcji</h2>

            <div>
              <textarea
                v-model="form.contentHtml"
                rows="15"
                class="input-base font-mono text-sm"
                placeholder="<p>Treść lekcji...</p>"
              />
              <p class="text-sm text-slate-500 mt-1">
                Obsługuje HTML. W przyszłości zostanie dodany edytor WYSIWYG.
              </p>
            </div>
          </UiCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <UiCard>
            <h3 class="text-sm font-medium text-slate-700 mb-3">Status</h3>
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <FileText class="h-4 w-4" />
              <span>Utworzono: {{ new Date(lesson.createdAt).toLocaleDateString('pl-PL') }}</span>
            </div>
          </UiCard>

          <UiCard>
            <h3 class="text-sm font-medium text-slate-700 mb-3">Wskazówki</h3>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Używaj YouTube lub Vimeo do hostowania video</li>
              <li>• Treść HTML powinna być czytelna i dobrze sformatowana</li>
              <li>• Możesz używać nagłówków, list i obrazów</li>
            </ul>
          </UiCard>
        </div>
      </div>
    </template>
  </div>
</template>
