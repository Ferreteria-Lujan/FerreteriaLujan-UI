import { useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../gateway/session'

export default function Main() {
  const navigate = useNavigate()
  return (
    <section className="menu">
      <div className="menu-row">
        <button className="btn btn-menu" onClick={() => navigate('/compras')}>Compras</button>
        <button className="btn btn-menu" onClick={() => navigate('/ventas')}>Ventas</button>
        <button className="btn btn-menu" onClick={() => navigate('/inventario')}>Inventario</button>
      </div>
      <div className="menu-row">
        <button className="btn" onClick={() => navigate('/reportes')}>Reportes</button>
        <button className="btn" onClick={() => { cerrarSesion(); navigate('/login') }}>Salir</button>
      </div>
    </section>
  )
}
