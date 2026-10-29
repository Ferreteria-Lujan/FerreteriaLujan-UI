import { NavLink } from 'react-router-dom'
import { IconReceipt, IconClipboard, IconTruck, IconBox, IconTransfer } from './Icons'

// Navbar de un módulo: usa las mismas clases que NavVentas (.nav-modulo / .nav-item)
function NavModulo({ label, items }) {
  return (
    <nav className="nav-modulo" aria-label={label}>
      {items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          {label}
          <span className="nav-icon"><Icon /></span>
        </NavLink>
      ))}
    </nav>
  )
}

const itemsCompras = [
  { to: '/compras/facturas',    label: 'Facturas',    Icon: IconReceipt },
  { to: '/compras/pedidos',     label: 'Pedidos',     Icon: IconClipboard },
  { to: '/compras/proveedores', label: 'Proveedores', Icon: IconTruck },
]
const itemsInventario = [
  { to: '/inventario/productos',      label: 'Productos',      Icon: IconBox },
  { to: '/inventario/transferencias', label: 'Transferencias', Icon: IconTransfer },
]

export const NavCompras = () => <NavModulo label="Módulo de Compras" items={itemsCompras} />
export const NavInventario = () => <NavModulo label="Módulo de Inventario" items={itemsInventario} />
