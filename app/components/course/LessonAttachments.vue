<script setup lang="ts">
import { Download, File, FileText } from 'lucide-vue-next'

interface Attachment {
  name: string
  url: string
  size: number
  type: string
}

defineProps<{
  attachments: Attachment[]
}>()

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.includes('pdf')) return FileText
  return File
}
</script>

<template>
  <div class="max-w-4xl mx-auto mt-8">
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Download class="h-5 w-5 text-primary-600" />
        Materiały do pobrania
      </h3>

      <div class="grid gap-3 sm:grid-cols-2">
        <a
          v-for="(attachment, index) in attachments"
          :key="index"
          :href="attachment.url"
          download
          target="_blank"
          class="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
        >
          <div class="p-2 bg-white rounded-lg shadow-sm">
            <component :is="getFileIcon(attachment.type)" class="h-5 w-5 text-primary-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900 truncate group-hover:text-primary-600 transition-colors">
              {{ attachment.name }}
            </p>
            <p class="text-sm text-slate-500">
              {{ formatFileSize(attachment.size) }}
            </p>
          </div>
          <Download class="h-5 w-5 text-slate-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
        </a>
      </div>
    </div>
  </div>
</template>
