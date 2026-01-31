import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID strony jest wymagane',
    })
  }

  const page = await prisma.page.findUnique({
    where: { id },
  })

  if (!page) {
    throw createError({
      statusCode: 404,
      message: 'Strona nie została znaleziona',
    })
  }

  return { page }
})
