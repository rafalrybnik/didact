import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID lekcji jest wymagane',
    })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
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
