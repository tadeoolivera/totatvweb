import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.js'
import './Register.css'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.target)
    const username = form.get('username')
    const email = form.get('email')
    const password = form.get('password')

    try {
      await register(username, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-container">
        <h1>Crear cuenta</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input type="text" id="username" name="username" required minLength={3}
              onInvalid={e => {
                if (e.target.validity.valueMissing) e.target.setCustomValidity('No me hagas calentar que esto es lo primero que te pido poner')
                else if (e.target.validity.tooShort) e.target.setCustomValidity('3 caracteres te pido y no te jodo más')
              }}
              onInput={e => e.target.setCustomValidity('')} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="email" required
              onInvalid={e => {
                if (e.target.validity.valueMissing) e.target.setCustomValidity('Tutorial: Como poner mi correo electrónico')
                else if (e.target.validity.typeMismatch) e.target.setCustomValidity('Aprendé a escribir un correo electrónico primero pibe')
              }}
              onInput={e => e.target.setCustomValidity('')} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" required minLength={8}
              onInvalid={e => {
                if (e.target.validity.valueMissing) e.target.setCustomValidity('Dale, que entre cualquiera a tu cuenta')
                else if (e.target.validity.tooShort) e.target.setCustomValidity('Te la adivino hasta yo esa contraseña, metele 8 caracteres mínimo plis')
              }}
              onInput={e => e.target.setCustomValidity('')} />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-switch">
          ¿Ya tenés cuenta? <NavLink to="/login">Inicia sesión</NavLink>
        </p>
      </div>
    </div>
  )
}

export default Register
