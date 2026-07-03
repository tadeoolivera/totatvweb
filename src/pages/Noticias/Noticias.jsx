import { useState, useEffect } from 'react'
import { marked } from 'marked'
import { useAuth } from '../../context/useAuth.js'
import { postService } from '../../services/post.js'
import './Noticias.css'

const Noticias = () => {
  const { user, accessToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [deleting, setDeleting] = useState(null)
  const [preview, setPreview] = useState(null)

  const canCreate = user?.role && ['editor', 'admin'].includes(user.role)
  const isAdmin = user?.role === 'admin'

  const canModify = (post) => isAdmin || (user?.role === 'editor' && post.author_id === user.id)

  const loadPosts = async () => {
    try {
      const data = await postService.getAll()
      setPosts(data)
    } catch {
      setError('Error al cargar las publicaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPosts() }, [])

  const [createForm, setCreateForm] = useState({ title: '', content: '', excerpt: '', tag: '' })

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { title, content, excerpt, tag } = createForm

    try {
      await postService.create(title, content, excerpt || undefined, tag || undefined, accessToken)
      setCreateForm({ title: '', content: '', excerpt: '', tag: '' })
      setShowForm(false)
      await loadPosts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return
    setDeleting(postId)
    setError('')
    try {
      await postService.delete(postId, accessToken)
      await loadPosts()
      if (selectedPost?.id === postId) setSelectedPost(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const startEditing = (post) => {
    setEditForm({ title: post.title, content: post.content, excerpt: post.excerpt || '', tag: post.tag || '' })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const body = isAdmin
        ? { title: editForm.title, content: editForm.content, excerpt: editForm.excerpt || undefined, tag: editForm.tag || undefined }
        : { content: editForm.content }
      await postService.update(selectedPost.id, body, accessToken)
      setIsEditing(false)
      setEditForm({})
      await loadPosts()
      const updated = await postService.getById(selectedPost.id)
      setSelectedPost(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="default noticias">
        <div className="bg" />
        <div className="noticias-content"><p className="noticias-loading">Cargando...</p></div>
      </div>
    )
  }

  return (
    <div className="default noticias">
      <div className="bg" />

      <div className="noticias-content">
        <div className="noticias-header">
          <h1>Noticias</h1>
          {canCreate && !showForm && (
            <button className="noticias-btn" onClick={() => setShowForm(true)}>
              Nueva publicación
            </button>
          )}
        </div>

        {error && <p className="noticias-error">{error}</p>}

        {canCreate && showForm && (
          <form className="noticias-form" onSubmit={handleCreate}>
            <h2>Crear publicación</h2>
            <div className="form-group">
              <label htmlFor="title">Título</label>
              <input type="text" id="title" value={createForm.title} required maxLength={255}
                onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="excerpt">Extracto (opcional)</label>
              <input type="text" id="excerpt" value={createForm.excerpt} maxLength={500}
                onChange={e => setCreateForm(f => ({ ...f, excerpt: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="tag">Etiqueta (opcional)</label>
              <input type="text" id="tag" value={createForm.tag} maxLength={100} placeholder="Ej: Investigación, Opinión, Evento"
                onChange={e => setCreateForm(f => ({ ...f, tag: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="content">Contenido</label>
              {preview === 'create' ? (
                <div className="noticias-preview" dangerouslySetInnerHTML={{ __html: marked.parse(createForm.content || '*Sin contenido*', { breaks: true }) }} />
              ) : (
                <textarea id="content" value={createForm.content} required rows={8} maxLength={10000}
                  onChange={e => setCreateForm(f => ({ ...f, content: e.target.value }))} />
              )}
            </div>
            <div className="noticias-form-actions">
              <button type="submit" className="noticias-btn" disabled={submitting}>
                {submitting ? 'Publicando...' : 'Publicar'}
              </button>
              <button type="button" className="noticias-btn noticias-btn-secondary"
                onClick={() => setPreview(preview === 'create' ? null : 'create')}>
                {preview === 'create' ? 'Editar' : 'Vista previa'}
              </button>
              <button type="button" className="noticias-btn noticias-btn-secondary"
                onClick={() => { setShowForm(false); setError(''); setPreview(null); setCreateForm({ title: '', content: '', excerpt: '', tag: '' }) }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {posts.length === 0 ? (
          <p className="noticias-empty">No hay publicaciones aún.</p>
        ) : (
          <div className="noticias-list">
            {posts.map(post => (
              <article key={post.id} className="noticias-card" onClick={() => { setSelectedPost(post); setIsEditing(false) }}>
                <div className="open-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 24 24">
                    <path d="M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 12 L 19 12 L 19 19 L 5 19 L 5 5 L 12 5 L 12 3 L 5 3 z M 14 3 L 14 5 L 17.585938 5 L 8.2929688 14.292969 L 9.7070312 15.707031 L 19 6.4140625 L 19 10 L 21 10 L 21 3 L 14 3 z"></path>
                  </svg>
                </div>
                <div className="noticias-card-body">
                  <div className="noticias-card-header">
                    {post.tag && <div className="noticias-tag">{post.tag}</div>}
                    <h3>{post.title}</h3>
                  </div>
                  {post.excerpt && <p className="noticias-excerpt">{post.excerpt}</p>}
                  <div className="noticias-meta">
                    <span>{post.author_name}</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <div className="noticias-modal-overlay" onClick={() => { setSelectedPost(null); setIsEditing(false); setEditForm({}) }}>
          <div className="noticias-modal" onClick={e => e.stopPropagation()}>
            <button className="noticias-modal-close" onClick={() => { setSelectedPost(null); setIsEditing(false); setEditForm({}) }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {isEditing ? (
              <form className="noticias-form" onSubmit={handleEditSave}>
                <h2>Editar publicación</h2>

                {isAdmin && (
                  <>
                    <div className="form-group">
                      <label htmlFor="edit-title">Título</label>
                      <input type="text" id="edit-title" required maxLength={255} value={editForm.title}
                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-excerpt">Extracto (opcional)</label>
                      <input type="text" id="edit-excerpt" maxLength={500} value={editForm.excerpt}
                        onChange={e => setEditForm(f => ({ ...f, excerpt: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-tag">Etiqueta (opcional)</label>
                      <input type="text" id="edit-tag" maxLength={100} value={editForm.tag}
                        onChange={e => setEditForm(f => ({ ...f, tag: e.target.value }))} />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label htmlFor="edit-content">Contenido</label>
                  <textarea id="edit-content" required rows={10} maxLength={10000} value={editForm.content}
                    onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} />
                </div>

                <div className="noticias-form-actions">
                  <button type="submit" className="noticias-btn" disabled={submitting}>
                    {submitting ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button type="button" className="noticias-btn noticias-btn-secondary" onClick={cancelEditing}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="noticias-modal-header">
                  {selectedPost.tag && <div className="noticias-tag">{selectedPost.tag}</div>}
                  <h2>{selectedPost.title}</h2>
                </div>
                {selectedPost.excerpt && <p className="noticias-modal-excerpt">{selectedPost.excerpt}</p>}
                <div className="noticias-modal-meta">
                  <span>{selectedPost.author_name}</span>
                  <span>{formatDate(selectedPost.created_at)}</span>
                </div>
                <div className="noticias-modal-content" dangerouslySetInnerHTML={{ __html: marked.parse(selectedPost.content, { breaks: true }) }} />

                {canModify(selectedPost) && (
                  <div className="noticias-modal-actions">
                    <button className="noticias-btn" onClick={() => startEditing(selectedPost)}>
                      Editar
                    </button>
                    <button className="noticias-btn noticias-btn-danger" onClick={() => handleDelete(selectedPost.id)} disabled={deleting === selectedPost.id}>
                      {deleting === selectedPost.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Noticias
