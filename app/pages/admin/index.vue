<script setup lang="ts">
import { BookOpen, Users, ShoppingCart, TrendingUp } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

// Placeholder stats - will be populated in Phase 2
const stats = [
  { name: 'Kursy', value: '0', icon: BookOpen, change: '+0%' },
  { name: 'Użytkownicy', value: '0', icon: Users, change: '+0%' },
  { name: 'Zamówienia', value: '0', icon: ShoppingCart, change: '+0%' },
  { name: 'Przychód', value: '0 PLN', icon: TrendingUp, change: '+0%' },
]
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900 mb-6">
      Dashboard
    </h1>

    <!-- Stats Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <UiCard v-for="stat in stats" :key="stat.name">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-primary-50">
            <component :is="stat.icon" class="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p class="text-sm text-slate-500">{{ stat.name }}</p>
            <p class="text-2xl font-semibold text-slate-900">{{ stat.value }}</p>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Placeholder for recent activity -->
    <UiCard>
      <h2 class="text-lg font-medium text-slate-900 mb-4">
        Ostatnia aktywność
      </h2>
      <div class="space-y-3">
        <div v-for="i in 3" :key="i" class="flex items-center gap-4">
          <UiSkeleton width="2.5rem" height="2.5rem" rounded="full" />
          <div class="flex-1">
            <UiSkeleton width="60%" height="1rem" class="mb-1" />
            <UiSkeleton width="40%" height="0.75rem" />
          </div>
        </div>
      </div>
      <p class="text-center text-slate-500 mt-4">
        Brak aktywności do wyświetlenia
      </p>
    </UiCard>
  </div>
</template>
