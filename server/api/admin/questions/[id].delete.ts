import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Brak ID pytania',
    })
  }

  const question = await prisma.question.findUnique({
    where: { id },
  })

  if (!question) {
    throw createError({
      statusCode: 404,
      message: 'Pytanie nie istnieje',
    })
  }

  await prisma.question.delete({
    where: { id },
  })

  return { success: true }
})
