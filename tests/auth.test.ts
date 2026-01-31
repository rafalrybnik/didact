import { describe, it, expect } from 'vitest'
import bcrypt from 'bcrypt'

// Test password hashing directly (since utils use runtime config)
describe('Password Utils', () => {
  const SALT_ROUNDS = 10

  it('should hash a password', async () => {
    const password = 'testPassword123'
    const hash = await bcrypt.hash(password, SALT_ROUNDS)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(50)
  })

  it('should verify correct password', async () => {
    const password = 'testPassword123'
    const hash = await bcrypt.hash(password, SALT_ROUNDS)

    const isValid = await bcrypt.compare(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'testPassword123'
    const wrongPassword = 'wrongPassword'
    const hash = await bcrypt.hash(password, SALT_ROUNDS)

    const isValid = await bcrypt.compare(wrongPassword, hash)
    expect(isValid).toBe(false)
  })
})

// Test JWT functionality
describe('JWT Utils', () => {
  const jwt = require('jsonwebtoken')
  const secret = 'test-secret'

  it('should sign and verify a token', () => {
    const payload = {
      userId: 'user123',
      email: 'test@example.com',
      role: 'STUDENT',
    }

    const token = jwt.sign(payload, secret, { expiresIn: '1h' })
    expect(token).toBeDefined()

    const decoded = jwt.verify(token, secret)
    expect(decoded.userId).toBe(payload.userId)
    expect(decoded.email).toBe(payload.email)
    expect(decoded.role).toBe(payload.role)
  })

  it('should reject invalid token', () => {
    const token = 'invalid.token.here'

    expect(() => {
      jwt.verify(token, secret)
    }).toThrow()
  })

  it('should reject expired token', () => {
    const payload = { userId: 'user123' }
    const token = jwt.sign(payload, secret, { expiresIn: '-1s' })

    expect(() => {
      jwt.verify(token, secret)
    }).toThrow()
  })
})
