<script setup lang="ts">
import { CheckCircle, ArrowRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'public',
})

const route = useRoute()
const sessionId = route.query.session_id as string | undefined

// Optionally fetch session details from Stripe
// For now, just show a success message
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-16 text-center">
    <div class="w-20 h-20 rounded-full bg-green-100 mx-auto mb-6 flex items-center justify-center">
      <CheckCircle class="w-10 h-10 text-green-600" />
    </div>

    <h1 class="text-3xl font-bold text-slate-900 mb-4">
      Dziękujemy za zakup!
    </h1>

    <p class="text-lg text-slate-600 mb-8">
      Twoje zamówienie zostało zrealizowane. Możesz teraz rozpocząć naukę.
    </p>

    <div class="space-y-4">
      <NuxtLink to="/account">
        <UiButton variant="primary" class="w-full justify-center">
          Przejdź do moich kursów
          <ArrowRight class="w-4 h-4" />
        </UiButton>
      </NuxtLink>

      <NuxtLink to="/">
        <UiButton variant="secondary" class="w-full justify-center">
          Wróć do strony głównej
        </UiButton>
      </NuxtLink>
    </div>

    <p class="text-sm text-slate-500 mt-8">
      Potwierdzenie zakupu zostało wysłane na Twój adres email.
    </p>
  </div>
</template>
