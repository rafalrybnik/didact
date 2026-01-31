<script setup lang="ts">
import { XCircle, ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'public',
})
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-16 text-center">
    <div class="w-20 h-20 rounded-full bg-slate-100 mx-auto mb-6 flex items-center justify-center">
      <XCircle class="w-10 h-10 text-slate-400" />
    </div>

    <h1 class="text-3xl font-bold text-slate-900 mb-4">
      Płatność anulowana
    </h1>

    <p class="text-lg text-slate-600 mb-8">
      Twoja płatność została anulowana. Nie zostałeś obciążony.
    </p>

    <div class="space-y-4">
      <NuxtLink to="/">
        <UiButton variant="primary" class="w-full justify-center">
          <ArrowLeft class="w-4 h-4" />
          Wróć do strony głównej
        </UiButton>
      </NuxtLink>
    </div>

    <p class="text-sm text-slate-500 mt-8">
      Jeśli napotkałeś problemy, skontaktuj się z nami.
    </p>
  </div>
</template>
