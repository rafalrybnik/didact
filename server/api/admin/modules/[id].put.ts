import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const updateModuleSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').optional(),
  order: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID modułu jest wymagane',
    })
  }

  const body = await readBody(event)

  const result = updateModuleSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Check if module exists
  const existingModule = await prisma.module.findUnique({
    where: { id },
  })

  if (!existingModule) {
    throw createError({
      statusCode: 404,
      message: 'Moduł nie został znaleziony',
    })
  }

  const module = await prisma.module.update({
    where: { id },
    data: result.data,
  })

  return { module }
})
