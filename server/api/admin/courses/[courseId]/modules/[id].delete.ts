import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, 'courseId')
  const id = getRouterParam(event, 'id')

  if (!courseId || !id) {
    throw createError({
      statusCode: 400,
      message: 'ID kursu i modułu są wymagane',
    })
  }

  // Check if module exists and belongs to course
  const existingModule = await prisma.module.findFirst({
    where: { id, courseId },
  })

  if (!existingModule) {
    throw createError({
      statusCode: 404,
      message: 'Moduł nie został znaleziony',
    })
  }

  // Delete module (lessons will have moduleId set to null via onDelete: SetNull)
  await prisma.module.delete({
    where: { id },
  })

  return { message: 'Moduł został usunięty' }
})
