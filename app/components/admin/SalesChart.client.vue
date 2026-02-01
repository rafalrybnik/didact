<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DailySales {
  date: string
  revenue: number
  orders: number
}

interface Props {
  data: DailySales[]
}

const props = defineProps<Props>()

const chartData = computed(() => {
  const labels = props.data.map(d => {
    const date = new Date(d.date)
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  })

  const revenueData = props.data.map(d => d.revenue / 100) // Convert from cents

  return {
    labels,
    datasets: [
      {
        label: 'Przychód (PLN)',
        data: revenueData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.raw as number
          return `Przychód: ${value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        callback: (value: number | string) => {
          if (typeof value === 'number') {
            return value.toLocaleString('pl-PL') + ' zł'
          }
          return value
        },
      },
    },
  },
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
    <h3 class="text-lg font-semibold text-slate-900 mb-4">Przychód (ostatnie 30 dni)</h3>
    <div class="h-64">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
