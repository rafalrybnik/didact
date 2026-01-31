import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID modułu jest wymagane',
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

  // Delete module (lessons will have moduleId set to null via onDelete: SetNull)
  await prisma.module.delete({
    where: { id },
  })

  return { message: 'Moduł został usunięty' }
})
