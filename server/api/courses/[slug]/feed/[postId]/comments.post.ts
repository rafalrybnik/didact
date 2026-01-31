import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const createCommentSchema = z.object({
  content: z.string().min(1, 'Treść jest wymagana').max(2000),
})

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

  // Check enrollment (admins can also comment)
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

  // Check if post exists
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      courseId: course.id,
    },
  })

  if (!post) {
    throw createError({
      statusCode: 404,
      message: 'Post nie istnieje',
    })
  }

  const body = await readBody(event)
  const result = createCommentSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: auth.userId,
      content: result.data.content,
    },
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
  })

  return { comment }
})
