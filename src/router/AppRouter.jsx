import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout.jsx'

import Inicio from '../pages/Inicio.jsx'
import Noticias from '../pages/Noticias.jsx'
import Contacto from '../pages/Contacto.jsx'
import Otros from '../pages/Otros.jsx'

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route path='/' element={<Inicio/>}/>
          <Route path='/noticias' element={<Noticias/>}/>
          <Route path='/contacto' element={<Contacto/>}/>
          <Route path='/otros' element={<Otros/>}/>
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouter