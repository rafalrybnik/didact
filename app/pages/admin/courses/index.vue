<script setup lang="ts">
import { Plus, BookOpen, MoreVertical, Pencil, Trash2, Eye } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

const { data, pending, refresh } = await useFetch('/api/admin/courses')
const { error: showError, success: showSuccess } = useToast()

const courses = computed(() => data.value?.courses ?? [])

const columns = [
  { key: 'title', label: 'Tytuł' },
  { key: 'status', label: 'Status' },
  { key: 'lessons', label: 'Lekcje' },
  { key: 'students', label: 'Studenci' },
  { key: 'price', label: 'Cena' },
  { key: 'actions', label: '' },
]

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(price / 100)
}

const deletingId = ref<string | null>(null)

async function deleteCourse(id: string, title: string) {
  if (!confirm(`Czy na pewno chcesz usunąć kurs "${title}"? Ta operacja jest nieodwracalna.`)) {
    return
  }

  deletingId.value = id
  try {
    await $fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    showSuccess('Usunięto', 'Kurs został usunięty')
    refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się usunąć kursu')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-slate-900">
        Kursy
      </h1>
      <NuxtLink to="/admin/courses/new">
        <UiButton variant="primary">
          <Plus class="h-4 w-4" />
          Nowy kurs
        </UiButton>
      </NuxtLink>
    </div>

    <AdminDataTable
      :columns="columns"
      :data="courses"
      :loading="pending"
      @row-click="(row) => navigateTo(`/admin/courses/${row.id}`)"
    >
      <template #cell-title="{ row }">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-slate-100 rounded-lg">
            <BookOpen class="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p class="font-medium text-slate-900">{{ row.title }}</p>
            <p class="text-sm text-slate-500">/c/{{ row.slug }}</p>
          </div>
        </div>
      </template>

      <template #cell-status="{ row }">
        <UiBadge :variant="row.status === 'PUBLISHED' ? 'success' : row.status === 'ARCHIVED' ? 'warning' : 'default'">
          {{ row.status === 'PUBLISHED' ? 'Opublikowany' : row.status === 'ARCHIVED' ? 'Zarchiwizowany' : 'Szkic' }}
        </UiBadge>
      </template>

      <template #cell-lessons="{ row }">
        {{ row._count?.lessons ?? 0 }}
      </template>

      <template #cell-students="{ row }">
        {{ row._count?.enrollments ?? 0 }}
      </template>

      <template #cell-price="{ row }">
        <span v-if="row.price > 0">{{ formatPrice(row.price, row.currency) }}</span>
        <span v-else class="text-slate-500">Darmowy</span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2" @click.stop>
          <NuxtLink :to="`/admin/courses/${row.id}`">
            <UiButton variant="ghost" size="sm">
              <Pencil class="h-4 w-4" />
            </UiButton>
          </NuxtLink>
          <NuxtLink v-if="row.status === 'PUBLISHED'" :to="`/c/${row.slug}`" target="_blank">
            <UiButton variant="ghost" size="sm">
              <Eye class="h-4 w-4" />
            </UiButton>
          </NuxtLink>
          <UiButton
            variant="ghost"
            size="sm"
            :loading="deletingId === row.id"
            @click="deleteCourse(row.id, row.title)"
          >
            <Trash2 class="h-4 w-4 text-red-500" />
          </UiButton>
        </div>
      </template>
    </AdminDataTable>
  </div>
</template>
