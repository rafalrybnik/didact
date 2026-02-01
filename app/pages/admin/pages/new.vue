<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

const { error: showError, success: showSuccess } = useToast()
const router = useRouter()

const form = reactive({
  title: '',
  slug: '',
  contentHtml: '',
  metaDescription: '',
  published: false,
})

const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

// Auto-generate slug from title
watch(() => form.title, (title) => {
  form.slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
})

async function handleSubmit() {
  errors.value = {}

  if (!form.title.trim()) {
    errors.value.title = 'Tytuł jest wymagany'
    return
  }

  if (!form.slug.trim()) {
    errors.value.slug = 'Slug jest wymagany'
    return
  }

  isLoading.value = true

  try {
    const { page } = await $fetch<{ page: { id: string } }>('/api/admin/pages', {
      method: 'POST',
      body: form,
    })

    showSuccess('Utworzono', 'Strona została utworzona')
    router.push(`/admin/pages/${page.id}`)
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się utworzyć strony')
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
      <h1 class="text-2xl font-semibold text-slate-900">
        Nowa strona
      </h1>
    </div>

    <UiCard class="max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UiInput
          v-model="form.title"
          label="Tytuł strony"
          placeholder="np. O nas"
          required
          :error="errors.title"
        />

        <UiInput
          v-model="form.slug"
          label="Slug (URL)"
          placeholder="o-nas"
          required
          :error="errors.slug"
        >
          <template #hint>
            Strona będzie dostępna pod adresem: /{{ form.slug || 'slug' }}
          </template>
        </UiInput>

        <UiInput
          v-model="form.metaDescription"
          label="Opis SEO"
          placeholder="Krótki opis dla wyszukiwarek..."
        />

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Treść
          </label>
          <AdminRichTextEditor
            v-model="form.contentHtml"
            placeholder="Treść strony..."
          />
        </div>

        <label class="flex items-center gap-3">
          <input type="checkbox" v-model="form.published" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-sm text-slate-700">Opublikuj stronę</span>
        </label>

        <div class="flex gap-3 pt-4">
          <UiButton type="submit" variant="primary" :loading="isLoading" :disabled="isLoading">
            Utwórz stronę
          </UiButton>
          <NuxtLink to="/admin/pages">
            <UiButton type="button" variant="secondary">
              Anuluj
            </UiButton>
          </NuxtLink>
        </div>
      </form>
    </UiCard>
  </div>
</template>
