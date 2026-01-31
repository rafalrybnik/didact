<script setup lang="ts">
import { MessageSquare, Plus, User, Circle } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

interface Thread {
  id: string
  subject: string | null
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  admin: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  } | null
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  } | null
  unreadCount: number
  createdAt: string
  updatedAt: string
}

const { user: currentUser } = useAuth()
const { data, pending, error, refresh } = await useFetch<{ threads: Thread[] }>('/api/messages/threads')

const threads = computed(() => data.value?.threads || [])

// New thread modal
const showNewThread = ref(false)
const newThreadForm = reactive({
  subject: '',
  message: '',
})
const isCreatingThread = ref(false)
const { error: showError, success: showSuccess } = useToast()

async function createThread() {
  if (!newThreadForm.subject.trim() || !newThreadForm.message.trim()) {
    showError('Błąd', 'Wszystkie pola są wymagane')
    return
  }

  isCreatingThread.value = true
  try {
    const response = await $fetch<{ thread: Thread }>('/api/messages/threads', {
      method: 'POST',
      body: {
        subject: newThreadForm.subject.trim(),
        message: newThreadForm.message.trim(),
      },
    })

    showSuccess('Wysłano', 'Wiadomość została wysłana')
    showNewThread.value = false
    newThreadForm.subject = ''
    newThreadForm.message = ''

    navigateTo(`/messages/${response.thread.id}`)
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się wysłać wiadomości')
  } finally {
    isCreatingThread.value = false
  }
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 24 * 60 * 60 * 1000) {
    return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString('pl-PL', { weekday: 'short' })
  }

  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
}

function truncate(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Wiadomości</h1>
      <UiButton v-if="currentUser?.role !== 'ADMIN'" variant="primary" @click="showNewThread = true">
        <Plus class="w-4 h-4" />
        Nowa wiadomość
      </UiButton>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <UiSkeleton v-for="i in 5" :key="i" width="100%" height="80px" />
    </div>

    <!-- Error -->
    <UiCard v-else-if="error">
      <p class="text-red-600">Nie udało się załadować wiadomości</p>
    </UiCard>

    <!-- Empty state -->
    <UiCard v-else-if="threads.length === 0" class="text-center py-12">
      <MessageSquare class="h-12 w-12 text-slate-300 mx-auto mb-4" />
      <h2 class="text-lg font-medium text-slate-900 mb-2">Brak wiadomości</h2>
      <p class="text-slate-500 mb-4">
        {{ currentUser?.role === 'ADMIN' ? 'Nie masz żadnych wiadomości od studentów.' : 'Napisz do nas, jeśli potrzebujesz pomocy.' }}
      </p>
      <UiButton v-if="currentUser?.role !== 'ADMIN'" variant="primary" @click="showNewThread = true">
        <Plus class="w-4 h-4" />
        Napisz wiadomość
      </UiButton>
    </UiCard>

    <!-- Threads list -->
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="thread in threads"
        :key="thread.id"
        :to="`/messages/${thread.id}`"
        class="block"
      >
        <UiCard
          hover
          class="transition-colors"
          :class="thread.unreadCount > 0 ? 'bg-primary-50 border-primary-200' : ''"
        >
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                v-if="currentUser?.role === 'ADMIN' ? thread.user.avatarUrl : thread.admin?.avatarUrl"
                :src="currentUser?.role === 'ADMIN' ? thread.user.avatarUrl : thread.admin?.avatarUrl"
                class="w-full h-full object-cover"
              />
              <User v-else class="w-6 h-6 text-slate-400" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-slate-900 truncate">
                  {{ currentUser?.role === 'ADMIN'
                    ? thread.user.name || thread.user.email
                    : thread.admin?.name || 'Administrator' }}
                </span>
                <Circle
                  v-if="thread.unreadCount > 0"
                  class="w-2 h-2 fill-primary-500 text-primary-500"
                />
              </div>
              <p class="font-medium text-sm text-slate-700 truncate">
                {{ thread.subject || 'Bez tematu' }}
              </p>
              <p v-if="thread.lastMessage" class="text-sm text-slate-500 truncate">
                {{ truncate(thread.lastMessage.content, 60) }}
              </p>
            </div>

            <!-- Time -->
            <div class="text-sm text-slate-400 flex-shrink-0">
              {{ thread.lastMessage ? formatDate(thread.lastMessage.createdAt) : formatDate(thread.createdAt) }}
            </div>
          </div>
        </UiCard>
      </NuxtLink>
    </div>

    <!-- New thread modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showNewThread"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showNewThread = false"
        >
          <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">Nowa wiadomość</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Temat</label>
                <input
                  v-model="newThreadForm.subject"
                  type="text"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="O czym chcesz porozmawiać?"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Wiadomość</label>
                <textarea
                  v-model="newThreadForm.message"
                  rows="5"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  placeholder="Napisz swoją wiadomość..."
                />
              </div>

              <div class="flex justify-end gap-3">
                <UiButton variant="secondary" @click="showNewThread = false">
                  Anuluj
                </UiButton>
                <UiButton
                  variant="primary"
                  :disabled="isCreatingThread || !newThreadForm.subject.trim() || !newThreadForm.message.trim()"
                  @click="createThread"
                >
                  {{ isCreatingThread ? 'Wysyłanie...' : 'Wyślij' }}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
