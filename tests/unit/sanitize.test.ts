import { describe, it, expect } from 'vitest'
import { sanitizeHtml, sanitizeVideoIframe, isValidVideoUrl } from '../../server/utils/sanitize'

describe('Sanitize Utils', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<p>Hello <strong>World</strong></p>')
    })

    it('should allow links with href', () => {
      const html = '<a href="https://example.com">Link</a>'
      const result = sanitizeHtml(html)
      expect(result).toContain('href="https://example.com"')
      expect(result).toContain('Link</a>')
    })

    it('should allow images with src', () => {
      const html = '<img src="https://example.com/image.jpg" alt="Test">'
      const result = sanitizeHtml(html)
      expect(result).toContain('src="https://example.com/image.jpg"')
      expect(result).toContain('alt="Test"')
    })

    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<p>Hello</p>')
      expect(result).not.toContain('script')
    })

    it('should remove onclick handlers', () => {
      const html = '<button onclick="alert(\'xss\')">Click</button>'
      const result = sanitizeHtml(html)
      expect(result).not.toContain('onclick')
    })

    it('should remove data attributes', () => {
      const html = '<div data-value="secret">Content</div>'
      const result = sanitizeHtml(html)
      expect(result).not.toContain('data-value')
    })

    it('should allow headings', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<h1>Title</h1><h2>Subtitle</h2>')
    })

    it('should allow lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>')
    })

    it('should allow code blocks', () => {
      const html = '<pre><code>const x = 1;</code></pre>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<pre><code>const x = 1;</code></pre>')
    })

    it('should remove style tags', () => {
      const html = '<style>body { color: red }</style><p>Text</p>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<p>Text</p>')
      expect(result).not.toContain('style')
    })
  })

  describe('sanitizeVideoIframe', () => {
    it('should allow valid iframe tags', () => {
      const iframe = '<iframe src="https://www.youtube.com/embed/123" width="560" height="315"></iframe>'
      const result = sanitizeVideoIframe(iframe)
      expect(result).toContain('<iframe')
      expect(result).toContain('src="https://www.youtube.com/embed/123"')
    })

    it('should remove non-iframe content', () => {
      const html = '<div>Text</div><iframe src="https://youtube.com"></iframe>'
      const result = sanitizeVideoIframe(html)
      expect(result).not.toContain('<div>')
      expect(result).toContain('<iframe')
    })

    it('should allow frameborder attribute', () => {
      const iframe = '<iframe src="https://youtube.com" frameborder="0"></iframe>'
      const result = sanitizeVideoIframe(iframe)
      expect(result).toContain('frameborder="0"')
    })

    it('should allow allowfullscreen', () => {
      const iframe = '<iframe src="https://youtube.com" allowfullscreen></iframe>'
      const result = sanitizeVideoIframe(iframe)
      expect(result).toContain('allowfullscreen')
    })
  })

  describe('isValidVideoUrl', () => {
    it('should accept YouTube URLs', () => {
      expect(isValidVideoUrl('https://www.youtube.com/watch?v=123')).toBe(true)
      expect(isValidVideoUrl('https://youtube.com/watch?v=123')).toBe(true)
      expect(isValidVideoUrl('https://youtu.be/123')).toBe(true)
    })

    it('should accept Vimeo URLs', () => {
      expect(isValidVideoUrl('https://vimeo.com/123')).toBe(true)
      expect(isValidVideoUrl('https://player.vimeo.com/video/123')).toBe(true)
    })

    it('should reject other URLs', () => {
      expect(isValidVideoUrl('https://example.com/video')).toBe(false)
      expect(isValidVideoUrl('https://dailymotion.com/video/123')).toBe(false)
      expect(isValidVideoUrl('https://malicious.com/fake-youtube')).toBe(false)
    })

    it('should reject invalid URLs', () => {
      expect(isValidVideoUrl('not-a-url')).toBe(false)
      expect(isValidVideoUrl('')).toBe(false)
      expect(isValidVideoUrl('javascript:alert(1)')).toBe(false)
    })
  })
})
