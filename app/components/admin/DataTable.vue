<script setup lang="ts">
interface Column {
  key: string
  label: string
  sortable?: boolean
}

defineProps<{
  columns: Column[]
  data: Record<string, unknown>[]
  loading?: boolean
}>()

defineEmits<{
  (e: 'row-click', row: Record<string, unknown>): void
}>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-card border border-slate-200/60 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <template v-if="loading">
            <tr v-for="i in 5" :key="i">
              <td v-for="column in columns" :key="column.key" class="px-6 py-4">
                <UiSkeleton class="h-4 w-24" />
              </td>
            </tr>
          </template>
          <template v-else-if="data.length === 0">
            <tr>
              <td :colspan="columns.length" class="px-6 py-8 text-center text-slate-500">
                Brak danych do wyświetlenia
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="(row, index) in data"
              :key="index"
              class="hover:bg-slate-50 cursor-pointer transition-colors duration-150"
              @click="$emit('row-click', row)"
            >
              <td v-for="column in columns" :key="column.key" class="px-6 py-4 text-sm text-slate-900">
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
