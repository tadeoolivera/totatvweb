import z from 'zod'

const registerSchema = z.object({
  username: z.string({
    required_error: 'Username is required'
  }).min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .trim(),

  email: z.string({
    required_error: 'Email is required'
  }).email('Invalid email format')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),

  password: z.string({
    required_error: 'Password is required'
  }).min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
})

const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required'
  }).email('Invalid email format')
    .trim()
    .toLowerCase(),

  password: z.string({
    required_error: 'Password is required'
  })
})

export function validateRegister (object) {
  return registerSchema.safeParse(object)
}

export function validateLogin (object) {
  return loginSchema.safeParse(object)
}
