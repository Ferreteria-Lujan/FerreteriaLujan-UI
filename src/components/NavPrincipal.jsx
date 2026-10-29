import { NavLink, useLocation } from 'react-router-dom'
import {
  IconCart, IconTag, IconBox, IconPlusCircle, IconReceipt, IconDocument,
  IconClipboard, IconTruck, IconTransfer,
} from './Icons'

// Módulos y submódulos: único lugar donde se define la navegación
const MODULOS = [
  {
    to: '/compras', label: 'Compras', Icon: IconCart,
    sub: [
      { to: '/compras/facturas',    label: 'Facturas',    Icon: IconReceipt },
      { to: '/compras/pedidos',     label: 'Pedidos',     Icon: IconClipboard },
      { to: '/compras/proveedores', label: 'Proveedores', Icon: IconTruck },
    ],
  },
  {
    to: '/ventas', label: 'Ventas', Icon: IconTag,
    sub: [
      { to: '/ventas/venta-directa', label: 'Venta Directa', Icon: IconPlusCircle },
      { to: '/ventas/facturas',      label: 'Facturas',      Icon: IconReceipt },
      { to: '/ventas/presupuestos',  label: 'Presupuestos',  Icon: IconDocument },
    ],
  },
  {
    to: '/inventario', label: 'Inventario', Icon: IconBox,
    sub: [
      { to: '/inventario/productos',      label: 'Productos',      Icon: IconBox },
      { to: '/inventario/productos/nueva',      label: 'Nuevo producto',      Icon: IconBox },
      { to: '/inventario/transferencias', label: 'Transferencias', Icon: IconTransfer },
      { to: '/inventario/transferencias/nueva', label: 'Nueva transferencia', Icon: IconTransfer },
    ],
  },
]

// Navbar del header: los 3 módulos siempre visibles; el módulo activo despliega sus submódulos debajo
export default function NavPrincipal() {
  const { pathname } = useLocation()
  const activo = MODULOS.find((m) => pathname.startsWith(m.to))

  return (
    <nav className="nav-modulo" aria-label="Navegación principal">
      <div className="nav-modulos">
        {MODULOS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            {label}
            <span className="nav-icon"><Icon /></span>
          </NavLink>
        ))}
      </div>

      {/* Reserva el alto aunque no haya módulo activo (menú principal) para que el header no "salte" */}
      <div className="nav-sub" aria-label={activo ? `Submódulos de ${activo.label}` : undefined}>
        {activo?.sub.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'subnav-item' + (isActive ? ' active' : '')}>
            <Icon />{label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
