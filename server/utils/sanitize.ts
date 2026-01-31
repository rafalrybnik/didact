import DOMPurify from 'isomorphic-dompurify'

// Sanitize HTML content (for course content, sales descriptions, etc.)
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 'u', 's', 'strike',
      'a', 'blockquote', 'code', 'pre',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'title', 'width', 'height',
      'class', 'id',
    ],
    ALLOW_DATA_ATTR: false,
  })
}

// Sanitize video iframe (for YouTube/Vimeo embeds)
export function sanitizeVideoIframe(iframe: string): string {
  return DOMPurify.sanitize(iframe, {
    ALLOWED_TAGS: ['iframe'],
    ALLOWED_ATTR: [
      'src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen',
      'title', 'loading',
    ],
    ADD_ATTR: ['allow'],
  })
}

// Check if URL is a valid video embed URL
export function isValidVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const validHosts = [
      'www.youtube.com',
      'youtube.com',
      'youtu.be',
      'player.vimeo.com',
      'vimeo.com',
    ]
    return validHosts.includes(parsed.hostname)
  } catch {
    return false
  }
}
