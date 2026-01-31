import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  const postId = getRouterParam(event, 'postId')

  if (!postId) {
    throw createError({
      statusCode: 400,
      message: 'Brak ID posta',
    })
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  })

  if (!post) {
    throw createError({
      statusCode: 404,
      message: 'Post nie istnieje',
    })
  }

  await prisma.post.delete({
    where: { id: postId },
  })

  return { success: true }
})
