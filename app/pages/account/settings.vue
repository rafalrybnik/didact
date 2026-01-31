<script setup lang="ts">
import { User, Camera, Save } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

const { user, fetchUser } = useAuth()
const { error: showError, success: showSuccess } = useToast()

// Form state
const form = reactive({
  name: '',
  avatarUrl: '',
})

// Initialize form with user data
watchEffect(() => {
  if (user.value) {
    form.name = user.value.name || ''
    form.avatarUrl = user.value.avatarUrl || ''
  }
})

// Save profile
const isSaving = ref(false)

async function saveProfile() {
  if (isSaving.value) return

  if (!form.name.trim()) {
    showError('Błąd', 'Imię jest wymagane')
    return
  }

  isSaving.value = true
  try {
    await $fetch('/api/account/profile', {
      method: 'PUT',
      body: {
        name: form.name.trim(),
        avatarUrl: form.avatarUrl.trim() || null,
      },
    })

    showSuccess('Zapisano', 'Profil został zaktualizowany')
    await fetchUser(true)
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się zapisać profilu')
  } finally {
    isSaving.value = false
  }
}

// Avatar upload
const isUploadingAvatar = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file
  if (!file.type.startsWith('image/')) {
    showError('Błąd', 'Wybierz plik graficzny')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    showError('Błąd', 'Plik jest za duży (max 2MB)')
    return
  }

  isUploadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch<{ url: string }>('/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    form.avatarUrl = response.url
    showSuccess('Przesłano', 'Avatar został przesłany')
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się przesłać obrazu')
  } finally {
    isUploadingAvatar.value = false
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

function removeAvatar() {
  form.avatarUrl = ''
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-slate-900 mb-6">Ustawienia konta</h1>

    <UiCard>
      <form @submit.prevent="saveProfile" class="space-y-6">
        <!-- Avatar -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Avatar
          </label>
          <div class="flex items-center gap-4">
            <!-- Avatar preview -->
            <div class="relative">
              <div class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  v-if="form.avatarUrl"
                  :src="form.avatarUrl"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
                <User v-else class="w-10 h-10 text-slate-400" />
              </div>
              <button
                type="button"
                class="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
                @click="triggerFileInput"
                :disabled="isUploadingAvatar"
              >
                <Camera class="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <!-- Upload controls -->
            <div class="flex-1">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarUpload"
              />
              <div class="flex gap-2">
                <UiButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  @click="triggerFileInput"
                  :disabled="isUploadingAvatar"
                >
                  {{ isUploadingAvatar ? 'Przesyłanie...' : 'Zmień avatar' }}
                </UiButton>
                <UiButton
                  v-if="form.avatarUrl"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removeAvatar"
                >
                  Usuń
                </UiButton>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                JPG, PNG lub GIF. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700 mb-1">
            Imię i nazwisko
          </label>
          <UiInput
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Twoje imię"
            required
          />
        </div>

        <!-- Email (read-only) -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <UiInput
            :model-value="user?.email || ''"
            type="email"
            disabled
            class="bg-slate-50"
          />
          <p class="text-xs text-slate-500 mt-1">
            Adres email nie może być zmieniony.
          </p>
        </div>

        <!-- Submit -->
        <div class="pt-4 border-t border-slate-200">
          <UiButton
            type="submit"
            variant="primary"
            :disabled="isSaving"
          >
            <Save class="w-4 h-4" />
            {{ isSaving ? 'Zapisywanie...' : 'Zapisz zmiany' }}
          </UiButton>
        </div>
      </form>
    </UiCard>
  </div>
</template>
