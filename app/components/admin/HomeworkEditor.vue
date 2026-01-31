<script setup lang="ts">
import { Plus, Save, FileEdit, Trash2 } from 'lucide-vue-next'

interface Homework {
  id: string
  lessonId: string
  prompt: string
  allowFile: boolean
  allowText: boolean
}

interface Props {
  lessonId: string
}

const props = defineProps<Props>()
const { error: showError, success: showSuccess } = useToast()

// Fetch homework data
const { data, refresh } = await useFetch<{ homework: Homework | null }>(`/api/admin/lessons/${props.lessonId}/homework`)

const homework = computed(() => data.value?.homework)
const hasHomework = computed(() => !!homework.value)

// Form
const form = reactive({
  prompt: '',
  allowFile: true,
  allowText: true,
})

// Initialize form when homework loads
watch(homework, (h) => {
  if (h) {
    form.prompt = h.prompt
    form.allowFile = h.allowFile
    form.allowText = h.allowText
  }
}, { immediate: true })

const isCreating = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

// Create homework
async function createHomework() {
  if (!form.prompt.trim()) {
    showError('Błąd', 'Treść zadania jest wymagana')
    return
  }

  if (!form.allowFile && !form.allowText) {
    showError('Błąd', 'Musisz zezwolić na co najmniej jeden typ odpowiedzi')
    return
  }

  isCreating.value = true
  try {
    await $fetch(`/api/admin/lessons/${props.lessonId}/homework`, {
      method: 'POST',
      body: {
        prompt: form.prompt.trim(),
        allowFile: form.allowFile,
        allowText: form.allowText,
      },
    })
    showSuccess('Utworzono', 'Zadanie domowe zostało utworzone')
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się utworzyć zadania')
  } finally {
    isCreating.value = false
  }
}

// Save homework
async function saveHomework() {
  if (!form.prompt.trim()) {
    showError('Błąd', 'Treść zadania jest wymagana')
    return
  }

  if (!form.allowFile && !form.allowText) {
    showError('Błąd', 'Musisz zezwolić na co najmniej jeden typ odpowiedzi')
    return
  }

  isSaving.value = true
  try {
    await $fetch(`/api/admin/lessons/${props.lessonId}/homework`, {
      method: 'PUT',
      body: {
        prompt: form.prompt.trim(),
        allowFile: form.allowFile,
        allowText: form.allowText,
      },
    })
    showSuccess('Zapisano', 'Zadanie domowe zostało zaktualizowane')
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się zapisać zadania')
  } finally {
    isSaving.value = false
  }
}

// Delete homework
async function deleteHomework() {
  if (!confirm('Czy na pewno chcesz usunąć zadanie domowe? Ta operacja jest nieodwracalna.')) return

  isDeleting.value = true
  try {
    await $fetch(`/api/admin/lessons/${props.lessonId}/homework`, {
      method: 'DELETE',
    })
    showSuccess('Usunięto', 'Zadanie domowe zostało usunięte')
    form.prompt = ''
    form.allowFile = true
    form.allowText = true
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się usunąć zadania')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UiCard>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium text-slate-900">Zadanie domowe</h2>
      <button
        v-if="hasHomework"
        class="text-sm text-red-600 hover:text-red-700"
        :disabled="isDeleting"
        @click="deleteHomework"
      >
        {{ isDeleting ? 'Usuwanie...' : 'Usuń zadanie' }}
      </button>
    </div>

    <!-- No homework yet -->
    <div v-if="!hasHomework" class="text-center py-8">
      <FileEdit class="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p class="text-slate-500 mb-4">Ta lekcja nie ma jeszcze zadania domowego</p>
    </div>

    <!-- Form -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">
          Treść zadania
        </label>
        <textarea
          v-model="form.prompt"
          rows="4"
          class="input-base"
          placeholder="Opisz zadanie domowe dla studentów..."
        />
      </div>

      <div class="flex items-center gap-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="form.allowText"
            type="checkbox"
            class="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm text-slate-700">Zezwól na odpowiedź tekstową</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="form.allowFile"
            type="checkbox"
            class="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm text-slate-700">Zezwól na załączniki</span>
        </label>
      </div>

      <div>
        <UiButton
          v-if="hasHomework"
          variant="primary"
          :disabled="isSaving"
          @click="saveHomework"
        >
          <Save class="w-4 h-4" />
          {{ isSaving ? 'Zapisywanie...' : 'Zapisz zmiany' }}
        </UiButton>
        <UiButton
          v-else
          variant="primary"
          :disabled="isCreating || !form.prompt.trim()"
          @click="createHomework"
        >
          <Plus class="w-4 h-4" />
          {{ isCreating ? 'Tworzenie...' : 'Utwórz zadanie domowe' }}
        </UiButton>
      </div>
    </div>
  </UiCard>
</template>
