import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const createQuizSchema = z.object({
  passingScore: z.number().min(0).max(100).default(70),
  maxRetries: z.number().min(0).default(3),
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

  // Check if lesson exists
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { quiz: true },
  })

  if (!lesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie istnieje',
    })
  }

  if (lesson.quiz) {
    throw createError({
      statusCode: 400,
      message: 'Lekcja już ma quiz',
    })
  }

  const body = await readBody(event)
  const result = createQuizSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const quiz = await prisma.quiz.create({
    data: {
      lessonId,
      passingScore: result.data.passingScore,
      maxRetries: result.data.maxRetries,
    },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return { quiz }
})
