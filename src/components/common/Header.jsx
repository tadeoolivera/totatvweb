import { NavLink } from "react-router-dom"
import logoURL from '../../assets/logo.png'

const links = ['Inicio', 'Noticias', 'Contacto', 'Otros']

export default function Header() {
  return (
    <nav className="nav">
      <img src={logoURL} alt="Tota TV" className="logo" />

      <ul className="links">
        {links.map((link) => (
          <li key={link}>
            {link === 'Inicio' ? (
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? "active" : ""}
              >
                {link}
              </NavLink>
            ) : (
              <NavLink
                to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) => isActive ? "active" : ""}
              >
                {link}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}