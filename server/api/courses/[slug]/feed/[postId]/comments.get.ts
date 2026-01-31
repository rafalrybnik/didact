import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  const slug = getRouterParam(event, 'slug')
  const postId = getRouterParam(event, 'postId')

  if (!slug || !postId) {
    throw createError({
      statusCode: 400,
      message: 'Brak wymaganych parametrów',
    })
  }

  // Check course and enrollment
  const course = await prisma.course.findUnique({
    where: { slug },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie istnieje',
    })
  }

  // Check enrollment (admins can also view)
  if (auth.role !== 'ADMIN') {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: auth.userId,
          courseId: course.id,
        },
      },
    })

    if (!enrollment) {
      throw createError({
        statusCode: 403,
        message: 'Nie masz dostępu do tego kursu',
      })
    }
  }

  // Get comments
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return { comments }
})
