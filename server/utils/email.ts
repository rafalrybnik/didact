import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Create transporter based on environment
function createTransporter(): Transporter {
  const host = process.env.SMTP_HOST || 'localhost'
  const port = parseInt(process.env.SMTP_PORT || '1025', 10)
  const secure = process.env.SMTP_TLS === 'true'
  const user = process.env.SMTP_USERNAME
  const pass = process.env.SMTP_PASSWORD

  // Development: Mailhog (no auth)
  if (!user || !pass) {
    console.log('[Email] Using Mailhog (development mode)')
    return nodemailer.createTransport({
      host,
      port,
      secure: false,
    })
  }

  // Production: Real SMTP with auth
  console.log(`[Email] Using SMTP: ${host}:${port}`)
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

// Singleton transporter
let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransporter()
  }
  return transporter
}

// Get sender info from environment
function getFromAddress(): string {
  const name = process.env.MAIL_FROM_NAME || 'Didact'
  const email = process.env.MAIL_FROM_ADDRESS || 'noreply@localhost'
  return `"${name}" <${email}>`
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter()

    const info = await transport.sendMail({
      from: getFromAddress(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    })

    console.log(`[Email] Sent to ${options.to}: ${info.messageId}`)
    return true
  } catch (error) {
    console.error('[Email] Failed to send:', error)
    return false
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transport = getTransporter()
    await transport.verify()
    console.log('[Email] Connection verified')
    return true
  } catch (error) {
    console.error('[Email] Connection failed:', error)
    return false
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
