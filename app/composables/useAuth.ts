import type { Role } from '@prisma/client'

interface User {
  id: string
  email: string
  name: string | null
  role: Role
  avatarUrl: string | null
  createdAt: string
}

const user = ref<User | null>(null)
const isLoading = ref(false)

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value)

  async function fetchUser() {
    if (user.value) return user.value

    isLoading.value = true
    try {
      const response = await $fetch<{ user: User }>('/api/auth/me')
      user.value = response.user
      return user.value
    } catch {
      user.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string) {
    const response = await $fetch<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = response.user
    return response.user
  }

  async function register(email: string, password: string, name?: string) {
    const response = await $fetch<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: { email, password, name },
    })
    user.value = response.user
    return response.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return {
    user: readonly(user),
    isLoggedIn,
    isLoading: readonly(isLoading),
    fetchUser,
    login,
    register,
    logout,
  }
}
