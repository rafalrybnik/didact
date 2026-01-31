import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID kursu jest wymagane',
    })
  }

  // Check if course exists
  const existingCourse = await prisma.course.findUnique({
    where: { id },
  })

  if (!existingCourse) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  // Delete course (cascades to modules, lessons, enrollments)
  await prisma.course.delete({
    where: { id },
  })

  return { message: 'Kurs został usunięty' }
})
