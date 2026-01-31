<script setup lang="ts">
import { GraduationCap, LogIn, UserPlus } from 'lucide-vue-next'

const { user, isLoggedIn } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center gap-2 text-primary-600 hover:text-primary-700">
              <GraduationCap class="h-8 w-8" />
              <span class="text-xl font-semibold">Didact</span>
            </NuxtLink>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center gap-4">
            <template v-if="isLoggedIn">
              <NuxtLink
                v-if="user?.role === 'ADMIN'"
                to="/admin"
                class="text-sm text-slate-600 hover:text-slate-900"
              >
                Panel admina
              </NuxtLink>
              <NuxtLink to="/account" class="text-sm text-slate-600 hover:text-slate-900">
                Moje kursy
              </NuxtLink>
            </template>
            <template v-else>
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

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2 text-slate-500">
            <GraduationCap class="h-5 w-5" />
            <span class="text-sm">Didact LMS</span>
          </div>
          <div class="text-sm text-slate-500">
            &copy; {{ new Date().getFullYear() }} Wszelkie prawa zastrzeżone
          </div>
        </div>
      </div>
    </footer>

    <UiToastContainer />
  </div>
</template>
