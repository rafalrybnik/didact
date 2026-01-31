<script setup lang="ts">
interface Lesson {
  id?: string
  title: string
  moduleId?: string | null
}

interface Module {
  id: string
  title: string
}

interface Props {
  lesson?: Lesson
  modules?: Module[]
  defaultModuleId?: string | null
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: { title: string; moduleId: string | null }]
  cancel: []
}>()

const form = reactive({
  title: props.lesson?.title || '',
  moduleId: props.lesson?.moduleId ?? props.defaultModuleId ?? null,
})

watch(() => props.lesson, (l) => {
  if (l) {
    form.title = l.title
    form.moduleId = l.moduleId ?? null
  } else {
    form.title = ''
    form.moduleId = props.defaultModuleId ?? null
  }
}, { immediate: true })

function handleSubmit() {
  if (!form.title.trim()) return
  emit('submit', {
    title: form.title.trim(),
    moduleId: form.moduleId || null,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <UiInput
      v-model="form.title"
      label="Tytuł lekcji"
      placeholder="np. Pierwszy krok"
      required
      autofocus
    />

    <div v-if="modules && modules.length > 0">
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

    <div class="flex justify-end gap-3">
      <UiButton type="button" variant="secondary" @click="emit('cancel')">
        Anuluj
      </UiButton>
      <UiButton type="submit" variant="primary" :loading="loading" :disabled="!form.title.trim()">
        {{ lesson?.id ? 'Zapisz' : 'Dodaj lekcję' }}
      </UiButton>
    </div>
  </form>
</template>
