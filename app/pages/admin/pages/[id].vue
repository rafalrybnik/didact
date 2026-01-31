<script setup lang="ts">
import { ArrowLeft, Save, Eye } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { error: showError, success: showSuccess } = useToast()

const pageId = route.params.id as string

const { data, pending, refresh } = await useFetch(`/api/admin/pages/${pageId}`)
const page = computed(() => data.value?.page)

const form = reactive({
  title: '',
  slug: '',
  contentHtml: '',
  metaDescription: '',
  published: false,
})

// Populate form when page loads
watch(page, (p) => {
  if (p) {
    form.title = p.title
    form.slug = p.slug
    form.contentHtml = p.contentHtml || ''
    form.metaDescription = p.metaDescription || ''
    form.published = p.published
  }
}, { immediate: true })

const isLoading = ref(false)

async function handleSave() {
  isLoading.value = true

  try {
    await $fetch(`/api/admin/pages/${pageId}`, {
      method: 'PUT',
      body: form,
    })

    showSuccess('Zapisano', 'Zmiany zostały zapisane')
    refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się zapisać zmian')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/admin/pages" class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2">
        <ArrowLeft class="h-4 w-4" />
        Powrót do listy
      </NuxtLink>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ page?.title || 'Ładowanie...' }}
          </h1>
          <p v-if="page" class="text-sm text-slate-500 mt-1">
            /{{ page.slug }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink v-if="page?.published" :to="`/${page.slug}`" target="_blank">
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

    <template v-if="pending">
      <UiCard class="max-w-2xl">
        <div class="space-y-4">
          <UiSkeleton width="100%" height="2.5rem" />
          <UiSkeleton width="100%" height="2.5rem" />
          <UiSkeleton width="100%" height="10rem" />
        </div>
      </UiCard>
    </template>

    <template v-else-if="page">
      <UiCard class="max-w-2xl">
        <form @submit.prevent="handleSave" class="space-y-4">
          <UiInput
            v-model="form.title"
            label="Tytuł strony"
            required
          />

          <UiInput
            v-model="form.slug"
            label="Slug (URL)"
            required
          >
            <template #hint>
              Strona dostępna pod adresem: /{{ form.slug }}
            </template>
          </UiInput>

          <UiInput
            v-model="form.metaDescription"
            label="Opis SEO"
          />

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Treść
            </label>
            <textarea
              v-model="form.contentHtml"
              rows="15"
              class="input-base font-mono text-sm"
            />
            <p class="text-sm text-slate-500 mt-1">
              Obsługuje HTML
            </p>
          </div>

          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="form.published" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
            <span class="text-sm text-slate-700">Opublikuj stronę</span>
          </label>
        </form>
      </UiCard>
    </template>
  </div>
</template>
