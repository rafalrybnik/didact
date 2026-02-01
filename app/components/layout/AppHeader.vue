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
              class="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
            >
              <Shield class="h-4 w-4" />
              Panel admina
            </NuxtLink>

            <!-- User links -->
            <NuxtLink to="/account" class="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <User class="h-4 w-4" />
              Moje kursy
            </NuxtLink>
            <NuxtLink to="/messages" class="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <MessageSquare class="h-4 w-4" />
              Wiadomości
            </NuxtLink>
            <NuxtLink to="/account/settings" class="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <Settings class="h-4 w-4" />
              Ustawienia
            </NuxtLink>

            <!-- Logout -->
            <button
              class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
              @click="handleLogout"
            >
              <LogOut class="h-4 w-4" />
              Wyloguj
            </button>
          </template>

          <template v-else>
            <!-- Guest links -->
            <NuxtLink to="/login" class="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <LogIn class="h-4 w-4" />
              Zaloguj się
            </NuxtLink>
            <NuxtLink to="/register">
              <UiButton variant="primary" size="sm">
                <UserPlus class="h-4 w-4" />
                Zarejestruj się
              </UiButton>
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>
