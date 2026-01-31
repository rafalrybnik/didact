import jwt from 'jsonwebtoken'
import type { Role } from '@prisma/client'

export interface JwtPayload {
  userId: string
  email: string
  role: Role
}

const config = useRuntimeConfig()

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload
  } catch {
    return null
  }
}
