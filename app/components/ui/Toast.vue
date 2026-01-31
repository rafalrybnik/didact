<script setup lang="ts">
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

interface Props {
  id: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  message: '',
})

const emit = defineEmits<{
  close: [id: string]
}>()

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const iconClasses = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-primary-500',
}

const bgClasses = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-primary-50 border-primary-200',
}
</script>

<template>
  <div
    :class="[
      'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
      'animate-in slide-in-from-right fade-in duration-300',
      bgClasses[type],
    ]"
  >
    <component
      :is="icons[type]"
      :class="['h-5 w-5 flex-shrink-0', iconClasses[type]]"
    />
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-slate-900">
        {{ title }}
      </p>
      <p v-if="message" class="mt-1 text-sm text-slate-600">
        {{ message }}
      </p>
    </div>
    <button
      type="button"
      class="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      @click="emit('close', id)"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
