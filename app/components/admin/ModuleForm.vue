<script setup lang="ts">
interface Module {
  id?: string
  title: string
}

interface Props {
  module?: Module
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: { title: string }]
  cancel: []
}>()

const form = reactive({
  title: props.module?.title || '',
})

watch(() => props.module, (m) => {
  if (m) {
    form.title = m.title
  } else {
    form.title = ''
  }
}, { immediate: true })

function handleSubmit() {
  if (!form.title.trim()) return
  emit('submit', { title: form.title.trim() })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <UiInput
      v-model="form.title"
      label="Nazwa modułu"
      placeholder="np. Wprowadzenie do kursu"
      required
      autofocus
    />

    <div class="flex justify-end gap-3">
      <UiButton type="button" variant="secondary" @click="emit('cancel')">
        Anuluj
      </UiButton>
      <UiButton type="submit" variant="primary" :loading="loading" :disabled="!form.title.trim()">
        {{ module?.id ? 'Zapisz' : 'Dodaj moduł' }}
      </UiButton>
    </div>
  </form>
</template>
