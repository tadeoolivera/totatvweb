import pg from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'totatv_auth',
  max: 10,
  idleTimeoutMillis: 30000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
})

const SALT_ROUNDS = 12
const ACCESS_TOKEN_EXPIRY = '60m'
const REFRESH_TOKEN_EXPIRY_DAYS = 7

export class AuthModel {
  static async register ({ username, email, password }) {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    )

    if (existingUser.rows.length > 0) {
      return null
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash]
    )

    return result.rows[0]
  }

  static async login ({ email, password }) {
    const result = await pool.query(
      'SELECT id, username, email, role, password_hash FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) return null

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) return null

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  }

  static async getUserById (id) {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [id]
    )

    return result.rows[0] || null
  }

  static generateAccessToken (user) {
    return jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )
  }

  static async generateRefreshToken (userId) {
    const token = crypto.randomBytes(40).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    )

    return token
  }

  static async refreshAccessToken (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const result = await pool.query(
      `SELECT rt.id, rt.user_id, u.username, u.email, u.role
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1
         AND rt.revoked = FALSE
         AND rt.expires_at > NOW()`,
      [tokenHash]
    )

    if (result.rows.length === 0) return null

    const tokenData = result.rows[0]

    await pool.query(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1',
      [tokenData.id]
    )

    const user = {
      id: tokenData.user_id,
      username: tokenData.username,
      email: tokenData.email,
      role: tokenData.role
    }

    const newAccessToken = AuthModel.generateAccessToken(user)
    const newRefreshToken = await AuthModel.generateRefreshToken(user.id)

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user }
  }

  static async logout (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    await pool.query(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1',
      [tokenHash]
    )
  }

  static async logoutAll (userId) {
    await pool.query(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1',
      [userId]
    )
  }
}
