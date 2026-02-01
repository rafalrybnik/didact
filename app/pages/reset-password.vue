<script setup lang="ts">
import { GraduationCap, CheckCircle, XCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

const config = useRuntimeConfig()
const appName = config.public.appName
const route = useRoute()
const { error: showError, success: showSuccess } = useToast()

const token = computed(() => route.query.token as string)

const form = reactive({
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const success = ref(false)
const error = ref('')

// Check if token exists
if (!token.value) {
  error.value = 'Brak tokenu. Spróbuj ponownie z linku w emailu.'
}

async function handleSubmit() {
  error.value = ''

  // Validate passwords match
  if (form.password !== form.confirmPassword) {
    error.value = 'Hasła nie są identyczne'
    return
  }

  if (form.password.length < 8) {
    error.value = 'Hasło musi mieć minimum 8 znaków'
    return
  }

  isLoading.value = true

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: form.password,
      },
    })

    success.value = true
    showSuccess('Sukces', 'Hasło zostało zmienione')
  } catch (e: any) {
    error.value = e.data?.message || 'Wystąpił błąd'
    showError('Błąd', error.value)
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

      <!-- Card -->
      <UiCard>
        <!-- Success state -->
        <template v-if="success">
          <div class="text-center py-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <h1 class="text-2xl font-semibold text-slate-900 mb-2">
              Hasło zmienione
            </h1>
            <p class="text-slate-600 mb-6">
              Twoje hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.
            </p>
            <NuxtLink to="/login">
              <UiButton variant="primary" class="w-full">
                Zaloguj się
              </UiButton>
            </NuxtLink>
          </div>
        </template>

        <!-- Error state (no token) -->
        <template v-else-if="error && !token">
          <div class="text-center py-4">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle class="w-8 h-8 text-red-600" />
            </div>
            <h1 class="text-2xl font-semibold text-slate-900 mb-2">
              Nieprawidłowy link
            </h1>
            <p class="text-slate-600 mb-6">
              {{ error }}
            </p>
            <NuxtLink to="/forgot-password">
              <UiButton variant="primary" class="w-full">
                Poproś o nowy link
              </UiButton>
            </NuxtLink>
          </div>
        </template>

        <!-- Form state -->
        <template v-else>
          <h1 class="text-2xl font-semibold text-slate-900 mb-2">
            Ustaw nowe hasło
          </h1>
          <p class="text-slate-600 mb-6">
            Wprowadź nowe hasło do swojego konta.
          </p>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UiInput
              v-model="form.password"
              type="password"
              label="Nowe hasło"
              placeholder="••••••••"
              required
            />

            <UiInput
              v-model="form.confirmPassword"
              type="password"
              label="Potwierdź hasło"
              placeholder="••••••••"
              required
            />

            <p v-if="error" class="text-sm text-red-600">
              {{ error }}
            </p>

            <UiButton
              type="submit"
              variant="primary"
              class="w-full"
              :loading="isLoading"
              :disabled="isLoading"
            >
              Zmień hasło
            </UiButton>
          </form>

          <p class="mt-6 text-center text-sm text-slate-600">
            Pamiętasz hasło?
            <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
              Zaloguj się
            </NuxtLink>
          </p>
        </template>
      </UiCard>
    </div>
  </div>
</template>
