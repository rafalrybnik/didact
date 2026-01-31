import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  const lessonId = getRouterParam(event, 'lessonId')
  if (!lessonId) {
    throw createError({
      statusCode: 400,
      message: 'Brak ID lekcji',
    })
  }

  // Check if quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
  })

  if (!quiz) {
    throw createError({
      statusCode: 404,
      message: 'Quiz nie istnieje',
    })
  }

  await prisma.quiz.delete({
    where: { lessonId },
  })

  return { success: true }
})
