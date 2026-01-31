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

  // Check if lesson exists and belongs to course
  const existingLesson = await prisma.lesson.findFirst({
    where: { id, courseId },
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
