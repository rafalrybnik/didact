type Role = 'ADMIN' | 'STUDENT'

interface User {
  id: string
  email: string
  name: string | null
  role: Role
  avatarUrl: string | null
  createdAt: string
}

export function useAuth() {
  // Use useState for SSR-safe state
  const user = useState<User | null>('auth-user', () => null)
  const isLoading = useState<boolean>('auth-loading', () => false)

  const isLoggedIn = computed(() => !!user.value)

  async function fetchUser(force = false) {
    // Skip if already fetched (unless forced or on server)
    if (user.value && !force && !import.meta.server) return user.value

    isLoading.value = true
    try {
      // On server, we need to forward the cookie from the original request
      const headers: Record<string, string> = {}
      if (import.meta.server) {
        const cookie = useRequestHeader('cookie')
        if (cookie) {
          headers.cookie = cookie
        }
      }

      const response = await $fetch<{ user: User }>('/api/auth/me', { headers })
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
