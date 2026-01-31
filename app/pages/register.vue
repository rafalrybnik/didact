<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

const { register } = useAuth()
const { error: showError, success: showSuccess } = useToast()
const config = useRuntimeConfig()
const appName = config.public.appName
const route = useRoute()

// Get redirect URL from query param, default to /account
const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string
  return redirect || '/account'
})

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''

  if (form.password !== form.passwordConfirm) {
    error.value = 'Hasła nie są identyczne'
    return
  }

  if (form.password.length < 8) {
    error.value = 'Hasło musi mieć minimum 8 znaków'
    return
  }

  isLoading.value = true

  try {
    await register(form.email, form.password, form.name)
    showSuccess('Konto utworzone', 'Rejestracja zakończona sukcesem!')
    navigateTo(redirectUrl.value)
  } catch (e: any) {
    error.value = e.data?.message || 'Wystąpił błąd podczas rejestracji'
    showError('Błąd rejestracji', error.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
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
        <h1 class="text-2xl font-semibold text-slate-900 mb-6">
          Załóż konto
        </h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UiInput
            v-model="form.name"
            type="text"
            label="Imię"
            placeholder="Jan Kowalski"
          />

          <UiInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="jan@example.com"
            required
          />

          <UiInput
            v-model="form.password"
            type="password"
            label="Hasło"
            placeholder="Minimum 8 znaków"
            required
          />

          <UiInput
            v-model="form.passwordConfirm"
            type="password"
            label="Potwierdź hasło"
            placeholder="Powtórz hasło"
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
            Zarejestruj się
          </UiButton>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          Masz już konto?
          <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Zaloguj się
          </NuxtLink>
        </p>
      </UiCard>
    </div>
  </div>
</template>
