/**
 * Base HTML template wrapper
 */
function baseTemplate(content: string): string {
  const appName = process.env.NUXT_PUBLIC_APP_NAME || 'Didact'

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 32px;
    }
    .logo {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo h1 {
      color: #6366f1;
      font-size: 24px;
      margin: 0;
    }
    h2 {
      color: #1e293b;
      font-size: 20px;
      margin: 0 0 16px 0;
    }
    p {
      margin: 0 0 16px 0;
    }
    .button {
      display: inline-block;
      background: #6366f1;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background: #4f46e5;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      color: #64748b;
      font-size: 14px;
    }
    .highlight {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .code {
      font-family: monospace;
      font-size: 24px;
      letter-spacing: 4px;
      color: #6366f1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>${appName}</h1>
      </div>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${appName}. Wszystkie prawa zastrzeżone.</p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Password reset email template
 */
export function passwordResetTemplate(data: {
  userName: string
  resetUrl: string
  expiresInMinutes: number
}): { subject: string; html: string } {
  const content = `
    <h2>Resetowanie hasła</h2>
    <p>Cześć${data.userName ? ` ${data.userName}` : ''},</p>
    <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta. Kliknij poniższy przycisk, aby ustawić nowe hasło:</p>
    <p style="text-align: center;">
      <a href="${data.resetUrl}" class="button">Resetuj hasło</a>
    </p>
    <p>Link wygaśnie za <strong>${data.expiresInMinutes} minut</strong>.</p>
    <p>Jeśli to nie Ty prosiłeś o reset hasła, zignoruj tę wiadomość.</p>
    <div class="highlight">
      <p style="margin: 0; font-size: 14px;">Jeśli przycisk nie działa, skopiuj i wklej ten link:</p>
      <p style="margin: 8px 0 0 0; word-break: break-all; font-size: 12px;">${data.resetUrl}</p>
    </div>
  `

  return {
    subject: 'Resetowanie hasła',
    html: baseTemplate(content),
  }
}

/**
 * Welcome email after purchase
 */
export function welcomeTemplate(data: {
  userName: string
  courseName: string
  courseUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2>Witaj w kursie!</h2>
    <p>Cześć${data.userName ? ` ${data.userName}` : ''},</p>
    <p>Dziękujemy za zakup kursu <strong>${data.courseName}</strong>!</p>
    <p>Twój dostęp jest już aktywny. Możesz rozpocząć naukę w dowolnym momencie.</p>
    <p style="text-align: center;">
      <a href="${data.courseUrl}" class="button">Rozpocznij kurs</a>
    </p>
    <p>Życzymy owocnej nauki!</p>
  `

  return {
    subject: `Witaj w kursie: ${data.courseName}`,
    html: baseTemplate(content),
  }
}

/**
 * Homework graded notification
 */
export function homeworkGradedTemplate(data: {
  userName: string
  lessonName: string
  courseName: string
  status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'
  feedback?: string
  lessonUrl: string
}): { subject: string; html: string } {
  const statusMap = {
    APPROVED: { text: 'Zaakceptowane', color: '#22c55e' },
    REJECTED: { text: 'Odrzucone', color: '#ef4444' },
    NEEDS_REVISION: { text: 'Do poprawy', color: '#f59e0b' },
  }

  const statusInfo = statusMap[data.status]

  const content = `
    <h2>Twoje zadanie zostało ocenione</h2>
    <p>Cześć${data.userName ? ` ${data.userName}` : ''},</p>
    <p>Twoje zadanie z lekcji <strong>${data.lessonName}</strong> w kursie <strong>${data.courseName}</strong> zostało ocenione.</p>
    <div class="highlight">
      <p style="margin: 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: 600;">${statusInfo.text}</span></p>
      ${data.feedback ? `<p style="margin: 12px 0 0 0;"><strong>Komentarz:</strong><br>${data.feedback}</p>` : ''}
    </div>
    <p style="text-align: center;">
      <a href="${data.lessonUrl}" class="button">Zobacz szczegóły</a>
    </p>
  `

  return {
    subject: `Zadanie ocenione: ${data.lessonName}`,
    html: baseTemplate(content),
  }
}

/**
 * Access granted (for existing users who purchase another course)
 */
export function accessGrantedTemplate(data: {
  userName: string
  courseName: string
  courseUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2>Dostęp przyznany</h2>
    <p>Cześć${data.userName ? ` ${data.userName}` : ''},</p>
    <p>Zostałeś zapisany do kursu <strong>${data.courseName}</strong>!</p>
    <p>Możesz rozpocząć naukę w dowolnym momencie.</p>
    <p style="text-align: center;">
      <a href="${data.courseUrl}" class="button">Przejdź do kursu</a>
    </p>
  `

  return {
    subject: `Dostęp do kursu: ${data.courseName}`,
    html: baseTemplate(content),
  }
}
