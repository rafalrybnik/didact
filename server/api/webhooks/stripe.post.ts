import { prisma } from '~~/server/utils/prisma'
import { getStripe } from '~~/server/utils/stripe'
import { sendEmail } from '~~/server/utils/email'
import { welcomeTemplate, accessGrantedTemplate } from '~~/server/utils/emailTemplates'
import type Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Get raw body for signature verification
  const body = await readRawBody(event)

  if (!body) {
    throw createError({
      statusCode: 400,
      message: 'Missing request body',
    })
  }

  // Verify webhook signature if secret is configured
  let stripeEvent: Stripe.Event

  if (webhookSecret) {
    const signature = getHeader(event, 'stripe-signature')

    if (!signature) {
      throw createError({
        statusCode: 400,
        message: 'Missing Stripe signature',
      })
    }

    try {
      stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err.message)
      throw createError({
        statusCode: 400,
        message: 'Invalid signature',
      })
    }
  } else {
    // In development without webhook secret, parse body directly
    stripeEvent = JSON.parse(body) as Stripe.Event
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session

      console.log('Checkout session completed:', session.id)

      // Get order by session ID with user and course info
      const order = await prisma.order.findUnique({
        where: { stripeSessionId: session.id },
        include: {
          user: { select: { id: true, email: true, name: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
      })

      if (!order) {
        console.error('Order not found for session:', session.id)
        return { received: true }
      }

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          stripePaymentId: session.payment_intent as string,
        },
      })

      // Create enrollment
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: order.courseId,
          },
        },
      })

      const isNewEnrollment = !existingEnrollment
      if (isNewEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: order.userId,
            courseId: order.courseId,
          },
        })
        console.log('Created enrollment for user:', order.userId, 'course:', order.courseId)
      }

      // Send welcome/access granted email
      const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const courseUrl = `${appUrl}/course/${order.course.slug}`

      try {
        if (isNewEnrollment) {
          // First time enrollment - welcome email
          const emailContent = welcomeTemplate({
            userName: order.user.name || '',
            courseName: order.course.title,
            courseUrl,
          })
          await sendEmail({
            to: order.user.email,
            subject: emailContent.subject,
            html: emailContent.html,
          })
          console.log('Sent welcome email to:', order.user.email)
        } else {
          // Already enrolled - access granted email
          const emailContent = accessGrantedTemplate({
            userName: order.user.name || '',
            courseName: order.course.title,
            courseUrl,
          })
          await sendEmail({
            to: order.user.email,
            subject: emailContent.subject,
            html: emailContent.html,
          })
          console.log('Sent access granted email to:', order.user.email)
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the webhook because of email
      }

      break
    }

    case 'checkout.session.expired': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session

      console.log('Checkout session expired:', session.id)

      // Update order status
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'FAILED' },
      })

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent

      console.log('Payment failed:', paymentIntent.id)

      // Update order status if we can find it
      await prisma.order.updateMany({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'FAILED' },
      })

      break
    }

    default:
      console.log('Unhandled event type:', stripeEvent.type)
  }

  return { received: true }
})
