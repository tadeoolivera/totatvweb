import z from 'zod'

const postSchema = z.object({
  title: z.string({
    required_error: 'Title is required'
  }).min(1, 'Title cannot be empty')
    .max(255, 'Title is too long')
    .trim(),

  content: z.string({
    required_error: 'Content is required'
  }).min(1, 'Content cannot be empty')
    .max(10000, 'Content is too long')
    .trim(),

  excerpt: z.string()
    .max(500, 'Excerpt is too long')
    .trim()
    .optional(),

  tag: z.string()
    .max(20, 'Tag is too long')
    .trim()
    .optional()
})

const postUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title is too long')
    .trim()
    .optional(),

  content: z.string()
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content is too long')
    .trim()
    .optional(),

  excerpt: z.string()
    .max(500, 'Excerpt is too long')
    .trim()
    .optional(),

  tag: z.string()
    .max(20, 'Tag is too long')
    .trim()
    .optional()
})

export function validatePost (object) {
  return postSchema.safeParse(object)
}

export function validatePostUpdate (object) {
  return postUpdateSchema.safeParse(object)
}
