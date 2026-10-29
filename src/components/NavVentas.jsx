import { NavLink } from 'react-router-dom'
import { IconPlusCircle, IconReceipt, IconDocument } from './Icons'

const items = [
  { to: '/ventas/venta-directa', label: 'Venta Directa', Icon: IconPlusCircle },
  { to: '/ventas/facturas',      label: 'Facturas',      Icon: IconReceipt },
  { to: '/ventas/presupuestos',  label: 'Presupuestos',  Icon: IconDocument },
]

// Navbar del módulo de Ventas: va en el centro de la barra superior
export default function NavVentas() {
  return (
    <nav className="nav-modulo" aria-label="Módulo de Ventas">
      {items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          {label}
          <span className="nav-icon"><Icon /></span>
        </NavLink>
      ))}
    </nav>
  )
}
