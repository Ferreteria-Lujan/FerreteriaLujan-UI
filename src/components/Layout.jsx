import { Link, Outlet, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'
import BackButton from './BackButton'
import NavPrincipal from './NavPrincipal'

const MODULOS = ['/compras', '/ventas', '/inventario']

export default function Layout() {
  const { pathname } = useLocation()
  const enLogin = pathname === '/login'
  const enModulo = MODULOS.some((m) => pathname.startsWith(m))
  // La navbar se ve en todo el sistema (incluido el menú principal), menos en el login.
  // La flecha de volver queda solo para pantallas fuera de los módulos (ej. Reportes).
  const showBack = pathname !== '/' && !enLogin && !enModulo
  return (
    <>
      <header className="app-header">
        <Link to="/"><img src={logo} alt="Lujan Emprendimientos" /></Link>
        {!enLogin && <NavPrincipal />}
      </header>
      <main className="app-content">
        {showBack && <BackButton />}
        <Outlet />
      </main>
    </>
  )
}