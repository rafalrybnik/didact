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
  description: '',
  price: 0,
  currency: 'PLN',
  structureMode: 'MODULAR' as 'MODULAR' | 'FLAT' | 'FREESTYLE',
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
    const { course } = await $fetch<{ course: { id: string } }>('/api/admin/courses', {
      method: 'POST',
      body: {
        ...form,
        price: Math.round(form.price * 100), // Convert to cents
      },
    })

    showSuccess('Utworzono', 'Kurs został utworzony')
    router.push(`/admin/courses/${course.id}`)
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się utworzyć kursu')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/admin/courses" class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2">
        <ArrowLeft class="h-4 w-4" />
        Powrót do listy
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-slate-900">
        Nowy kurs
      </h1>
    </div>

    <UiCard class="max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UiInput
          v-model="form.title"
          label="Tytuł kursu"
          placeholder="np. Podstawy programowania w Python"
          required
          :error="errors.title"
        />

        <UiInput
          v-model="form.slug"
          label="Slug (URL)"
          placeholder="podstawy-python"
          required
          :error="errors.slug"
        >
          <template #hint>
            Kurs będzie dostępny pod adresem: /c/{{ form.slug || 'slug' }}
          </template>
        </UiInput>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Opis
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="input-base"
            placeholder="Krótki opis kursu..."
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UiInput
            v-model.number="form.price"
            type="number"
            label="Cena (PLN)"
            placeholder="0"
            min="0"
            step="0.01"
          >
            <template #hint>
              Zostaw 0 dla darmowego kursu
            </template>
          </UiInput>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Struktura kursu
            </label>
            <select v-model="form.structureMode" class="input-base">
              <option value="MODULAR">Modułowa (moduły i lekcje)</option>
              <option value="FLAT">Płaska (tylko lekcje)</option>
              <option value="FREESTYLE">Dowolna (mieszana)</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <UiButton type="submit" variant="primary" :loading="isLoading" :disabled="isLoading">
            Utwórz kurs
          </UiButton>
          <NuxtLink to="/admin/courses">
            <UiButton type="button" variant="secondary">
              Anuluj
            </UiButton>
          </NuxtLink>
        </div>
      </form>
    </UiCard>
  </div>
</template>
