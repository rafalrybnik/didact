import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const createHomeworkSchema = z.object({
  prompt: z.string().min(1, 'Treść zadania jest wymagana'),
  allowFile: z.boolean().default(true),
  allowText: z.boolean().default(true),
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
    include: { homework: true },
  })

  if (!lesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie istnieje',
    })
  }

  if (lesson.homework) {
    throw createError({
      statusCode: 400,
      message: 'Lekcja już ma zadanie domowe',
    })
  }

  const body = await readBody(event)
  const result = createHomeworkSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { prompt, allowFile, allowText } = result.data

  // At least one must be allowed
  if (!allowFile && !allowText) {
    throw createError({
      statusCode: 400,
      message: 'Musisz zezwolić na co najmniej jeden typ odpowiedzi',
    })
  }

  const homework = await prisma.homework.create({
    data: {
      lessonId,
      prompt,
      allowFile,
      allowText,
    },
  })

  return { homework }
})
