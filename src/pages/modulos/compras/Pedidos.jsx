import { useMemo, useState } from 'react'
import {
  IconPlusCircle, IconSearch, IconChevronDown, IconChevronLeft, IconChevronRight,
} from '../../../components/Icons'

// TODO: reemplazar por los datos del backend (ms-compras)
const PEDIDOS = [
  { nro: 'PED-2026-0041', proveedor: 'Distribuidora Acero Total', fecha: '2026-07-19', total: 1385000, pagado: false, estado: 'En proceso' },
  { nro: 'PED-2026-0040', proveedor: 'Ferrecon S.A.',             fecha: '2026-07-18', total: 450000,  pagado: true,  estado: 'Recibido' },
  { nro: 'PED-2026-0039', proveedor: 'Pinturas del Sur',          fecha: '2026-07-15', total: 1770000, pagado: true,  estado: 'Recibido' },
  { nro: 'PED-2026-0038', proveedor: 'ElectroPro SRL',            fecha: '2026-07-10', total: 840000,  pagado: false, estado: 'Cancelado' },
  { nro: 'PED-2026-0037', proveedor: 'Distribuidora Acero Total', fecha: '2026-07-05', total: 1650000, pagado: true,  estado: 'Recibido' },
]
const ESTADOS = ['En proceso', 'Recibido', 'Cancelado']
const ESTADO_CLASE = { 'En proceso': 'estado-proceso', Recibido: 'estado-recibido', Cancelado: 'estado-cancelado' }
const POR_PAGINA = 10

const ORDENES = {
  defecto:   { label: 'Por defecto',        fn: null },
  fecha:     { label: 'Fecha (reciente)',   fn: (a, b) => b.fecha.localeCompare(a.fecha) },
  total:     { label: 'Total (mayor)',      fn: (a, b) => b.total - a.total },
  proveedor: { label: 'Proveedor (A-Z)',    fn: (a, b) => a.proveedor.localeCompare(b.proveedor, 'es') },
}

const gs = (n) => n.toLocaleString('es-PY') + ' Gs.'
const fechaCorta = (iso) => iso.split('-').reverse().join('/')   // 2026-07-19 -> 19/07/2026

export default function Pedidos() {
  const [pedidos, setPedidos] = useState(PEDIDOS)   // TODO: cargar desde el backend
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('defecto')
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = pedidos.filter((p) =>
      !q || [p.nro, p.proveedor, p.estado].some((c) => c.toLowerCase().includes(q)))
    const fn = ORDENES[orden].fn
    return fn ? [...lista].sort(fn) : lista
  }, [pedidos, busqueda, orden])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  function cambiarEstado(nro, estado) {
    // TODO: PATCH al backend
    setPedidos((prev) => prev.map((p) => (p.nro === nro ? { ...p, estado } : p)))
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Pedidos</h1>

      <div className="barra-herramientas">
        <button className="btn-nuevo" type="button" onClick={() => { /* TODO: abrir formulario de nuevo pedido */ }}>
          <IconPlusCircle /> Nuevo Pedido
        </button>

        <form className="caja-busqueda" role="search" onSubmit={(e) => e.preventDefault()}>
          <input type="search" placeholder="Buscar..." aria-label="Buscar pedidos" value={busqueda}
                 onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }} />
          <button type="submit" aria-label="Buscar"><IconSearch /></button>
        </form>

        <label className="ordenar">
          Ordenar por
          <select value={orden} onChange={(e) => { setOrden(e.target.value); setPagina(1) }}>
            {Object.entries(ORDENES).map(([k, o]) => <option key={k} value={k}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <div className="tabla-ventas tabla-pedidos">
        <div className="fila cabecera">
          <span>#</span><span>Nro. pedido</span><span>Proveedor</span><span>Fecha</span>
          <span>Total</span><span>Pagado</span><span>Estado</span><span />
        </div>

        {visibles.map((p, i) => (
          <div className="fila fila-dato" key={p.nro}>
            <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
            <span className="c-nro">{p.nro}</span>
            <span>{p.proveedor}</span>
            <span className="c-fecha">{fechaCorta(p.fecha)}</span>
            <span className="c-total">{gs(p.total)}</span>
            <span className="c-pagado">
              <span className={'badge-pago ' + (p.pagado ? 'pago-si' : 'pago-no')}>
                <i />{p.pagado ? 'Sí' : 'No'}
              </span>
            </span>
            <label className={'estado-select ' + ESTADO_CLASE[p.estado]}>
              <select value={p.estado} aria-label={`Estado de ${p.nro}`}
                      onChange={(e) => cambiarEstado(p.nro, e.target.value)}>
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <IconChevronDown />
            </label>
            <button className="btn-ver" aria-label={`Ver ${p.nro}`}><IconSearch /></button>
          </div>
        ))}

        {visibles.length === 0 && <p className="sin-resultados">No se encontraron pedidos</p>}

        <div className="espacio" />

        <div className="paginacion">
          <button className="pag-btn flecha" disabled={actual === 1}
                  onClick={() => setPagina(actual - 1)} aria-label="Anterior"><IconChevronLeft /></button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button key={n} className={'pag-btn' + (n === actual ? ' activa' : '')}
                    onClick={() => setPagina(n)}>{n}</button>
          ))}
          <button className="pag-btn flecha" disabled={actual === totalPaginas}
                  onClick={() => setPagina(actual + 1)} aria-label="Siguiente"><IconChevronRight /></button>
        </div>
      </div>
    </section>
  )
}
