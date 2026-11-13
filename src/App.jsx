import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Main from './pages/Main'
import Pedidos from './pages/modulos/compras/Pedidos'
import ModalNuevoPedido from './pages/modulos/compras/ModalNuevoPedido'
import SeguimientoPedido from './pages/modulos/compras/SeguimientoPedido'
import VerFacturaCompra from './pages/modulos/compras/VerFacturaCompra'
import FacturasCompras from './pages/modulos/compras/FacturasCompras'
import NuevaFacturaCompra from './pages/modulos/compras/NuevaFacturaCompra'
import Proveedores from './pages/modulos/compras/Proveedores'
import VentasHome from './pages/modulos/ventas/VentasHome'
import VentaDirecta from './pages/modulos/ventas/VentaDirecta'
import Facturas from './pages/modulos/ventas/Facturas'
import Presupuestos from './pages/modulos/ventas/Presupuestos'
import Productos from './pages/modulos/inventario/Productos'
import Transferencias from './pages/modulos/inventario/Transferencias'
import NuevaTransferencia from './pages/modulos/inventario/NuevaTransferencia'
import Reportes from './pages/modulos/Reportes'
import ErrorPage from './pages/ErrorPage'
import { isLoggedIn } from './gateway/session'

// Rutas protegidas: sin sesión iniciada, siempre se vuelve al login
function RequireAuth() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return <Outlet />
}

// /login solo para quien NO tiene sesión (se evalúa en cada render)
function SoloInvitado() {
  if (isLoggedIn()) return <Navigate to="/" replace />
  return <Login />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<SoloInvitado />} />
        <Route path="/400" element={<ErrorPage code={400} />} />
        <Route path="/500" element={<ErrorPage code={500} />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Main />} />
          <Route path="/compras" element={<Navigate to="/compras/pedidos" replace />} />
          <Route path="/compras/pedidos" element={<Pedidos />} />
          <Route path="/compras/nuevo-pedido" element={<ModalNuevoPedido />} />
          <Route path="/compras/facturas" element={<FacturasCompras />} />
          <Route path="/compras/facturas/nueva" element={<NuevaFacturaCompra />} />
          <Route path="/compras/proveedores" element={<Proveedores />} />
          <Route path="/ventas" element={<VentasHome />} />
          <Route path="/ventas/venta-directa" element={<VentaDirecta />} />
          <Route path="/ventas/facturas" element={<Facturas />} />
          <Route path="/ventas/presupuestos" element={<Presupuestos />} />
          <Route path="/inventario" element={<Navigate to="/inventario/productos" replace />} />
          <Route path="/inventario/productos" element={<Productos />} />
          <Route path="/inventario/transferencias" element={<Transferencias />} />
          <Route path="/inventario/transferencias/nueva" element={<NuevaTransferencia />} />
          <Route path="/stock" element={<Navigate to="/inventario" replace />} />
          <Route path="/reportes" element={<Reportes />} />
        </Route>
        <Route path="*" element={<ErrorPage code={400} />} />
      </Route>
    </Routes>
  )
}
