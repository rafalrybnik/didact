<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'

const config = useRuntimeConfig()
const appName = config.public.appName

// Fetch published pages for footer links
const { data: pagesData } = await useFetch('/api/public/pages', {
  key: 'footer-pages',
  default: () => ({ pages: [] }),
})
const footerPages = computed(() => pagesData.value?.pages || [])
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Unified Header -->
    <LayoutAppHeader />

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
            <span class="text-sm">{{ appName }}</span>
          </div>
          <div v-if="footerPages.length > 0" class="flex flex-wrap gap-4">
            <NuxtLink
              v-for="page in footerPages"
              :key="page.slug"
              :to="`/${page.slug}`"
              class="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {{ page.title }}
            </NuxtLink>
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
