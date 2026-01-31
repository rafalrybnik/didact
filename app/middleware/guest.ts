// Middleware for pages that should only be accessible to guests (not logged in)
export default defineNuxtRouteMiddleware(async () => {
  const { isLoggedIn, fetchUser } = useAuth()

  // Try to fetch user if not already loaded
  if (!isLoggedIn.value) {
    await fetchUser()
  }

  // If logged in, redirect to home
  if (isLoggedIn.value) {
    return navigateTo('/')
  }
})
