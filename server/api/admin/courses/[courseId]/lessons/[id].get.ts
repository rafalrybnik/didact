import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, 'courseId')
  const id = getRouterParam(event, 'id')

  if (!courseId || !id) {
    throw createError({
      statusCode: 400,
      message: 'ID kursu i lekcji są wymagane',
    })
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id, courseId },
    include: {
      module: true,
    },
  })

  if (!lesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie została znaleziona',
    })
  }

  return { lesson }
})
