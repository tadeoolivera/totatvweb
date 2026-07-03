import jwt from 'jsonwebtoken'

export const authenticate = (authModel) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await authModel.getUserById(decoded.id)
      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }
      req.user = user
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' })
      }
      return res.status(401).json({ message: 'Invalid token' })
    }
  }
}
