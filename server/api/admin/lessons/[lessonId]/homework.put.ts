import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const updateHomeworkSchema = z.object({
  prompt: z.string().min(1).optional(),
  allowFile: z.boolean().optional(),
  allowText: z.boolean().optional(),
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

  const homework = await prisma.homework.findUnique({
    where: { lessonId },
  })

  if (!homework) {
    throw createError({
      statusCode: 404,
      message: 'Zadanie nie istnieje',
    })
  }

  const body = await readBody(event)
  const result = updateHomeworkSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { allowFile, allowText } = result.data

  // Check if at least one would be allowed after update
  const newAllowFile = allowFile ?? homework.allowFile
  const newAllowText = allowText ?? homework.allowText

  if (!newAllowFile && !newAllowText) {
    throw createError({
      statusCode: 400,
      message: 'Musisz zezwolić na co najmniej jeden typ odpowiedzi',
    })
  }

  const updatedHomework = await prisma.homework.update({
    where: { lessonId },
    data: result.data,
  })

  return { homework: updatedHomework }
})
