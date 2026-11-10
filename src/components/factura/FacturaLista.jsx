import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconChevronDown } from '../Icons'
import Paginacion from '../Paginacion'
import { fechaCorta, gs } from './facturaConfig'

const POR_PAGINA = 10

// Listado de facturas reutilizable (compra y venta).
//   config      FACTURA_COMPRA | FACTURA_VENTA
//   facturas    [{ id, nro, tercero, fechaEmision, fechaVencimiento, total, estado }]
//   cargando    true mientras llega la lista
//   error       mensaje si falló la carga
//   onReintentar()  vuelve a pedir la lista
export default function FacturaLista({ config, facturas = [], cargando = false, error = null, onReintentar }) {
  const navigate = useNavigate()
  const l = config.lista
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [pagina, setPagina] = useState(1)

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return facturas.filter((f) =>
      (estado === 'Todos' || f.estado === estado) &&
      (!q || f.nro?.toLowerCase().includes(q) || f.tercero?.toLowerCase().includes(q)))
  }, [facturas, busqueda, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA)

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">{l.titulo}</h1>

      <div className="filtros">
        <button type="button" className="btn-agregar" onClick={() => navigate(l.rutaNueva)}>{l.botonNueva}</button>
        <label className="campo-caja buscador">
          <IconSearch />
          <input type="search" placeholder={l.placeholder} aria-label="Buscar facturas"
                 value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }} />
        </label>
        <label className="filtro-estado">
          {l.estadoColumna}:
          <select value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1) }}>
            <option value="Todos">Todos</option>
            {l.estados.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <IconChevronDown />
        </label>
      </div>

      <div className="tabla-ventas tabla-facturas">
        <div className="fila cabecera">
          <span>#</span><span>Nro. Factura</span><span>{l.terceroColumna}</span><span>Fecha</span>
          <span>Vencimiento</span><span>Total</span><span>{l.estadoColumna}</span><span />
        </div>

        {visibles.map((f, i) => (
          <div className="fila fila-dato" key={f.id}>
            <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
            <span className="c-nro">{f.nro}</span>
            <span>{f.tercero}</span>
            <span className="c-fecha">{fechaCorta(f.fechaEmision)}</span>
            <span className="c-fecha">{fechaCorta(f.fechaVencimiento)}</span>
            <span className="c-total">{gs(f.total)}</span>
            <span className={'c-estado ' + (l.estadoClase[f.estado] ?? '')}>{f.estado}</span>
            {/* TODO: ver el detalle de la factura */}
            <button className="btn-ver" aria-label={`Ver ${f.nro}`}><IconSearch /></button>
          </div>
        ))}

        {cargando && <p className="sin-resultados">Cargando facturas...</p>}
        {!cargando && error && (
          <p className="sin-resultados error-lista">
            {error} {onReintentar && <button type="button" className="link-reintentar" onClick={onReintentar}>Reintentar</button>}
          </p>
        )}
        {!cargando && !error && visibles.length === 0 && <p className="sin-resultados">No se encontraron facturas</p>}

        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>
    </section>
  )
}
