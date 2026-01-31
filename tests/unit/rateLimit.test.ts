import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, createAuthRateLimiter } from '../../server/utils/rateLimit'

describe('Rate Limit Utils', () => {
  beforeEach(() => {
    // Reset the rate limit store between tests
    vi.useFakeTimers()
  })

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const config = { maxRequests: 5, windowMs: 60000 }

      const result1 = checkRateLimit('test-key-1', config)
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(4)

      const result2 = checkRateLimit('test-key-1', config)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(3)
    })

    it('should block requests exceeding limit', () => {
      const config = { maxRequests: 3, windowMs: 60000 }

      // Use up all requests
      checkRateLimit('test-key-2', config)
      checkRateLimit('test-key-2', config)
      checkRateLimit('test-key-2', config)

      // This should be blocked
      const result = checkRateLimit('test-key-2', config)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should use separate limits for different keys', () => {
      const config = { maxRequests: 2, windowMs: 60000 }

      checkRateLimit('user-a', config)
      checkRateLimit('user-a', config)

      // user-a is now at limit
      const resultA = checkRateLimit('user-a', config)
      expect(resultA.allowed).toBe(false)

      // user-b should still have requests available
      const resultB = checkRateLimit('user-b', config)
      expect(resultB.allowed).toBe(true)
    })

    it('should reset after window expires', () => {
      const config = { maxRequests: 2, windowMs: 60000 }

      checkRateLimit('test-key-3', config)
      checkRateLimit('test-key-3', config)

      // At limit
      expect(checkRateLimit('test-key-3', config).allowed).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(61000)

      // Should be allowed again
      const result = checkRateLimit('test-key-3', config)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
    })

    it('should return correct resetAt timestamp', () => {
      const config = { maxRequests: 5, windowMs: 60000 }
      const now = Date.now()

      const result = checkRateLimit('test-key-4', config)
      expect(result.resetAt).toBeGreaterThan(now)
      expect(result.resetAt).toBeLessThanOrEqual(now + config.windowMs)
    })
  })

  describe('createAuthRateLimiter', () => {
    it('should create a rate limiter with auth defaults', () => {
      const limiter = createAuthRateLimiter()
      const result = limiter.check('192.168.1.1')

      expect(result.allowed).toBe(true)
      // Auth limiter allows 10 requests per minute
      expect(result.remaining).toBe(9)
    })

    it('should block after 10 requests', () => {
      const limiter = createAuthRateLimiter()
      const ip = '192.168.1.2'

      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        limiter.check(ip)
      }

      // 11th request should be blocked
      const result = limiter.check(ip)
      expect(result.allowed).toBe(false)
    })

    it('should prefix key with auth:', () => {
      const limiter = createAuthRateLimiter()

      // This tests implementation detail but ensures proper namespacing
      const result1 = limiter.check('test-ip')
      const result2 = checkRateLimit('auth:test-ip', { maxRequests: 10, windowMs: 60000 })

      // Second call should show reduced remaining
      expect(result2.remaining).toBe(8)
    })
  })
})
