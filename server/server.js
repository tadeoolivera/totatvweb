import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env') })

import { createApp } from './app.js'
import { AuthModel } from './models/postgres/auth.js'
import { PostModel } from './models/postgres/post.js'
import { migrate } from './schema/migrate.js'

await migrate()

createApp({ authModel: AuthModel, postModel: PostModel })
