import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID lekcji jest wymagane',
    })
  }

  // Check if lesson exists
  const existingLesson = await prisma.lesson.findUnique({
    where: { id },
  })

  if (!existingLesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie została znaleziona',
    })
  }

  // Delete lesson (cascades to progress)
  await prisma.lesson.delete({
    where: { id },
  })

  return { message: 'Lekcja została usunięta' }
})
