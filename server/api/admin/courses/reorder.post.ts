import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const reorderSchema = z.object({
  courseId: z.string().min(1, 'ID kursu jest wymagane'),
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
  const body = await readBody(event)

  const result = reorderSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { courseId, modules, lessons } = result.data

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

  // Update modules order
  if (modules && modules.length > 0) {
    await prisma.$transaction(
      modules.map((m) =>
        prisma.module.update({
          where: { id: m.id },
          data: { order: m.order },
        })
      )
    )
  }

  // Update lessons order and moduleId
  if (lessons && lessons.length > 0) {
    await prisma.$transaction(
      lessons.map((l) =>
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
