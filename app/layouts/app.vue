<script setup lang="ts">
import { GraduationCap, User, LogOut, Settings, MessageSquare } from 'lucide-vue-next'

const { user, logout } = useAuth()

async function handleLogout() {
  await logout()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-14">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center gap-2 text-primary-600 hover:text-primary-700">
              <GraduationCap class="h-6 w-6" />
              <span class="text-lg font-semibold">Didact</span>
            </NuxtLink>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <NuxtLink to="/account" class="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <User class="h-4 w-4" />
              Moje kursy
            </NuxtLink>
            <NuxtLink to="/account/settings" class="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <Settings class="h-4 w-4" />
              Ustawienia
            </NuxtLink>
            <NuxtLink to="/messages" class="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <MessageSquare class="h-4 w-4" />
              Wiadomości
            </NuxtLink>
            <button
              class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
              @click="handleLogout"
            >
              <LogOut class="h-4 w-4" />
              Wyloguj
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <UiToastContainer />
  </div>
</template>
