import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { AuthController } from '../controllers/auth.js'
import { authenticate } from '../middlewares/auth.js'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' }
})

export const createAuthRouter = ({ authModel }) => {
  const authController = new AuthController({ authModel })
  const authRouter = Router()

  authRouter.use(authLimiter)

  authRouter.post('/register', authController.register)
  authRouter.post('/login', authController.login)
  authRouter.post('/refresh', authController.refresh)
  authRouter.post('/logout', authController.logout)
  authRouter.get('/me', authenticate(authModel), authController.me)

  return authRouter
}
