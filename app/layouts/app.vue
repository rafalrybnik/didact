<script setup lang="ts">
// App layout for logged-in user pages (account, course player, messages)
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Unified Header -->
    <LayoutAppHeader />

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <UiToastContainer />
  </div>
</template>
