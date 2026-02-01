<script setup lang="ts">
import { TrendingUp, Users, BookOpen, GraduationCap, Activity, DollarSign } from 'lucide-vue-next'

interface Props {
  stats: {
    totalRevenue: number
    weeklyRevenue: number
    totalUsers: number
    totalCourses: number
    totalEnrollments: number
    recentEnrollments: number
    activeUsers: number
  }
}

const props = defineProps<Props>()

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
  }).format(amount / 100)
}

const cards = computed(() => [
  {
    title: 'Przychód (30 dni)',
    value: formatCurrency(props.stats.totalRevenue),
    subtitle: `${formatCurrency(props.stats.weeklyRevenue)} w ostatnim tygodniu`,
    icon: DollarSign,
    color: 'bg-green-500',
  },
  {
    title: 'Użytkownicy',
    value: props.stats.totalUsers.toLocaleString('pl-PL'),
    subtitle: `${props.stats.activeUsers} aktywnych (7 dni)`,
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Zapisanych na kursy',
    value: props.stats.totalEnrollments.toLocaleString('pl-PL'),
    subtitle: `+${props.stats.recentEnrollments} w ostatnim tygodniu`,
    icon: GraduationCap,
    color: 'bg-purple-500',
  },
  {
    title: 'Opublikowane kursy',
    value: props.stats.totalCourses.toLocaleString('pl-PL'),
    subtitle: 'Dostępne dla uczniów',
    icon: BookOpen,
    color: 'bg-amber-500',
  },
])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.title"
      class="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm text-slate-600">{{ card.title }}</p>
          <p class="text-2xl font-semibold text-slate-900 mt-1">{{ card.value }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ card.subtitle }}</p>
        </div>
        <div :class="[card.color, 'p-2 rounded-lg']">
          <component :is="card.icon" class="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  </div>
</template>
