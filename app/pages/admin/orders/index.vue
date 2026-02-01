<script setup lang="ts">
import { ShoppingCart, CheckCircle, Clock, XCircle, RefreshCw, FileText, ChevronDown, ChevronUp } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

interface InvoiceData {
  name?: string
  address?: string
  nip?: string
}

interface Order {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  createdAt: string
  invoiceData: InvoiceData | null
  user: {
    id: string
    name: string | null
    email: string
  }
  course: {
    id: string
    title: string
    slug: string
  }
}

const { data, pending, error } = await useFetch<{ orders: Order[] }>('/api/admin/orders')

const orders = computed(() => data.value?.orders || [])

function formatPrice(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  })
  return formatter.format(amount / 100)
}

const statusInfo = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return { icon: CheckCircle, label: 'Opłacone', color: 'text-green-600', bg: 'bg-green-100' }
    case 'PENDING':
      return { icon: Clock, label: 'Oczekuje', color: 'text-amber-600', bg: 'bg-amber-100' }
    case 'FAILED':
      return { icon: XCircle, label: 'Nieudane', color: 'text-red-600', bg: 'bg-red-100' }
    case 'REFUNDED':
      return { icon: RefreshCw, label: 'Zwrócone', color: 'text-slate-600', bg: 'bg-slate-100' }
    default:
      return { icon: Clock, label: status, color: 'text-slate-600', bg: 'bg-slate-100' }
  }
}

const totalRevenue = computed(() => {
  return orders.value
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.amount, 0)
})

const completedCount = computed(() => orders.value.filter(o => o.status === 'COMPLETED').length)

// Expanded rows for invoice data
const expandedOrders = ref<Set<string>>(new Set())

function toggleOrder(orderId: string) {
  const newSet = new Set(expandedOrders.value)
  if (newSet.has(orderId)) {
    newSet.delete(orderId)
  } else {
    newSet.add(orderId)
  }
  expandedOrders.value = newSet
}

function hasInvoiceData(order: Order): boolean {
  return !!(order.invoiceData && (order.invoiceData.name || order.invoiceData.address || order.invoiceData.nip))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Zamówienia</h1>
      <p class="text-slate-500 mt-1">Historia płatności i zamówień</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiCard>
        <p class="text-sm text-slate-500">Łączny przychód</p>
        <p class="text-2xl font-bold text-slate-900">{{ formatPrice(totalRevenue, 'PLN') }}</p>
      </UiCard>
      <UiCard>
        <p class="text-sm text-slate-500">Liczba zamówień</p>
        <p class="text-2xl font-bold text-slate-900">{{ orders.length }}</p>
      </UiCard>
      <UiCard>
        <p class="text-sm text-slate-500">Opłacone zamówienia</p>
        <p class="text-2xl font-bold text-green-600">{{ completedCount }}</p>
      </UiCard>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <UiSkeleton v-for="i in 5" :key="i" width="100%" height="80px" />
    </div>

    <!-- Error -->
    <UiCard v-else-if="error">
      <p class="text-red-600">Nie udało się załadować zamówień</p>
    </UiCard>

    <!-- Empty state -->
    <UiCard v-else-if="orders.length === 0" class="text-center py-12">
      <ShoppingCart class="h-12 w-12 text-slate-300 mx-auto mb-4" />
      <h2 class="text-lg font-medium text-slate-900 mb-2">Brak zamówień</h2>
      <p class="text-slate-500">Zamówienia pojawią się po pierwszych zakupach.</p>
    </UiCard>

    <!-- Orders table -->
    <UiCard v-else padding="none" class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 text-sm font-medium text-slate-500">Klient</th>
              <th class="text-left px-4 py-3 text-sm font-medium text-slate-500">Kurs</th>
              <th class="text-left px-4 py-3 text-sm font-medium text-slate-500">Kwota</th>
              <th class="text-left px-4 py-3 text-sm font-medium text-slate-500">Status</th>
              <th class="text-left px-4 py-3 text-sm font-medium text-slate-500">Faktura</th>
              <th class="text-left px-4 py-3 text-sm font-medium text-slate-500">Data</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <template v-for="order in orders" :key="order.id">
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3">
                  <div>
                    <p class="font-medium text-slate-900">{{ order.user.name || 'Brak imienia' }}</p>
                    <p class="text-sm text-slate-500">{{ order.user.email }}</p>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <p class="text-slate-900">{{ order.course.title }}</p>
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-900">{{ formatPrice(order.amount, order.currency) }}</p>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    :class="[statusInfo(order.status).bg, statusInfo(order.status).color]"
                  >
                    <component :is="statusInfo(order.status).icon" class="w-3 h-3" />
                    {{ statusInfo(order.status).label }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button
                    v-if="hasInvoiceData(order)"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                    @click="toggleOrder(order.id)"
                  >
                    <FileText class="w-3 h-3" />
                    Dane
                    <component :is="expandedOrders.has(order.id) ? ChevronUp : ChevronDown" class="w-3 h-3" />
                  </button>
                  <span v-else class="text-sm text-slate-400">—</span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-500">
                  {{ new Date(order.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                </td>
              </tr>
              <!-- Invoice data row -->
              <tr v-if="expandedOrders.has(order.id) && hasInvoiceData(order)">
                <td colspan="6" class="px-4 py-3 bg-slate-50">
                  <div class="text-sm space-y-1">
                    <p v-if="order.invoiceData?.name">
                      <span class="font-medium text-slate-600">Nazwa:</span>
                      <span class="text-slate-900 ml-2">{{ order.invoiceData.name }}</span>
                    </p>
                    <p v-if="order.invoiceData?.nip">
                      <span class="font-medium text-slate-600">NIP:</span>
                      <span class="text-slate-900 ml-2">{{ order.invoiceData.nip }}</span>
                    </p>
                    <p v-if="order.invoiceData?.address">
                      <span class="font-medium text-slate-600">Adres:</span>
                      <span class="text-slate-900 ml-2 whitespace-pre-line">{{ order.invoiceData.address }}</span>
                    </p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>
