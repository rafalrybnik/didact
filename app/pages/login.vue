<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

const { login } = useAuth()
const { error: showError } = useToast()

const form = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  isLoading.value = true

  try {
    await login(form.email, form.password)
    navigateTo('/')
  } catch (e: any) {
    error.value = e.data?.message || 'Wystąpił błąd podczas logowania'
    showError('Błąd logowania', error.value)
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
          <span class="text-2xl font-bold">Didact</span>
        </NuxtLink>
      </div>

      <!-- Form Card -->
      <UiCard>
        <h1 class="text-2xl font-semibold text-slate-900 mb-6">
          Zaloguj się
        </h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
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
            Zaloguj się
          </UiButton>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          Nie masz konta?
          <NuxtLink to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
            Zarejestruj się
          </NuxtLink>
        </p>
      </UiCard>
    </div>
  </div>
</template>
