import { validatePost, validatePostUpdate } from '../schema/post.js'

export class PostController {
  constructor ({ postModel }) {
    this.postModel = postModel
  }

  getAll = async (req, res) => {
    const posts = await this.postModel.getAll()
    return res.json(posts)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.getById(id)

    if (!post) return res.status(404).json({ message: 'Post not found' })

    return res.json(post)
  }

  create = async (req, res) => {
    const result = validatePost(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const post = await this.postModel.create(result.data, req.user.id)

    return res.status(201).json(post)
  }

  update = async (req, res) => {
    const { id } = req.params
    const user = req.user

    const existing = await this.postModel.getById(id)
    if (!existing) return res.status(404).json({ message: 'Post not found' })

    if (user.role === 'admin') {
      const result = validatePostUpdate(req.body)
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
      }
      const updated = await this.postModel.update(id, result.data)
      return res.json(updated)
    }

    if (existing.author_id !== user.id) {
      return res.status(403).json({ message: 'Solo podés editar tus propias publicaciones' })
    }

    const { content } = req.body
    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'El contenido no puede estar vacío' })
    }

    const updated = await this.postModel.update(id, { content: content.trim() })
    return res.json(updated)
  }

  delete = async (req, res) => {
    const { id } = req.params
    const user = req.user

    const post = await this.postModel.getById(id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (user.role !== 'admin' && post.author_id !== user.id) {
      return res.status(403).json({ message: 'Solo podés eliminar tus propias publicaciones' })
    }

    await this.postModel.delete(id)
    return res.json({ message: 'Post deleted' })
  }
}
