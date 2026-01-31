<script setup lang="ts">
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  ShoppingCart,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-vue-next'

const { user, logout } = useAuth()
const route = useRoute()

const isSidebarOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Kursy', href: '/admin/courses', icon: BookOpen },
  { name: 'Użytkownicy', href: '/admin/users', icon: Users },
  { name: 'Strony', href: '/admin/pages', icon: FileText },
  { name: 'Zamówienia', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Wiadomości', href: '/admin/messages', icon: MessageSquare },
]

function isActive(href: string) {
  if (href === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(href)
}

async function handleLogout() {
  await logout()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <!-- Mobile sidebar backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
        @click="isSidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 transform transition-transform duration-300 lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <NuxtLink to="/admin" class="flex items-center gap-2 text-white">
            <GraduationCap class="h-7 w-7 text-primary-400" />
            <span class="text-lg font-semibold">Didact</span>
          </NuxtLink>
          <button
            class="lg:hidden text-slate-400 hover:text-white"
            @click="isSidebarOpen = false"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <NuxtLink
            v-for="item in navigation"
            :key="item.href"
            :to="item.href"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            ]"
            @click="isSidebarOpen = false"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.name }}
          </NuxtLink>
        </nav>

        <!-- User -->
        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
              {{ user?.name?.[0] || user?.email?.[0] || 'A' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">
                {{ user?.name || 'Administrator' }}
              </p>
              <p class="text-xs text-slate-400 truncate">
                {{ user?.email }}
              </p>
            </div>
          </div>
          <button
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            Wyloguj się
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="lg:pl-64">
      <!-- Mobile header -->
      <header class="sticky top-0 z-30 bg-white border-b border-slate-200 lg:hidden">
        <div class="flex items-center justify-between h-16 px-4">
          <button
            class="text-slate-600 hover:text-slate-900"
            @click="isSidebarOpen = true"
          >
            <Menu class="h-6 w-6" />
          </button>
          <NuxtLink to="/admin" class="flex items-center gap-2 text-primary-600">
            <GraduationCap class="h-6 w-6" />
            <span class="font-semibold">Didact</span>
          </NuxtLink>
          <div class="w-6" />
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 md:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <UiToastContainer />
  </div>
</template>
