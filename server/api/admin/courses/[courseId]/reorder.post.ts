import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const reorderSchema = z.object({
  modules: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0),
  })).optional(),
  lessons: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0),
    moduleId: z.string().optional().nullable(),
  })).optional(),
})

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, 'courseId')

  if (!courseId) {
    throw createError({
      statusCode: 400,
      message: 'ID kursu jest wymagane',
    })
  }

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  const body = await readBody(event)

  const result = reorderSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Update modules order
  if (result.data.modules && result.data.modules.length > 0) {
    await prisma.$transaction(
      result.data.modules.map((m) =>
        prisma.module.update({
          where: { id: m.id },
          data: { order: m.order },
        })
      )
    )
  }

  // Update lessons order and moduleId
  if (result.data.lessons && result.data.lessons.length > 0) {
    await prisma.$transaction(
      result.data.lessons.map((l) =>
        prisma.lesson.update({
          where: { id: l.id },
          data: {
            order: l.order,
            moduleId: l.moduleId,
          },
        })
      )
    )
  }

  return { message: 'Kolejność została zaktualizowana' }
})
