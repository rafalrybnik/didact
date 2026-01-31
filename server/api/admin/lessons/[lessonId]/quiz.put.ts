import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const updateQuizSchema = z.object({
  passingScore: z.number().min(0).max(100).optional(),
  maxRetries: z.number().min(0).optional(),
})

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

  const body = await readBody(event)
  const result = updateQuizSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const updatedQuiz = await prisma.quiz.update({
    where: { lessonId },
    data: result.data,
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return { quiz: updatedQuiz }
})
