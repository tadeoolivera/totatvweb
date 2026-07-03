import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { corsMiddleware } from './middlewares/cors.js'
import { createAuthRouter } from './routes/auth.js'
import { createPostRouter } from './routes/post.js'

export const createApp = ({ authModel, postModel }) => {
  const app = express()

  app.use(helmet())
  app.use(corsMiddleware)
  app.use(express.json({ limit: '10kb' }))
  app.use(cookieParser())
  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use('/auth', createAuthRouter({ authModel }))
  app.use('/posts', createPostRouter({ postModel, authModel }))

  const desiredPort = process.env.PORT ?? 3000

  app.listen(desiredPort, () => console.log(`Server listening on http://localhost:${desiredPort}`))
}
