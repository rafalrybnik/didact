<script setup lang="ts">
import { ArrowLeft, Send, User } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

const route = useRoute()
const threadId = route.params.threadId as string

const { user: currentUser } = useAuth()
const { error: showError } = useToast()

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    role: 'ADMIN' | 'STUDENT'
  }
}

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
  messages: Message[]
  createdAt: string
}

const { data, pending, error, refresh } = await useFetch<{ thread: Thread }>(`/api/messages/threads/${threadId}`)

const thread = computed(() => data.value?.thread)
const messages = computed(() => thread.value?.messages || [])

// New message
const newMessage = ref('')
const isSending = ref(false)

async function sendMessage() {
  if (!newMessage.value.trim() || isSending.value) return

  isSending.value = true
  try {
    await $fetch(`/api/messages/threads/${threadId}`, {
      method: 'POST',
      body: { content: newMessage.value.trim() },
    })
    newMessage.value = ''
    await refresh()

    // Scroll to bottom
    nextTick(() => {
      const container = document.querySelector('.messages-container')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się wysłać wiadomości')
  } finally {
    isSending.value = false
  }
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Group messages by date
const groupedMessages = computed(() => {
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  for (const message of messages.value) {
    const date = new Date(message.createdAt).toDateString()
    if (date !== currentDate) {
      currentDate = date
      groups.push({ date: formatDate(message.createdAt), messages: [] })
    }
    groups[groups.length - 1].messages.push(message)
  }

  return groups
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
      <NuxtLink to="/messages" class="text-slate-500 hover:text-slate-700">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div v-if="thread" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
          <img
            v-if="currentUser?.role === 'ADMIN' ? thread.user.avatarUrl : thread.admin?.avatarUrl"
            :src="currentUser?.role === 'ADMIN' ? thread.user.avatarUrl : thread.admin?.avatarUrl"
            class="w-full h-full object-cover"
          />
          <User v-else class="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h1 class="font-semibold text-slate-900">
            {{ thread.subject || 'Bez tematu' }}
          </h1>
          <p class="text-sm text-slate-500">
            {{ currentUser?.role === 'ADMIN'
              ? thread.user.name || thread.user.email
              : thread.admin?.name || 'Administrator' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex-1 flex items-center justify-center">
      <p class="text-slate-500">Ładowanie...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <p class="text-red-600">{{ error.data?.message || 'Nie udało się załadować wątku' }}</p>
    </div>

    <!-- Messages -->
    <div v-else class="flex-1 overflow-y-auto messages-container px-2">
      <div
        v-for="group in groupedMessages"
        :key="group.date"
        class="mb-6"
      >
        <!-- Date separator -->
        <div class="flex items-center justify-center mb-4">
          <span class="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500">
            {{ group.date }}
          </span>
        </div>

        <!-- Messages -->
        <div class="space-y-3">
          <div
            v-for="message in group.messages"
            :key="message.id"
            class="flex gap-3"
            :class="message.sender.id === currentUser?.id ? 'flex-row-reverse' : ''"
          >
            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                v-if="message.sender.avatarUrl"
                :src="message.sender.avatarUrl"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-xs font-medium text-slate-500">
                {{ (message.sender.name || message.sender.email)[0].toUpperCase() }}
              </span>
            </div>
            <div
              class="max-w-[70%] px-4 py-2 rounded-2xl"
              :class="message.sender.id === currentUser?.id
                ? 'bg-primary-500 text-white rounded-tr-sm'
                : 'bg-slate-100 text-slate-900 rounded-tl-sm'"
            >
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
              <p
                class="text-xs mt-1"
                :class="message.sender.id === currentUser?.id ? 'text-primary-200' : 'text-slate-400'"
              >
                {{ formatTime(message.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message input -->
    <div class="pt-4 border-t border-slate-200">
      <form class="flex gap-2" @submit.prevent="sendMessage">
        <input
          v-model="newMessage"
          type="text"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Napisz wiadomość..."
        />
        <UiButton
          type="submit"
          variant="primary"
          class="rounded-full px-4"
          :disabled="!newMessage.trim() || isSending"
        >
          <Send class="w-4 h-4" />
        </UiButton>
      </form>
    </div>
  </div>
</template>
