<script setup lang="ts">
definePageMeta({
  layout: 'public',
})

const route = useRoute()
const slug = route.params.slug as string

// Skip this route for specific paths that have their own pages
if (['login', 'register', 'admin', 'account', 'course', 'checkout', 'c'].includes(slug)) {
  throw createError({
    statusCode: 404,
    message: 'Page not found',
  })
}

const { data, pending, error } = await useFetch(`/api/public/pages/${slug}`)

const page = computed(() => data.value?.page)

// SEO
useHead(() => ({
  title: page.value?.title ? `${page.value.title} | Didact` : 'Strona | Didact',
  meta: [
    { name: 'description', content: page.value?.metaDescription || '' },
  ],
}))
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Loading state -->
    <div v-if="pending" class="space-y-6">
      <UiSkeleton width="60%" height="3rem" />
      <UiSkeleton width="100%" height="200px" />
      <UiSkeleton width="100%" height="150px" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <h1 class="text-2xl font-bold text-slate-900 mb-4">Strona nie została znaleziona</h1>
      <p class="text-slate-500 mb-6">{{ error.data?.message || 'Strona nie istnieje lub nie jest dostępna.' }}</p>
      <NuxtLink to="/">
        <UiButton variant="primary">Wróć do strony głównej</UiButton>
      </NuxtLink>
    </div>

    <!-- Page content -->
    <article v-else-if="page">
      <h1 class="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">
        {{ page.title }}
      </h1>

      <div
        v-if="page.contentHtml"
        class="prose prose-slate max-w-none"
        v-html="page.contentHtml"
      />
    </article>
  </div>
</template>
