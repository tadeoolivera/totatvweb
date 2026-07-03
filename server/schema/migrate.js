import { pool } from '../models/postgres/post.js'

export async function migrate () {
  try {
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS tag VARCHAR(20)`)
    console.log('[migrate] posts.tag column ready')
  } catch (err) {
    console.error('[migrate] failed:', err.message)
    throw err
  }
}
