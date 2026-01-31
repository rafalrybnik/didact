<script setup lang="ts">
import { Plus, FileText, Pencil, Trash2, Eye } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

const { data, pending, refresh } = await useFetch('/api/admin/pages')
const { error: showError, success: showSuccess } = useToast()

const pages = computed(() => data.value?.pages ?? [])

const columns = [
  { key: 'title', label: 'Tytuł' },
  { key: 'slug', label: 'URL' },
  { key: 'published', label: 'Status' },
  { key: 'updatedAt', label: 'Ostatnia zmiana' },
  { key: 'actions', label: '' },
]

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const deletingId = ref<string | null>(null)

async function deletePage(id: string, title: string) {
  if (!confirm(`Czy na pewno chcesz usunąć stronę "${title}"?`)) {
    return
  }

  deletingId.value = id
  try {
    await $fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
    showSuccess('Usunięto', 'Strona została usunięta')
    refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się usunąć strony')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-slate-900">
        Strony
      </h1>
      <NuxtLink to="/admin/pages/new">
        <UiButton variant="primary">
          <Plus class="h-4 w-4" />
          Nowa strona
        </UiButton>
      </NuxtLink>
    </div>

    <AdminDataTable
      :columns="columns"
      :data="pages"
      :loading="pending"
      @row-click="(row) => navigateTo(`/admin/pages/${row.id}`)"
    >
      <template #cell-title="{ row }">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-slate-100 rounded-lg">
            <FileText class="h-4 w-4 text-slate-600" />
          </div>
          <span class="font-medium text-slate-900">{{ row.title }}</span>
        </div>
      </template>

      <template #cell-slug="{ row }">
        <span class="text-slate-500">/{{ row.slug }}</span>
      </template>

      <template #cell-published="{ row }">
        <UiBadge :variant="row.published ? 'success' : 'default'">
          {{ row.published ? 'Opublikowana' : 'Szkic' }}
        </UiBadge>
      </template>

      <template #cell-updatedAt="{ row }">
        <span class="text-slate-500">{{ formatDate(row.updatedAt) }}</span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2" @click.stop>
          <NuxtLink :to="`/admin/pages/${row.id}`">
            <UiButton variant="ghost" size="sm">
              <Pencil class="h-4 w-4" />
            </UiButton>
          </NuxtLink>
          <NuxtLink v-if="row.published" :to="`/${row.slug}`" target="_blank">
            <UiButton variant="ghost" size="sm">
              <Eye class="h-4 w-4" />
            </UiButton>
          </NuxtLink>
          <UiButton
            variant="ghost"
            size="sm"
            :loading="deletingId === row.id"
            @click="deletePage(row.id, row.title)"
          >
            <Trash2 class="h-4 w-4 text-red-500" />
          </UiButton>
        </div>
      </template>
    </AdminDataTable>
  </div>
</template>
