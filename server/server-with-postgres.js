import 'dotenv/config'
import { createApp } from './app.js'
import { AuthModel } from './models/postgres/auth.js'
import { PostModel } from './models/postgres/post.js'
import { migrate } from './schema/migrate.js'

await migrate()

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long')
  process.exit(1)
}

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('DB_HOST, DB_USER and DB_NAME are required')
  process.exit(1)
}

createApp({ authModel: AuthModel, postModel: PostModel })
