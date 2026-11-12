import { Link, NavLink } from 'react-router-dom'
import { IconBox, IconDocument, IconSearch, IconChevronDown } from '../../../components/Icons'

// Estructura compartida de las listas de Inventario:
// título, tarjetas de acción, búsqueda + filtro de estado, pestañas y la tabla (children)
export default function InventarioShell({ busqueda, onBusqueda, placeholder, estados, estado, onEstado, accion, children }) {
  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Módulo de Inventario</h1>

      <div className="filtros">
        {accion}
        <label className="campo-caja buscador">
          <IconSearch />
          <input type="search" placeholder={placeholder} aria-label="Buscar" value={busqueda}
                 onChange={(e) => onBusqueda(e.target.value)} />
        </label>
        {estados && (
          <label className="filtro-estado">
            Estado:
            <select value={estado} onChange={(e) => onEstado(e.target.value)}>
              <option value="Todos">Todos</option>
              {estados.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <IconChevronDown />
          </label>
        )}
      </div>

      <div className="tabla-ventas tabla-inventario">
        <div className="tabs-inventario">
          <NavLink to="/inventario/productos" className={({ isActive }) => 'tab-inv' + (isActive ? ' active' : '')}>Productos</NavLink>
          <NavLink to="/inventario/transferencias" className={({ isActive }) => 'tab-inv' + (isActive ? ' active' : '')}>Transferencias</NavLink>
        </div>
        {children}
      </div>
    </section>
  )
}
