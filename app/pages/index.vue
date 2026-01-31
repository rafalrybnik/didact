<script setup lang="ts">
definePageMeta({
  layout: 'public',
})

// Temporary placeholder - will show course catalog in Phase 5
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-4 text-balance">
        Zdobywaj nowe umiejętności
      </h1>
      <p class="text-lg text-slate-600 max-w-2xl mx-auto">
        Odkryj kursy online, które pomogą Ci rozwinąć karierę i zdobyć nowe kompetencje.
      </p>
    </div>

    <!-- Placeholder for courses -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UiCard v-for="i in 3" :key="i" hover padding="none">
        <div class="aspect-video bg-slate-100">
          <UiSkeleton width="100%" height="100%" rounded="none" />
        </div>
        <div class="p-4">
          <UiSkeleton width="70%" height="1.5rem" class="mb-2" />
          <UiSkeleton width="100%" height="1rem" class="mb-1" />
          <UiSkeleton width="60%" height="1rem" class="mb-4" />
          <div class="flex justify-between items-center">
            <UiSkeleton width="4rem" height="1.25rem" />
            <UiSkeleton width="6rem" height="2rem" rounded="lg" />
          </div>
        </div>
      </UiCard>
    </div>

    <p class="text-center text-slate-500 mt-8">
      Kursy pojawią się wkrótce...
    </p>
  </div>
</template>
