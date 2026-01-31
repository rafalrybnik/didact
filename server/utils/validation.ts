import { z } from 'zod'

/**
 * Optional URL validator that accepts:
 * - Empty string
 * - null/undefined
 * - Valid HTTP/HTTPS URLs
 * - Relative URLs starting with /
 */
export const optionalUrl = z.string().refine(
  (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Nieprawidłowy URL' }
).optional().nullable()

/**
 * Required URL validator that accepts:
 * - Valid HTTP/HTTPS URLs
 * - Relative URLs starting with /
 */
export const requiredUrl = z.string().refine(
  (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Nieprawidłowy URL' }
)
