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

  const homework = await prisma.homework.findUnique({
    where: { lessonId },
  })

  if (!homework) {
    throw createError({
      statusCode: 404,
      message: 'Zadanie nie istnieje',
    })
  }

  await prisma.homework.delete({
    where: { lessonId },
  })

  return { success: true }
})
