<script setup lang="ts">
import { ArrowLeft, Save, Play, FileText, Video, ChevronDown, ChevronUp, Clock } from 'lucide-vue-next'

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
  dripDays: null as number | null,
})

// Populate form when lesson loads
watch(lesson, (l) => {
  if (l) {
    form.title = l.title
    form.contentHtml = l.contentHtml || ''
    form.videoUrl = l.videoUrl || ''
    form.videoIframe = l.videoIframe || ''
    form.moduleId = l.moduleId || null
    form.dripDays = l.dripDays ?? null
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

// Video panel expanded state
const videoExpanded = ref(true)
const hasVideo = computed(() => form.videoUrl || form.videoIframe)

// Preview video
const showPreview = ref(false)
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex-shrink-0 mb-4">
      <NuxtLink
        :to="`/admin/courses/${courseId}`"
        class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2"
      >
        <ArrowLeft class="h-4 w-4" />
        Powrót do kursu
      </NuxtLink>

      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p v-if="course" class="text-sm text-slate-500">
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
      <UiCard class="flex-1">
        <div class="space-y-4">
          <UiSkeleton width="60%" height="2.5rem" />
          <UiSkeleton width="100%" height="400px" />
        </div>
      </UiCard>
    </template>

    <template v-else-if="lesson">
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <!-- Main content - Editor focused -->
        <div class="lg:col-span-3 flex flex-col min-h-0">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <!-- Document header - like Google Docs -->
            <div class="border-b border-slate-200 px-6 py-4">
              <input
                v-model="form.title"
                type="text"
                placeholder="Tytuł lekcji..."
                class="w-full text-2xl font-semibold text-slate-900 placeholder-slate-400 border-0 p-0 focus:outline-none focus:ring-0"
              />
              <div v-if="modules.length > 0" class="mt-2">
                <select v-model="form.moduleId" class="text-sm border-0 p-0 text-slate-500 focus:outline-none focus:ring-0 cursor-pointer hover:text-slate-700">
                  <option :value="null">Bez modułu</option>
                  <option v-for="module in modules" :key="module.id" :value="module.id">
                    {{ module.title }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Editor area - main focus -->
            <div class="flex-1 overflow-auto">
              <div class="p-6">
                <ClientOnly>
                  <AdminRichTextEditor
                    v-model="form.contentHtml"
                    placeholder="Zacznij pisać treść lekcji..."
                    min-height="min-h-[500px]"
                  />
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4 overflow-y-auto">
          <!-- Video Panel -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              @click="videoExpanded = !videoExpanded"
            >
              <div class="flex items-center gap-2">
                <Video class="h-4 w-4 text-slate-500" />
                <span class="font-medium text-slate-900">Video</span>
                <span v-if="hasVideo" class="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <component :is="videoExpanded ? ChevronUp : ChevronDown" class="h-4 w-4 text-slate-400" />
            </button>

            <div v-show="videoExpanded" class="px-4 pb-4 space-y-4 border-t border-slate-100">
              <!-- Tips -->
              <div class="pt-3 pb-2 text-xs text-slate-500 bg-slate-50 -mx-4 px-4 border-b border-slate-100">
                <p class="mb-1">Używaj <strong>YouTube</strong> lub <strong>Vimeo</strong> do hostowania video.</p>
                <p>Wklej link, a iframe zostanie wygenerowany automatycznie.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  URL video
                </label>
                <input
                  v-model="form.videoUrl"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  class="input-base text-sm"
                />
                <button
                  v-if="generatedIframe"
                  type="button"
                  class="mt-1.5 text-xs text-primary-600 hover:text-primary-700"
                  @click="useGeneratedIframe"
                >
                  Użyj wygenerowanego iframe
                </button>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  Kod iframe
                  <span class="text-slate-400 font-normal">(opcjonalnie)</span>
                </label>
                <textarea
                  v-model="form.videoIframe"
                  rows="3"
                  class="input-base font-mono text-xs"
                  placeholder='<iframe src="..." ...></iframe>'
                />
              </div>

              <!-- Video preview -->
              <div v-if="form.videoIframe">
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                  @click="showPreview = !showPreview"
                >
                  <Play class="h-3 w-3" />
                  {{ showPreview ? 'Ukryj podgląd' : 'Pokaż podgląd' }}
                </button>
                <div
                  v-if="showPreview"
                  class="mt-2 aspect-video bg-slate-100 rounded-lg overflow-hidden"
                  v-html="form.videoIframe"
                />
              </div>
            </div>
          </div>

          <!-- Drip Content Panel -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3">
            <div class="flex items-center gap-2 mb-3">
              <Clock class="h-4 w-4 text-slate-500" />
              <span class="font-medium text-slate-900">Drip content</span>
            </div>
            <div class="space-y-2">
              <label class="block text-sm text-slate-600">
                Udostępnij po
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="form.dripDays"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="input-base w-20 text-center text-sm"
                />
                <span class="text-sm text-slate-600">dniach od zapisania</span>
              </div>
              <p class="text-xs text-slate-500">
                Zostaw puste lub 0, aby udostępnić od razu.
              </p>
            </div>
          </div>

          <!-- Attachments Editor -->
          <AdminAttachmentsEditor :lesson-id="lessonId" />

          <!-- Quiz Editor -->
          <AdminQuizEditor :lesson-id="lessonId" />

          <!-- Homework Editor -->
          <AdminHomeworkEditor :lesson-id="lessonId" />

          <!-- Status info -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3">
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <FileText class="h-3 w-3" />
              <span>Utworzono: {{ new Date(lesson.createdAt).toLocaleDateString('pl-PL') }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
