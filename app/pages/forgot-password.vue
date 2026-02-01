<script setup lang="ts">
import { GraduationCap, ArrowLeft, Mail } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

const config = useRuntimeConfig()
const appName = config.public.appName
const { error: showError, success: showSuccess } = useToast()

const email = ref('')
const isLoading = ref(false)
const submitted = ref(false)

async function handleSubmit() {
  if (!email.value.trim()) {
    showError('Błąd', 'Podaj adres email')
    return
  }

  isLoading.value = true

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })

    submitted.value = true
    showSuccess('Wysłano', 'Sprawdź swoją skrzynkę email')
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Wystąpił błąd')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-primary-600">
          <GraduationCap class="h-10 w-10" />
          <span class="text-2xl font-bold">{{ appName }}</span>
        </NuxtLink>
      </div>

      <!-- Form Card -->
      <UiCard>
        <!-- Success state -->
        <template v-if="submitted">
          <div class="text-center py-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail class="w-8 h-8 text-green-600" />
            </div>
            <h1 class="text-2xl font-semibold text-slate-900 mb-2">
              Sprawdź email
            </h1>
            <p class="text-slate-600 mb-6">
              Jeśli konto z adresem <strong>{{ email }}</strong> istnieje, wysłaliśmy link do resetowania hasła.
            </p>
            <p class="text-sm text-slate-500 mb-6">
              Link wygaśnie za 60 minut.
            </p>
            <NuxtLink
              to="/login"
              class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft class="w-4 h-4" />
              Wróć do logowania
            </NuxtLink>
          </div>
        </template>

        <!-- Form state -->
        <template v-else>
          <NuxtLink
            to="/login"
            class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft class="w-4 h-4" />
            Wróć do logowania
          </NuxtLink>

          <h1 class="text-2xl font-semibold text-slate-900 mb-2">
            Nie pamiętasz hasła?
          </h1>
          <p class="text-slate-600 mb-6">
            Podaj swój adres email, a wyślemy Ci link do zresetowania hasła.
          </p>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UiInput
              v-model="email"
              type="email"
              label="Email"
              placeholder="jan@example.com"
              required
            />

            <UiButton
              type="submit"
              variant="primary"
              class="w-full"
              :loading="isLoading"
              :disabled="isLoading"
            >
              Wyślij link
            </UiButton>
          </form>
        </template>
      </UiCard>
    </div>
  </div>
</template>
