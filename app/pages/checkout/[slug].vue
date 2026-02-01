<script setup lang="ts">
import { ShoppingCart, FileText, ArrowRight, ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'public',
})

const route = useRoute()
const slug = route.params.slug as string

// Fetch course data
const { data, pending, error } = await useFetch(`/api/public/courses/${slug}`)
const course = computed(() => data.value?.course)
const isEnrolled = computed(() => data.value?.isEnrolled)

const { error: showError } = useToast()

// Invoice form
const wantsInvoice = ref(false)
const invoiceData = reactive({
  name: '',
  address: '',
  nip: '',
})

// Purchase state
const isPurchasing = ref(false)

// Price formatting
function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Bezpłatny'
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  })
  return formatter.format(price / 100)
}

async function handlePurchase() {
  if (isEnrolled.value) {
    navigateTo(`/course/${slug}`)
    return
  }

  isPurchasing.value = true
  try {
    const body: any = { courseSlug: slug }

    if (wantsInvoice.value) {
      body.invoiceData = {
        name: invoiceData.name.trim() || undefined,
        address: invoiceData.address.trim() || undefined,
        nip: invoiceData.nip.trim() || undefined,
      }
    }

    const response = await $fetch<{
      success: boolean
      free: boolean
      sessionUrl?: string
      redirectUrl?: string
    }>('/api/checkout/create-session', {
      method: 'POST',
      body,
    })

    if (response.free) {
      navigateTo(response.redirectUrl)
    } else if (response.sessionUrl) {
      window.location.href = response.sessionUrl
    }
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się rozpocząć zakupu')
  } finally {
    isPurchasing.value = false
  }
}

// Redirect if already enrolled
watch(isEnrolled, (enrolled) => {
  if (enrolled) {
    navigateTo(`/course/${slug}`)
  }
}, { immediate: true })

// SEO
useHead(() => ({
  title: course.value ? `Zakup: ${course.value.title}` : 'Checkout',
}))
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-12">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back link -->
      <NuxtLink
        :to="`/c/${slug}`"
        class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        Wróć do opisu kursu
      </NuxtLink>

      <!-- Loading -->
      <div v-if="pending" class="space-y-4">
        <UiSkeleton width="100%" height="200px" />
        <UiSkeleton width="100%" height="300px" />
      </div>

      <!-- Error -->
      <UiCard v-else-if="error" class="text-center py-12">
        <p class="text-red-600 mb-4">{{ error.data?.message || 'Nie udało się załadować kursu' }}</p>
        <NuxtLink to="/">
          <UiButton variant="primary">Wróć do strony głównej</UiButton>
        </NuxtLink>
      </UiCard>

      <!-- Checkout form -->
      <template v-else-if="course">
        <!-- Order summary -->
        <UiCard class="mb-6">
          <h1 class="text-xl font-bold text-slate-900 mb-4">Podsumowanie zamówienia</h1>

          <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div class="w-20 h-14 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                v-if="course.thumbnailUrl"
                :src="course.thumbnailUrl"
                :alt="course.title"
                class="w-full h-full object-cover"
              />
              <ShoppingCart v-else class="w-6 h-6 text-slate-400" />
            </div>
            <div class="flex-1">
              <h2 class="font-medium text-slate-900">{{ course.title }}</h2>
              <p class="text-sm text-slate-500">Dostęp bezterminowy</p>
            </div>
            <div class="text-lg font-bold text-slate-900">
              {{ formatPrice(course.price, course.currency) }}
            </div>
          </div>
        </UiCard>

        <!-- Invoice option -->
        <UiCard class="mb-6">
          <div class="flex items-start gap-3">
            <input
              id="wantsInvoice"
              v-model="wantsInvoice"
              type="checkbox"
              class="mt-1 w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
            />
            <label for="wantsInvoice" class="flex-1 cursor-pointer">
              <div class="flex items-center gap-2">
                <FileText class="w-5 h-5 text-slate-500" />
                <span class="font-medium text-slate-900">Chcę otrzymać fakturę</span>
              </div>
              <p class="text-sm text-slate-500 mt-1">
                Podaj dane do faktury VAT. Faktura zostanie wystawiona po zakupie.
              </p>
            </label>
          </div>

          <!-- Invoice form -->
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="wantsInvoice" class="mt-4 pt-4 border-t border-slate-200 space-y-4 overflow-hidden">
              <UiInput
                v-model="invoiceData.name"
                label="Nazwa firmy / Imię i nazwisko"
                placeholder="np. Firma XYZ Sp. z o.o."
              />
              <UiInput
                v-model="invoiceData.nip"
                label="NIP (opcjonalnie)"
                placeholder="np. 1234567890"
              />
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  Adres
                </label>
                <textarea
                  v-model="invoiceData.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  placeholder="ul. Przykładowa 123&#10;00-000 Warszawa"
                />
              </div>
            </div>
          </Transition>
        </UiCard>

        <!-- Payment button -->
        <UiButton
          variant="primary"
          size="lg"
          class="w-full"
          :disabled="isPurchasing"
          @click="handlePurchase"
        >
          <template v-if="isPurchasing">
            Przekierowanie do płatności...
          </template>
          <template v-else>
            Przejdź do płatności
            <ArrowRight class="w-5 h-5" />
          </template>
        </UiButton>

        <p class="text-center text-sm text-slate-500 mt-4">
          Płatność obsługiwana przez Stripe. Akceptujemy karty, BLIK i Przelewy24.
        </p>
      </template>
    </div>
  </div>
</template>
