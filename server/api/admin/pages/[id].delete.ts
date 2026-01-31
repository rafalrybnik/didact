import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID strony jest wymagane',
    })
  }

  // Check if page exists
  const existingPage = await prisma.page.findUnique({
    where: { id },
  })

  if (!existingPage) {
    throw createError({
      statusCode: 404,
      message: 'Strona nie została znaleziona',
    })
  }

  await prisma.page.delete({
    where: { id },
  })

  return { message: 'Strona została usunięta' }
})
