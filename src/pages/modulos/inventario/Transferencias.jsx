import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconReceipt } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import InventarioShell from './InventarioShell'
import DetalleModal from '../../../components/DetalleModal'
import { PRODUCTOS, gs, fechaCorta } from './datos'

// TODO: reemplazar por los datos del backend (ms-inventario)
// items: [código, cantidad]; el precio y el nombre salen del catálogo
const TRANSFERENCIAS = [
  { nro: 'TRF-000012', origen: 'Depósito Central', destino: 'Depósito Norte',   total: 1250000, fecha: '2026-08-20', llegada: '2026-08-22', autor: 'Bianca Garmendia', estado: 'Completada',
    items: [['PRD-000001', 2], ['PRD-000002', 10], ['PRD-000003', 30]] },
  { nro: 'TRF-000011', origen: 'Depósito Central', destino: 'Depósito Sur',     total: 3480000, fecha: '2026-08-19', llegada: '2026-08-21', autor: 'Bianca Garmendia', estado: 'Completada',
    items: [['PRD-000002', 3], ['PRD-000003', 38], ['PRD-000005', 9]] },
  { nro: 'TRF-000010', origen: 'Depósito Norte',   destino: 'Depósito Sur',     total: 890000,  fecha: '2026-08-19', llegada: '2026-08-23', autor: 'Carlos Ayala',     estado: 'Pendiente',
    items: [['PRD-000001', 2], ['PRD-000002', 10], ['PRD-000003', 10]] },
  { nro: 'TRF-000009', origen: 'Depósito Sur',     destino: 'Depósito Central', total: 5200000, fecha: '2026-08-18', llegada: '2026-08-20', autor: 'Carlos Ayala',     estado: 'Completada',
    items: [['PRD-000003', 5], ['PRD-000004', 8], ['PRD-000005', 7]] },
  { nro: 'TRF-000008', origen: 'Depósito Central', destino: 'Depósito Norte',   total: 2100000, fecha: '2026-08-17', llegada: '2026-08-19', autor: 'Bianca Garmendia', estado: 'Completada',
    items: [['PRD-000001', 2], ['PRD-000004', 2], ['PRD-000002', 20]] },
]
const COLUMNAS_DETALLE = [
  { key: 'codigo', label: 'Código', ancho: '130px' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'cantidad', label: 'Cant.', align: 'right', ancho: '60px' },
  { key: 'precio', label: 'P. Unit.', align: 'right', mono: true, ancho: '120px' },
  { key: 'subtotal', label: 'Subtotal', align: 'right', mono: true, ancho: '130px' },
]

function detalleDe(t) {
  const filas = t.items.map(([codigo, cantidad]) => {
    const p = PRODUCTOS.find((x) => x.codigo === codigo)
    return { codigo, descripcion: p.nombre, cantidad, precio: gs(p.precio), subtotal: gs(p.precio * cantidad), _subtotal: p.precio * cantidad }
  })
  return {
    title: `Transferencia — ${t.nro}`,
    campos: [
      { label: 'Depósito origen', value: t.origen },
      { label: 'Fecha realizada', value: fechaCorta(t.fecha) },
      { label: 'Depósito destino', value: t.destino },
      { label: 'Fecha estimada de llegada', value: fechaCorta(t.llegada) },
      { label: 'Autor', value: t.autor },
      { label: 'Estado', value: t.estado },
    ],
    filas,
    total: gs(filas.reduce((s, f) => s + f._subtotal, 0)),
  }
}
const ESTADOS = ['Completada', 'Pendiente']
const POR_PAGINA = 10

export default function Transferencias() {
  const navigate = useNavigate()
  const [detalle, setDetalle] = useState(null)   // transferencia abierta en el modal
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [pagina, setPagina] = useState(1)   // TODO: pedir esta página al backend

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return TRANSFERENCIAS.filter((t) =>
      (estado === 'Todos' || t.estado === estado) &&
      (!q || [t.nro, t.origen, t.destino].some((c) => c.toLowerCase().includes(q))))
  }, [busqueda, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  return (
    <>
    <InventarioShell
      accion={<button type="button" className="btn-agregar" onClick={() => navigate('/inventario/transferencias/nueva')}>+ Nueva Transferencia</button>}
      busqueda={busqueda} onBusqueda={(v) => { setBusqueda(v); setPagina(1) }}
      placeholder="Buscar por número o depósito..."
      estados={ESTADOS} estado={estado} onEstado={(v) => { setEstado(v); setPagina(1) }}>
      <div className="fila cabecera">
        <span>#</span><span>Nro. Transferencia</span><span>Origen</span><span>Destino</span>
        <span>Total</span><span>Fecha</span><span>Estado</span><span />
      </div>

      {visibles.map((t, i) => (
        <div className="fila fila-dato" key={t.nro}>
          <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
          <span className="c-nro">{t.nro}</span>
          <span>{t.origen}</span>
          <span>{t.destino}</span>
          <span className="c-total">{gs(t.total)}</span>
          <span className="c-fecha">{fechaCorta(t.fecha)}</span>
          <span className={'c-estado ' + (t.estado === 'Completada' ? 'estado-pagado' : 'estado-pendiente')}>{t.estado}</span>
          <button className="btn-ver" aria-label={`Ver ${t.nro}`} onClick={() => setDetalle(t)}><IconReceipt /></button>
        </div>
      ))}
      {visibles.length === 0 && <p className="sin-resultados">No se encontraron transferencias</p>}

      <div className="espacio" />
      <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </InventarioShell>

    {detalle && <DetalleModal {...detalleDe(detalle)} columnas={COLUMNAS_DETALLE} onClose={() => setDetalle(null)} />}
    </>
  )
}
