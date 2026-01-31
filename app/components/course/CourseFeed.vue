<script setup lang="ts">
import { Send, MessageCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-vue-next'

interface User {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  role: 'ADMIN' | 'STUDENT'
}

interface Post {
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  user: User
  commentsCount: number
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: User
}

interface Props {
  courseSlug: string
}

const props = defineProps<Props>()
const { error: showError, success: showSuccess } = useToast()
const { user: currentUser } = useAuth()

// Fetch posts
const { data, refresh } = await useFetch<{ posts: Post[] }>(`/api/courses/${props.courseSlug}/feed`)
const posts = computed(() => data.value?.posts || [])

// New post form
const newPostContent = ref('')
const isPostingPost = ref(false)

async function submitPost() {
  if (!newPostContent.value.trim() || isPostingPost.value) return

  isPostingPost.value = true
  try {
    await $fetch(`/api/courses/${props.courseSlug}/feed`, {
      method: 'POST',
      body: { content: newPostContent.value.trim() },
    })
    newPostContent.value = ''
    showSuccess('Dodano', 'Post został dodany')
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się dodać posta')
  } finally {
    isPostingPost.value = false
  }
}

// Expanded posts for comments
const expandedPosts = ref<Set<string>>(new Set())
const postComments = ref<Record<string, Comment[]>>({})
const loadingComments = ref<Set<string>>(new Set())

async function toggleComments(postId: string) {
  if (expandedPosts.value.has(postId)) {
    expandedPosts.value.delete(postId)
  } else {
    expandedPosts.value.add(postId)
    if (!postComments.value[postId]) {
      await loadComments(postId)
    }
  }
}

async function loadComments(postId: string) {
  loadingComments.value.add(postId)
  try {
    const response = await $fetch<{ comments: Comment[] }>(
      `/api/courses/${props.courseSlug}/feed/${postId}/comments`
    )
    postComments.value[postId] = response.comments
  } catch {
    showError('Błąd', 'Nie udało się załadować komentarzy')
  } finally {
    loadingComments.value.delete(postId)
  }
}

// New comment form
const newCommentContent = ref<Record<string, string>>({})
const isPostingComment = ref<Set<string>>(new Set())

async function submitComment(postId: string) {
  const content = newCommentContent.value[postId]?.trim()
  if (!content || isPostingComment.value.has(postId)) return

  isPostingComment.value.add(postId)
  try {
    const response = await $fetch<{ comment: Comment }>(
      `/api/courses/${props.courseSlug}/feed/${postId}/comments`,
      {
        method: 'POST',
        body: { content },
      }
    )
    postComments.value[postId] = [...(postComments.value[postId] || []), response.comment]
    newCommentContent.value[postId] = ''
    await refresh() // Update comments count
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się dodać komentarza')
  } finally {
    isPostingComment.value.delete(postId)
  }
}

// Delete post (admin only)
const deletingPost = ref<string | null>(null)

async function deletePost(postId: string) {
  if (!confirm('Czy na pewno chcesz usunąć ten post?')) return

  deletingPost.value = postId
  try {
    await $fetch(`/api/admin/feed/${postId}`, { method: 'DELETE' })
    showSuccess('Usunięto', 'Post został usunięty')
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się usunąć posta')
  } finally {
    deletingPost.value = null
  }
}

// Formatting
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- New post form -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <textarea
        v-model="newPostContent"
        rows="3"
        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        placeholder="Napisz coś do społeczności kursu..."
      />
      <div class="flex justify-end mt-2">
        <UiButton
          variant="primary"
          size="sm"
          :disabled="!newPostContent.trim() || isPostingPost"
          @click="submitPost"
        >
          <Send class="w-4 h-4" />
          {{ isPostingPost ? 'Wysyłanie...' : 'Opublikuj' }}
        </UiButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="posts.length === 0" class="text-center py-12 text-slate-500">
      <MessageCircle class="w-12 h-12 mx-auto mb-4 text-slate-300" />
      <p>Brak postów. Bądź pierwszy i napisz coś!</p>
    </div>

    <!-- Posts list -->
    <div v-else class="space-y-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-lg shadow-sm border border-slate-200"
      >
        <!-- Post header -->
        <div class="p-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                v-if="post.user.avatarUrl"
                :src="post.user.avatarUrl"
                :alt="post.user.name || 'User'"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-sm font-medium text-slate-500">
                {{ (post.user.name || post.user.email)[0].toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-900">
                  {{ post.user.name || post.user.email }}
                </span>
                <span v-if="post.user.role === 'ADMIN'" class="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                  Admin
                </span>
              </div>
              <span class="text-xs text-slate-500">{{ formatDate(post.createdAt) }}</span>
            </div>
            <button
              v-if="currentUser?.role === 'ADMIN'"
              class="text-slate-400 hover:text-red-600"
              :disabled="deletingPost === post.id"
              @click="deletePost(post.id)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Post content -->
          <p class="mt-3 text-slate-700 whitespace-pre-wrap">{{ post.content }}</p>

          <img
            v-if="post.imageUrl"
            :src="post.imageUrl"
            alt="Post image"
            class="mt-3 rounded-lg max-w-full"
          />
        </div>

        <!-- Comments section -->
        <div class="border-t border-slate-200">
          <button
            class="w-full px-4 py-2 flex items-center justify-between text-sm text-slate-600 hover:bg-slate-50"
            @click="toggleComments(post.id)"
          >
            <span class="flex items-center gap-2">
              <MessageCircle class="w-4 h-4" />
              {{ post.commentsCount }} komentarzy
            </span>
            <component :is="expandedPosts.has(post.id) ? ChevronUp : ChevronDown" class="w-4 h-4" />
          </button>

          <!-- Comments list -->
          <div v-if="expandedPosts.has(post.id)" class="px-4 pb-4 space-y-3">
            <div v-if="loadingComments.has(post.id)" class="py-4 text-center text-slate-500">
              Ładowanie komentarzy...
            </div>

            <div
              v-for="comment in postComments[post.id]"
              :key="comment.id"
              class="flex gap-3 pl-2"
            >
              <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  v-if="comment.user.avatarUrl"
                  :src="comment.user.avatarUrl"
                  :alt="comment.user.name || 'User'"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-xs font-medium text-slate-500">
                  {{ (comment.user.name || comment.user.email)[0].toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 bg-slate-50 rounded-lg px-3 py-2">
                <div class="flex items-center gap-2 text-sm">
                  <span class="font-medium text-slate-900">
                    {{ comment.user.name || comment.user.email }}
                  </span>
                  <span v-if="comment.user.role === 'ADMIN'" class="px-1 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    Admin
                  </span>
                  <span class="text-xs text-slate-400">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-sm text-slate-700 mt-1">{{ comment.content }}</p>
              </div>
            </div>

            <!-- New comment input -->
            <div class="flex gap-2 pl-2">
              <input
                v-model="newCommentContent[post.id]"
                type="text"
                class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Napisz komentarz..."
                @keyup.enter="submitComment(post.id)"
              />
              <UiButton
                variant="secondary"
                size="sm"
                :disabled="!newCommentContent[post.id]?.trim() || isPostingComment.has(post.id)"
                @click="submitComment(post.id)"
              >
                <Send class="w-4 h-4" />
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
