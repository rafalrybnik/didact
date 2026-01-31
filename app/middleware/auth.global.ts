export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, user, fetchUser } = useAuth()

  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/register']
  const publicPrefixes = ['/c/', '/api/']

  const isPublicRoute = publicRoutes.includes(to.path) ||
    publicPrefixes.some(prefix => to.path.startsWith(prefix))

  // If not logged in, try to fetch user (in case of page refresh)
  if (!isLoggedIn.value) {
    await fetchUser()
  }

  // Admin routes - require admin role
  if (to.path.startsWith('/admin')) {
    if (!isLoggedIn.value) {
      return navigateTo('/login')
    }
    if (user.value?.role !== 'ADMIN') {
      return navigateTo('/')
    }
  }

  // Course player routes - require enrollment (checked on page level)
  if (to.path.startsWith('/course')) {
    if (!isLoggedIn.value) {
      return navigateTo('/login')
    }
  }

  // Account routes - require login
  if (to.path.startsWith('/account')) {
    if (!isLoggedIn.value) {
      return navigateTo('/login')
    }
  }
})
