<script setup lang="ts">
import { Users, User, Shield, Mail, Calendar } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

interface UserData {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'STUDENT'
  avatarUrl: string | null
  createdAt: string
  enrollmentsCount: number
  ordersCount: number
}

const { data, pending, error } = await useFetch<{ users: UserData[] }>('/api/admin/users')

const users = computed(() => data.value?.users || [])

const adminsCount = computed(() => users.value.filter(u => u.role === 'ADMIN').length)
const studentsCount = computed(() => users.value.filter(u => u.role === 'STUDENT').length)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Użytkownicy</h1>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <UiCard>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-100 rounded-lg">
            <Users class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p class="text-sm text-slate-500">Wszyscy</p>
            <p class="text-xl font-bold text-slate-900">{{ users.length }}</p>
          </div>
        </div>
      </UiCard>
      <UiCard>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-amber-100 rounded-lg">
            <Shield class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p class="text-sm text-slate-500">Administratorzy</p>
            <p class="text-xl font-bold text-slate-900">{{ adminsCount }}</p>
          </div>
        </div>
      </UiCard>
      <UiCard>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <User class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-slate-500">Studenci</p>
            <p class="text-xl font-bold text-slate-900">{{ studentsCount }}</p>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <UiSkeleton v-for="i in 5" :key="i" width="100%" height="60px" />
    </div>

    <!-- Error -->
    <UiCard v-else-if="error">
      <p class="text-red-600">Nie udało się załadować użytkowników</p>
    </UiCard>

    <!-- Empty state -->
    <UiCard v-else-if="users.length === 0" class="text-center py-12">
      <Users class="h-12 w-12 text-slate-300 mx-auto mb-4" />
      <h2 class="text-lg font-medium text-slate-900 mb-2">Brak użytkowników</h2>
    </UiCard>

    <!-- Users table -->
    <UiCard v-else class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Użytkownik</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Rola</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Kursy</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Zamówienia</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Dołączył</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="user.avatarUrl"
                      :src="user.avatarUrl"
                      class="w-full h-full object-cover"
                    />
                    <User v-else class="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{{ user.name || 'Bez nazwy' }}</p>
                    <p class="text-sm text-slate-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  ]"
                >
                  <Shield v-if="user.role === 'ADMIN'" class="w-3 h-3" />
                  {{ user.role === 'ADMIN' ? 'Admin' : 'Student' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ user.enrollmentsCount }}
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ user.ordersCount }}
              </td>
              <td class="px-4 py-3 text-sm text-slate-500">
                {{ formatDate(user.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>
