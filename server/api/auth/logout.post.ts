export default defineEventHandler(async (event) => {
  // Clear the auth cookie
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return {
    message: 'Wylogowanie zakończone sukcesem',
  }
})
