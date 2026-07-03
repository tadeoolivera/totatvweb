import { validateRegister, validateLogin } from '../schema/auth.js'

export class AuthController {
  constructor ({ authModel }) {
    this.authModel = authModel
  }

  register = async (req, res) => {
    const result = validateRegister(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const user = await this.authModel.register(result.data)

    if (!user) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const accessToken = this.authModel.generateAccessToken(user)
    const refreshToken = await this.authModel.generateRefreshToken(user.id)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(201).json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      accessToken
    })
  }

  login = async (req, res) => {
    const result = validateLogin(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const user = await this.authModel.login(result.data)

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const accessToken = this.authModel.generateAccessToken(user)
    const refreshToken = await this.authModel.generateRefreshToken(user.id)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      accessToken
    })
  }

  refresh = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' })
    }

    const result = await this.authModel.refreshAccessToken(refreshToken)

    if (!result) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      user: { id: result.user.id, username: result.user.username, email: result.user.email, role: result.user.role },
      accessToken: result.accessToken
    })
  }

  logout = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (refreshToken) {
      await this.authModel.logout(refreshToken)
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return res.json({ message: 'Logged out successfully' })
  }

  me = async (req, res) => {
    const user = await this.authModel.getUserById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({ user })
  }
}
