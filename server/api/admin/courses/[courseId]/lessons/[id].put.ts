import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const updateLessonSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').optional(),
  moduleId: z.string().optional().nullable(),
  contentHtml: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  videoIframe: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, 'courseId')
  const id = getRouterParam(event, 'id')

  if (!courseId || !id) {
    throw createError({
      statusCode: 400,
      message: 'ID kursu i lekcji są wymagane',
    })
  }

  const body = await readBody(event)

  const result = updateLessonSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Check if lesson exists and belongs to course
  const existingLesson = await prisma.lesson.findFirst({
    where: { id, courseId },
  })

  if (!existingLesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie została znaleziona',
    })
  }

  // If moduleId is being updated, verify it exists and belongs to this course
  if (result.data.moduleId !== undefined && result.data.moduleId !== null) {
    const module = await prisma.module.findFirst({
      where: { id: result.data.moduleId, courseId },
    })

    if (!module) {
      throw createError({
        statusCode: 400,
        message: 'Moduł nie został znaleziony',
      })
    }
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data: result.data,
  })

  return { lesson }
})
