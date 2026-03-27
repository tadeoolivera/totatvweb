import Header from '../components/common/Header.jsx'
import Footer from '../components/common/Footer.jsx'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Header/>
      <Outlet/>
      <Footer/>
    </div>
  )
}

export default MainLayout