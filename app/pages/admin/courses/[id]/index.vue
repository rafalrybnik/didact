<script setup lang="ts">
import { ArrowLeft, Save, Eye, Settings, FileText, BookOpen } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { error: showError, success: showSuccess } = useToast()

const courseId = route.params.id as string

const { data, pending, refresh } = await useFetch(`/api/admin/courses/${courseId}`)
const course = computed(() => data.value?.course)

const activeTab = ref<'general' | 'sales' | 'curriculum'>('general')

const form = reactive({
  title: '',
  slug: '',
  description: '',
  salesDescription: '',
  thumbnailUrl: '',
  price: 0,
  currency: 'PLN',
  structureMode: 'MODULAR' as 'MODULAR' | 'FLAT' | 'FREESTYLE',
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  enforceSequential: false,
  requireAssignmentPass: false,
})

// Populate form when course loads
watch(course, (c) => {
  if (c) {
    form.title = c.title
    form.slug = c.slug
    form.description = c.description || ''
    form.salesDescription = c.salesDescription || ''
    form.thumbnailUrl = c.thumbnailUrl || ''
    form.price = c.price / 100 // Convert from cents
    form.currency = c.currency
    form.structureMode = c.structureMode
    form.status = c.status
    form.enforceSequential = c.enforceSequential
    form.requireAssignmentPass = c.requireAssignmentPass
  }
}, { immediate: true })

const isLoading = ref(false)

async function handleSave() {
  isLoading.value = true

  try {
    await $fetch(`/api/admin/courses/${courseId}`, {
      method: 'PUT',
      body: {
        ...form,
        price: Math.round(form.price * 100), // Convert to cents
      },
    })

    showSuccess('Zapisano', 'Zmiany zostały zapisane')
    refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się zapisać zmian')
  } finally {
    isLoading.value = false
  }
}

const tabs = [
  { id: 'general', label: 'Ogólne', icon: Settings },
  { id: 'sales', label: 'Sprzedaż', icon: FileText },
  { id: 'curriculum', label: 'Program', icon: BookOpen },
]
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/admin/courses" class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2">
        <ArrowLeft class="h-4 w-4" />
        Powrót do listy
      </NuxtLink>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ course?.title || 'Ładowanie...' }}
          </h1>
          <p v-if="course" class="text-sm text-slate-500 mt-1">
            /c/{{ course.slug }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink v-if="course?.status === 'PUBLISHED'" :to="`/c/${course.slug}`" target="_blank">
            <UiButton variant="secondary">
              <Eye class="h-4 w-4" />
              Podgląd
            </UiButton>
          </NuxtLink>
          <UiButton variant="primary" :loading="isLoading" @click="handleSave">
            <Save class="h-4 w-4" />
            Zapisz
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200 mb-6">
      <nav class="flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.id
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'"
          @click="activeTab = tab.id as any"
        >
          <component :is="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <template v-if="pending">
      <UiCard>
        <div class="space-y-4">
          <UiSkeleton width="100%" height="2.5rem" />
          <UiSkeleton width="100%" height="2.5rem" />
          <UiSkeleton width="100%" height="5rem" />
        </div>
      </UiCard>
    </template>

    <template v-else-if="course">
      <!-- General Tab -->
      <UiCard v-if="activeTab === 'general'" class="max-w-2xl">
        <h2 class="text-lg font-medium text-slate-900 mb-4">Ustawienia ogólne</h2>

        <form class="space-y-4" @submit.prevent="handleSave">
          <UiInput
            v-model="form.title"
            label="Tytuł kursu"
            required
          />

          <UiInput
            v-model="form.slug"
            label="Slug (URL)"
            required
          />

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Opis
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input-base"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select v-model="form.status" class="input-base">
              <option value="DRAFT">Szkic</option>
              <option value="PUBLISHED">Opublikowany</option>
              <option value="ARCHIVED">Zarchiwizowany</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Struktura kursu
            </label>
            <select v-model="form.structureMode" class="input-base">
              <option value="MODULAR">Modułowa</option>
              <option value="FLAT">Płaska</option>
              <option value="FREESTYLE">Dowolna</option>
            </select>
          </div>

          <div class="space-y-3">
            <label class="flex items-center gap-3">
              <input type="checkbox" v-model="form.enforceSequential" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <span class="text-sm text-slate-700">Wymagaj sekwencyjnego przerabiania lekcji</span>
            </label>

            <label class="flex items-center gap-3">
              <input type="checkbox" v-model="form.requireAssignmentPass" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <span class="text-sm text-slate-700">Wymagaj zaliczenia zadań przed przejściem dalej</span>
            </label>
          </div>
        </form>
      </UiCard>

      <!-- Sales Tab -->
      <UiCard v-else-if="activeTab === 'sales'" class="max-w-2xl">
        <h2 class="text-lg font-medium text-slate-900 mb-4">Ustawienia sprzedaży</h2>

        <form class="space-y-4" @submit.prevent="handleSave">
          <div class="grid grid-cols-2 gap-4">
            <UiInput
              v-model.number="form.price"
              type="number"
              label="Cena (PLN)"
              min="0"
              step="0.01"
            />

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Waluta
              </label>
              <select v-model="form.currency" class="input-base">
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <UiInput
            v-model="form.thumbnailUrl"
            label="URL miniaturki"
            placeholder="https://..."
          />

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Opis na stronie sprzedażowej
            </label>
            <textarea
              v-model="form.salesDescription"
              rows="6"
              class="input-base"
              placeholder="Tekst zachęcający do zakupu kursu..."
            />
            <p class="text-sm text-slate-500 mt-1">
              Obsługuje podstawowy HTML
            </p>
          </div>
        </form>
      </UiCard>

      <!-- Curriculum Tab -->
      <UiCard v-else-if="activeTab === 'curriculum'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-slate-900">Program kursu</h2>
        </div>

        <p class="text-slate-500 text-center py-8">
          Edytor programu kursu zostanie dodany w następnej wersji.
          <br />
          Na razie możesz zarządzać modułami i lekcjami przez API.
        </p>

        <div v-if="course.modules?.length" class="mt-6 space-y-4">
          <div v-for="module in course.modules" :key="module.id" class="border border-slate-200 rounded-lg p-4">
            <h3 class="font-medium text-slate-900 mb-2">{{ module.title }}</h3>
            <div v-if="module.lessons?.length" class="space-y-2 pl-4">
              <div v-for="lesson in module.lessons" :key="lesson.id" class="flex items-center gap-2 text-sm text-slate-600">
                <FileText class="h-4 w-4" />
                {{ lesson.title }}
              </div>
            </div>
            <p v-else class="text-sm text-slate-500 pl-4">Brak lekcji w tym module</p>
          </div>
        </div>

        <div v-if="course.lessons?.filter((l: any) => !l.moduleId)?.length" class="mt-4">
          <h3 class="font-medium text-slate-900 mb-2">Lekcje bez modułu</h3>
          <div class="space-y-2 pl-4">
            <div v-for="lesson in course.lessons.filter((l: any) => !l.moduleId)" :key="lesson.id" class="flex items-center gap-2 text-sm text-slate-600">
              <FileText class="h-4 w-4" />
              {{ lesson.title }}
            </div>
          </div>
        </div>
      </UiCard>
    </template>
  </div>
</template>
