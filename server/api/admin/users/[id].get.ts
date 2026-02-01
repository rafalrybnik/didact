import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID użytkownika jest wymagane',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      enrollments: {
        select: {
          id: true,
          createdAt: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      orders: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Użytkownik nie został znaleziony',
    })
  }

  // Get all published courses for enrollment dropdown
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { title: 'asc' },
  })

  // Filter out courses user is already enrolled in
  const enrolledCourseIds = user.enrollments.map(e => e.course.id)
  const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id))

  return {
    user,
    availableCourses,
  }
})
