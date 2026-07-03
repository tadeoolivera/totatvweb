import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'totatv_auth',
  max: 10,
  idleTimeoutMillis: 30000
})

export { pool }

export class PostModel {
  static async getAll () {
    const result = await pool.query(
      `SELECT p.id, p.title, p.excerpt, p.tag, p.content, p.created_at, p.updated_at,
               p.author_id, u.username AS author_name
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC`
    )

    return result.rows
  }

  static async getById (id) {
    const result = await pool.query(
      `SELECT p.id, p.title, p.excerpt, p.tag, p.content, p.created_at, p.updated_at,
               p.author_id, u.username AS author_name
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = $1`,
      [id]
    )

    return result.rows[0] || null
  }

  static async create ({ title, content, excerpt, tag }, authorId) {
    const result = await pool.query(
      `INSERT INTO posts (title, content, excerpt, tag, author_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, excerpt, tag, content, created_at`,
      [title, content, excerpt || null, tag || null, authorId]
    )

    return result.rows[0]
  }

  static async update (id, { title, content, excerpt, tag }) {
    const fields = []
    const values = []
    let idx = 1

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title) }
    if (content !== undefined) { fields.push(`content = $${idx++}`); values.push(content) }
    if (excerpt !== undefined) { fields.push(`excerpt = $${idx++}`); values.push(excerpt || null) }
    if (tag !== undefined) { fields.push(`tag = $${idx++}`); values.push(tag || null) }

    if (fields.length === 0) return null

    values.push(id)

    const result = await pool.query(
      `UPDATE posts SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING id, title, excerpt, tag, content, created_at, updated_at`,
      values
    )

    return result.rows[0] || null
  }

  static async delete (id) {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 RETURNING id',
      [id]
    )

    return result.rows.length > 0
  }
}
