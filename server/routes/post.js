import { Router } from 'express'
import { PostController } from '../controllers/post.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/authorize.js'

export const createPostRouter = ({ postModel, authModel }) => {
  const postController = new PostController({ postModel })
  const postRouter = Router()

  postRouter.get('/', postController.getAll)
  postRouter.get('/:id', postController.getById)
  postRouter.post('/', authenticate(authModel), authorize('editor', 'admin'), postController.create)
  postRouter.patch('/:id', authenticate(authModel), authorize('editor', 'admin'), postController.update)
  postRouter.delete('/:id', authenticate(authModel), authorize('editor', 'admin'), postController.delete)

  return postRouter
}
