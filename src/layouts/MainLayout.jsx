import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import './MainLayout.css'

const links = ['Inicio', 'Noticias', 'Nosotros', 'Otros']

const MainLayout = () => {
  const { user, loading, logout } = useAuth()

  return (
    <div className="main-layout">
      <nav className="nav">
        <img src="/logo.png" alt="Tota TV" className="logo" />
        <ul className="links">
          {links.map((link) => (
            <li key={link}>
              {link === 'Inicio' ? (
                <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                  {link}
                </NavLink>
              ) : (
                <NavLink
                  to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  {link}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
        {loading ? null : user ? (
          <div className="login-button">
            <span className="username-display">{user.username}</span>
            <button onClick={logout} className="logout-btn">Cerrar sesión</button>
          </div>
        ) : (
          <div className="login-button">
            <NavLink to="/login" className="login-link">
              Iniciar Sesión
            </NavLink>
          </div>
        )}
      </nav>
      <Outlet />
      <footer className="footer">
        <p>&copy; 2026 TOTA TV. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default MainLayout
