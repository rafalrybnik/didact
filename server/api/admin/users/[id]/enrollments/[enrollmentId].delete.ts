import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  const enrollmentId = getRouterParam(event, 'enrollmentId')

  if (!userId || !enrollmentId) {
    throw createError({
      statusCode: 400,
      message: 'ID użytkownika i enrollmentu są wymagane',
    })
  }

  // Check if enrollment exists and belongs to the user
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  })

  if (!enrollment) {
    throw createError({
      statusCode: 404,
      message: 'Zapis nie został znaleziony',
    })
  }

  if (enrollment.userId !== userId) {
    throw createError({
      statusCode: 403,
      message: 'Zapis nie należy do tego użytkownika',
    })
  }

  // Delete related progress records first
  await prisma.progress.deleteMany({
    where: {
      enrollment: {
        id: enrollmentId,
      },
    },
  })

  // Delete quiz attempts
  await prisma.quizAttempt.deleteMany({
    where: {
      enrollment: {
        id: enrollmentId,
      },
    },
  })

  // Delete enrollment
  await prisma.enrollment.delete({
    where: { id: enrollmentId },
  })

  return { success: true }
})
