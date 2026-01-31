import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { sanitizeHtml } from '~~/server/utils/sanitize'

const createPostSchema = z.object({
  content: z.string().min(1, 'Treść jest wymagana').max(5000),
  imageUrl: z.string().url().optional(),
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

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Brak slug kursu',
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

  // Check enrollment (admins can also post)
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

  const body = await readBody(event)
  const result = createPostSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const post = await prisma.post.create({
    data: {
      courseId: course.id,
      userId: auth.userId,
      content: result.data.content,
      imageUrl: result.data.imageUrl || null,
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

  return {
    post: {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      user: post.user,
      commentsCount: 0,
    },
  }
})
