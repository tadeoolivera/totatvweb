import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.jsx'

import AuthLayout from './layouts/AuthLayout.jsx'
import MainLayout from './layouts/MainLayout.jsx'

import Inicio from './pages/Inicio/Inicio.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import Nosotros from './pages/Nosotros/Nosotros.jsx'
import Noticias from './pages/Noticias/Noticias.jsx'
import Otros from './pages/Otros/Otros.jsx'

import './App.css'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/otros" element={<Otros />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
