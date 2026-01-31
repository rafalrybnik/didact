<script setup lang="ts">
import { Upload, X, Image as ImageIcon } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  label?: string
  accept?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/jpeg,image/png,image/gif,image/webp',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { error: showError } = useToast()

const isUploading = ref(false)
const isDragging = ref(false)
const inputRef = ref<HTMLInputElement>()

const previewUrl = computed(() => props.modelValue || '')

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false

  const file = e.dataTransfer?.files[0]
  if (file) {
    uploadFile(file)
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

async function uploadFile(file: File) {
  // Validate file type
  const allowedTypes = props.accept.split(',')
  if (!allowedTypes.includes(file.type)) {
    showError('Błąd', 'Nieprawidłowy format pliku')
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError('Błąd', 'Plik jest za duży (max 5MB)')
    return
  }

  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await $fetch<{ url: string }>('/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    emit('update:modelValue', response.url)
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się przesłać pliku')
  } finally {
    isUploading.value = false
    // Reset input
    if (inputRef.value) {
      inputRef.value.value = ''
    }
  }
}

function clearImage() {
  emit('update:modelValue', '')
}

function openFilePicker() {
  inputRef.value?.click()
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-slate-700 mb-1">
      {{ label }}
    </label>

    <!-- Preview with image -->
    <div v-if="previewUrl" class="relative group">
      <img
        :src="previewUrl"
        alt="Preview"
        class="w-full h-48 object-cover rounded-lg border border-slate-200"
      />
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
        <button
          type="button"
          class="p-2 bg-white rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
          @click="openFilePicker"
        >
          <Upload class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
          @click="clearImage"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Upload area -->
    <div
      v-else
      class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
      :class="[
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-slate-400',
        isUploading ? 'opacity-50 pointer-events-none' : '',
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="openFilePicker"
    >
      <div v-if="isUploading" class="flex flex-col items-center gap-2">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
        <span class="text-sm text-slate-600">Przesyłanie...</span>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <ImageIcon class="h-10 w-10 text-slate-400" />
        <div class="text-sm text-slate-600">
          <span class="text-primary-600 font-medium">Kliknij</span>
          lub przeciągnij plik
        </div>
        <span class="text-xs text-slate-400">PNG, JPG, GIF, WebP do 5MB</span>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>
