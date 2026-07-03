import 'dotenv/config'
import { createApp } from './app.js'
import { AuthModel } from './models/postgres/auth.js'
import { PostModel } from './models/postgres/post.js'
import { migrate } from './schema/migrate.js'

await migrate()

createApp({ authModel: AuthModel, postModel: PostModel })
