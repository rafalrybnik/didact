<script setup lang="ts">
import { GraduationCap, LogIn, UserPlus, User, LogOut, Settings, MessageSquare, Shield } from 'lucide-vue-next'

const { user, isLoggedIn, logout } = useAuth()
const config = useRuntimeConfig()
const appName = config.public.appName

async function handleLogout() {
  await logout()
  navigateTo('/')
}
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <GraduationCap class="h-8 w-8" />
            <span class="text-xl font-semibold">{{ appName }}</span>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <div class="flex items-center gap-4">
          <template v-if="isLoggedIn">
            <!-- Admin link -->
            <NuxtLink
              v-if="user?.role === 'ADMIN'"
              to="/admin"
              class="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
            >
              <span class="w-4 h-4 flex-shrink-0 inline-flex items-center justify-center"><Shield class="w-4 h-4" /></span>
              <span>Panel admina</span>
            </NuxtLink>

            <!-- User links -->
            <NuxtLink to="/account" class="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <span class="w-4 h-4 flex-shrink-0 inline-flex items-center justify-center"><User class="w-4 h-4" /></span>
              <span>Moje kursy</span>
            </NuxtLink>
            <NuxtLink to="/messages" class="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <span class="w-4 h-4 flex-shrink-0 inline-flex items-center justify-center"><MessageSquare class="w-4 h-4" /></span>
              <span>Wiadomości</span>
            </NuxtLink>
            <NuxtLink to="/account/settings" class="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <span class="w-4 h-4 flex-shrink-0 inline-flex items-center justify-center"><Settings class="w-4 h-4" /></span>
              <span>Ustawienia</span>
            </NuxtLink>

            <!-- Logout -->
            <button
              class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
              @click="handleLogout"
            >
              <span class="w-4 h-4 flex-shrink-0 inline-flex items-center justify-center"><LogOut class="w-4 h-4" /></span>
              <span>Wyloguj</span>
            </button>
          </template>

          <template v-else>
            <!-- Guest links -->
            <NuxtLink to="/login" class="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <span class="w-4 h-4 flex-shrink-0 inline-flex items-center justify-center"><LogIn class="w-4 h-4" /></span>
              <span>Zaloguj się</span>
            </NuxtLink>
            <NuxtLink to="/register">
              <UiButton variant="primary" size="sm">
                <span class="w-4 h-4 flex-shrink-0 inline-flex items-center justify-center"><UserPlus class="w-4 h-4" /></span>
                <span>Zarejestruj się</span>
              </UiButton>
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>
