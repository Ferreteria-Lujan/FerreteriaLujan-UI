import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconChevronDown } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'

// TODO: reemplazar por los datos del backend (ms-ventas).
// Forma de facturas_ventas + cliente (clientes -> personas) + estado (estados.nombre).
const FACTURAS = [
  { id_factura: 12, nro_factura: 'FAC-000012', cliente: 'Ferretería El Tornillo', fecha_emision: '2026-08-20', fecha_vencimiento: '2026-09-20', importe_total: 1250000, estado: 'Pagada' },
  { id_factura: 11, nro_factura: 'FAC-000011', cliente: 'Construcciones Aranda',  fecha_emision: '2026-08-19', fecha_vencimiento: '2026-09-19', importe_total: 3480000, estado: 'Pendiente' },
  { id_factura: 10, nro_factura: 'FAC-000010', cliente: 'Distribuidora Pérez',    fecha_emision: '2026-08-19', fecha_vencimiento: '2026-09-19', importe_total: 890000,  estado: 'Pendiente' },
  { id_factura: 9,  nro_factura: 'FAC-000009', cliente: 'Constructora López',     fecha_emision: '2026-08-18', fecha_vencimiento: '2026-08-17', importe_total: 5200000, estado: 'Vencida' },
  { id_factura: 8,  nro_factura: 'FAC-000008', cliente: 'Obras Civiles SA',       fecha_emision: '2026-08-17', fecha_vencimiento: '2026-09-16', importe_total: 2100000, estado: 'Pagada' },
  { id_factura: 7,  nro_factura: 'FAC-000007', cliente: 'Consumidor Final',       fecha_emision: '2026-08-16', fecha_vencimiento: '2026-09-16', importe_total: 320000,  estado: 'Pagada' },
  { id_factura: 6,  nro_factura: 'FAC-000006', cliente: 'Constructora López',     fecha_emision: '2026-08-15', fecha_vencimiento: '2026-09-14', importe_total: 780000,  estado: 'Pagada' },
  { id_factura: 5,  nro_factura: 'FAC-000005', cliente: 'Ferretería El Tornillo', fecha_emision: '2026-08-14', fecha_vencimiento: '2026-09-13', importe_total: 640000,  estado: 'Pagada' },
  { id_factura: 4,  nro_factura: 'FAC-000004', cliente: 'Distribuidora Pérez',    fecha_emision: '2026-08-12', fecha_vencimiento: '2026-09-11', importe_total: 1150000, estado: 'Pagada' },
  { id_factura: 3,  nro_factura: 'FAC-000003', cliente: 'Construcciones Aranda',  fecha_emision: '2026-08-10', fecha_vencimiento: '2026-09-09', importe_total: 2760000, estado: 'Pagada' },
  { id_factura: 2,  nro_factura: 'FAC-000002', cliente: 'Consumidor Final',       fecha_emision: '2026-08-08', fecha_vencimiento: '2026-09-08', importe_total: 150000,  estado: 'Pagada' },
  { id_factura: 1,  nro_factura: 'FAC-000001', cliente: 'Obras Civiles SA',       fecha_emision: '2026-08-05', fecha_vencimiento: '2026-09-04', importe_total: 4300000, estado: 'Pagada' },
]
const ESTADOS = ['Pagada', 'Pendiente', 'Vencida']
const ESTADO_CLASE = { Pagada: 'estado-pagado', Pendiente: 'estado-pendiente', Vencida: 'estado-vencida' }
const POR_PAGINA = 10

const gs = (n) => n.toLocaleString('es-PY') + ' Gs.'
const fechaCorta = (iso) => iso.split('-').reverse().join('/')   // 2026-08-20 -> 20/08/2026

export default function Facturas() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [pagina, setPagina] = useState(1)   // TODO: pedir esta página al backend

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return FACTURAS.filter((f) =>
      (estado === 'Todos' || f.estado === estado) &&
      (!q || f.nro_factura.toLowerCase().includes(q) || f.cliente.toLowerCase().includes(q)))
  }, [busqueda, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA)

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Facturas</h1>

      <div className="filtros">
        <button type="button" className="btn-agregar" onClick={() => navigate('/ventas/venta-directa')}>
          + Nueva Venta
        </button>
        <label className="campo-caja buscador">
          <IconSearch />
          <input type="search" placeholder="Buscar por número o cliente..." aria-label="Buscar facturas"
                 value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }} />
        </label>
        <label className="filtro-estado">
          Estado:
          <select value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1) }}>
            <option value="Todos">Todos</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <IconChevronDown />
        </label>
      </div>

      <div className="tabla-ventas tabla-facturas">
        <div className="fila cabecera">
          <span>#</span><span>Nro. Factura</span><span>Cliente</span><span>Fecha</span>
          <span>Vencimiento</span><span>Total</span><span>Estado</span><span />
        </div>

        {visibles.map((f, i) => (
          <div className="fila fila-dato" key={f.id_factura}>
            <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
            <span className="c-nro">{f.nro_factura}</span>
            <span>{f.cliente}</span>
            <span className="c-fecha">{fechaCorta(f.fecha_emision)}</span>
            <span className="c-fecha">{fechaCorta(f.fecha_vencimiento)}</span>
            <span className="c-total">{gs(f.importe_total)}</span>
            <span className={'c-estado ' + ESTADO_CLASE[f.estado]}>{f.estado}</span>
            {/* TODO: ver el detalle de la factura */}
            <button className="btn-ver" aria-label={`Ver ${f.nro_factura}`}><IconSearch /></button>
          </div>
        ))}
        {visibles.length === 0 && <p className="sin-resultados">No se encontraron facturas</p>}

        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>
    </section>
  )
}