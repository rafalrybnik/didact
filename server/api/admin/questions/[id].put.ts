import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const updateQuestionSchema = z.object({
  questionText: z.string().min(1).optional(),
  options: z.array(z.string()).min(2).max(6).optional(),
  correctOption: z.number().min(0).optional(),
  order: z.number().min(0).optional(),
})

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

  const body = await readBody(event)
  const result = updateQuestionSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { options, correctOption } = result.data

  // Validate correctOption if both are provided
  if (options && correctOption !== undefined && correctOption >= options.length) {
    throw createError({
      statusCode: 400,
      message: 'Nieprawidłowy indeks poprawnej odpowiedzi',
    })
  }

  // Validate correctOption against existing options if only correctOption is provided
  if (correctOption !== undefined && !options) {
    const existingOptions = question.options as string[]
    if (correctOption >= existingOptions.length) {
      throw createError({
        statusCode: 400,
        message: 'Nieprawidłowy indeks poprawnej odpowiedzi',
      })
    }
  }

  const updatedQuestion = await prisma.question.update({
    where: { id },
    data: result.data,
  })

  return { question: updatedQuestion }
})
