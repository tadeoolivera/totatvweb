import cors from 'cors'

const ACCEPTED_ORIGINS = [
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'https://mfqq2dls-5173.brs.devtunnels.ms'
]

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    const isAllowed = ACCEPTED_ORIGINS.includes(origin) ||
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https:\/\/[\w-]+-\d+\.brs\.devtunnels\.ms$/.test(origin)

    if (isAllowed) return callback(null, true)

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
})
