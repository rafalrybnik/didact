import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const createQuestionSchema = z.object({
  questionText: z.string().min(1, 'Treść pytania jest wymagana'),
  options: z.array(z.string()).min(2, 'Minimum 2 opcje').max(6, 'Maksimum 6 opcji'),
  correctOption: z.number().min(0),
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
    include: { questions: true },
  })

  if (!quiz) {
    throw createError({
      statusCode: 404,
      message: 'Quiz nie istnieje',
    })
  }

  const body = await readBody(event)
  const result = createQuestionSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { questionText, options, correctOption } = result.data

  // Validate correctOption is within bounds
  if (correctOption >= options.length) {
    throw createError({
      statusCode: 400,
      message: 'Nieprawidłowy indeks poprawnej odpowiedzi',
    })
  }

  // Get next order number
  const maxOrder = quiz.questions.length > 0
    ? Math.max(...quiz.questions.map(q => q.order))
    : -1

  const question = await prisma.question.create({
    data: {
      quizId: quiz.id,
      questionText,
      options,
      correctOption,
      order: maxOrder + 1,
    },
  })

  return { question }
})
