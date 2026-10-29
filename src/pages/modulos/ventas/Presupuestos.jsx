import { useMemo, useState } from 'react'
import { IconSearch, IconChevronDown } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import ModalNuevoPresupuesto from './ModalNuevoPresupuesto.jsx'

// ---------- Datos de prueba (TODO: reemplazar por ms-ventas / ms-inventario) ----------
// Tienen la forma de las tablas reales: estados, clientes + personas, productos,
// presupuestos y presupuestos_detalle.
const ESTADOS = [
  { id_estado: 1, nombre: 'Pendiente' },   // TODO: confirmar ids reales de la tabla estados
  { id_estado: 2, nombre: 'Aprobado' },
  { id_estado: 3, nombre: 'Convertido' },
  { id_estado: 4, nombre: 'Vencido' },
]
const CLIENTES = [
  { id_cliente: 1, ci: '1234567', persona: { nombre: 'Ferretería El Tornillo', apellido: null, ruc: '80012345-6' } },
  { id_cliente: 2, ci: '2345678', persona: { nombre: 'Construcciones Aranda',  apellido: null, ruc: '80023456-7' } },
  { id_cliente: 3, ci: '3456789', persona: { nombre: 'Distribuidora Pérez',    apellido: null, ruc: '80034567-8' } },
  { id_cliente: 4, ci: '4567890', persona: { nombre: 'Carlos',                 apellido: 'López', ruc: '4567890-1' } },
  { id_cliente: 5, ci: '5678901', persona: { nombre: 'Obras Civiles SA',       apellido: null, ruc: '80056789-0' } },
  { id_cliente: 6, ci: '6789012', persona: { nombre: 'Constructora Ramírez',   apellido: null, ruc: '80067890-1' } },
  { id_cliente: 7, ci: '7890123', persona: { nombre: 'Inversiones Morales',    apellido: null, ruc: '80078901-2' } },
]
const PRODUCTOS = [
  { id_producto: 1, codigo: 'PRD-000001', nombre: 'Martillo carpintero 16 oz',         precio_venta: 45000 },
  { id_producto: 2, codigo: 'PRD-000002', nombre: 'Cemento Portland bolsa 50 kg',      precio_venta: 62000 },
  { id_producto: 3, codigo: 'PRD-000003', nombre: 'Tornillo autoperforante 1" x100',   precio_venta: 18000 },
  { id_producto: 4, codigo: 'PRD-000004', nombre: 'Pintura látex blanco 20 L',         precio_venta: 385000 },
  { id_producto: 5, codigo: 'PRD-000005', nombre: 'Cable unipolar 2,5 mm rollo 100 m', precio_venta: 290000 },
]
const PRESUPUESTOS = [
  { id_presupuesto: 2, id_cliente: 4, fecha: '2026-08-01', id_estado: 3 },
  { id_presupuesto: 3, id_cliente: 7, fecha: '2026-08-05', id_estado: 4 },
  { id_presupuesto: 4, id_cliente: 2, fecha: '2026-08-08', id_estado: 2 },
  { id_presupuesto: 5, id_cliente: 3, fecha: '2026-08-10', id_estado: 4 },
  { id_presupuesto: 6, id_cliente: 2, fecha: '2026-08-15', id_estado: 3 },
  { id_presupuesto: 7, id_cliente: 1, fecha: '2026-08-18', id_estado: 2 },
  { id_presupuesto: 8, id_cliente: 6, fecha: '2026-08-20', id_estado: 1 },
]
const PRESUPUESTOS_DETALLE = [
  { id_presupuesto_detalle: 1,  id_presupuesto: 2, id_producto: 5, cantidad: 40, precio_unitario: 290000 },
  { id_presupuesto_detalle: 2,  id_presupuesto: 2, id_producto: 2, cantidad: 11, precio_unitario: 62000 },
  { id_presupuesto_detalle: 3,  id_presupuesto: 3, id_producto: 1, cantidad: 20, precio_unitario: 45000 },
  { id_presupuesto_detalle: 4,  id_presupuesto: 3, id_producto: 3, cantidad: 3,  precio_unitario: 18000 },
  { id_presupuesto_detalle: 5,  id_presupuesto: 4, id_producto: 5, cantidad: 10, precio_unitario: 290000 },
  { id_presupuesto_detalle: 6,  id_presupuesto: 4, id_producto: 2, cantidad: 45, precio_unitario: 62000 },
  { id_presupuesto_detalle: 7,  id_presupuesto: 5, id_producto: 4, cantidad: 5,  precio_unitario: 385000 },
  { id_presupuesto_detalle: 8,  id_presupuesto: 5, id_producto: 3, cantidad: 10, precio_unitario: 18000 },
  { id_presupuesto_detalle: 9,  id_presupuesto: 6, id_producto: 1, cantidad: 20, precio_unitario: 45000 },
  { id_presupuesto_detalle: 10, id_presupuesto: 6, id_producto: 2, cantidad: 15, precio_unitario: 62000 },
  { id_presupuesto_detalle: 11, id_presupuesto: 7, id_producto: 2, cantidad: 50, precio_unitario: 62000 },
  { id_presupuesto_detalle: 12, id_presupuesto: 7, id_producto: 3, cantidad: 5,  precio_unitario: 18000 },
  { id_presupuesto_detalle: 13, id_presupuesto: 8, id_producto: 4, cantidad: 10, precio_unitario: 385000 },
  { id_presupuesto_detalle: 14, id_presupuesto: 8, id_producto: 5, cantidad: 15, precio_unitario: 290000 },
]

const ESTADO_CLASE = { Pendiente: 'estado-pendiente', Aprobado: 'estado-aprobado', Convertido: 'estado-convertido', Vencido: 'estado-vencida' }
const ESTADO_PLURAL = { Pendiente: 'Pendientes', Aprobado: 'Aprobados', Convertido: 'Convertidos', Vencido: 'Vencidos' }
const POR_PAGINA = 10

const gs = (n) => n.toLocaleString('es-PY') + ' Gs.'
const fechaCorta = (iso) => iso.split('-').reverse().join('/')   // 2026-08-20 -> 20/08/2026
const nombreCliente = (c) => [c.persona.nombre, c.persona.apellido].filter(Boolean).join(' ')
const nroPresupuesto = (id) => 'PRE-' + String(id).padStart(6, '0')   // la tabla no tiene nro: se deriva del id
const estadoPorId = (id) => ESTADOS.find((e) => e.id_estado === id)

function hoyISO() {
  const h = new Date()
  return [h.getFullYear(), String(h.getMonth() + 1).padStart(2, '0'), String(h.getDate()).padStart(2, '0')].join('-')
}

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState(PRESUPUESTOS)           // TODO: cargar desde el backend
  const [detalles, setDetalles] = useState(PRESUPUESTOS_DETALLE)           // TODO: cargar desde el backend
  const [modalAbierto, setModalAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [idEstado, setIdEstado] = useState(null)                           // null = Todos
  const [pagina, setPagina] = useState(1)                                  // TODO: pedir esta página al backend

  // Filas de la tabla: cliente y estado por join; total = suma de presupuestos_detalle
  const filas = useMemo(() => presupuestos
    .map((p) => ({
      ...p,
      cliente: nombreCliente(CLIENTES.find((c) => c.id_cliente === p.id_cliente)),
      estado: estadoPorId(p.id_estado).nombre,
      total: detalles
        .filter((d) => d.id_presupuesto === p.id_presupuesto)
        .reduce((s, d) => s + d.cantidad * d.precio_unitario, 0),
    }))
    .sort((a, b) => b.id_presupuesto - a.id_presupuesto), [presupuestos, detalles])

  const conteo = useMemo(() => Object.fromEntries(
    ESTADOS.map((e) => [e.id_estado, filas.filter((f) => f.id_estado === e.id_estado).length])), [filas])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return filas.filter((f) =>
      (idEstado === null || f.id_estado === idEstado) &&
      (!q || nroPresupuesto(f.id_presupuesto).toLowerCase().includes(q) || f.cliente.toLowerCase().includes(q)))
  }, [filas, busqueda, idEstado])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA)

  function tocarTarjeta(id) {
    setIdEstado(idEstado === id ? null : id)   // tocar la tarjeta activa vuelve a "Todos"
    setPagina(1)
  }

  function guardar({ id_cliente, detalles: nuevos }) {
    // TODO: POST a ms-ventas: inserta presupuestos + presupuestos_detalle (en una misma transacción)
    const id = Math.max(0, ...presupuestos.map((p) => p.id_presupuesto)) + 1
    const pendiente = ESTADOS.find((e) => e.nombre === 'Pendiente')
    setPresupuestos((prev) => [{ id_presupuesto: id, id_cliente, fecha: hoyISO(), id_estado: pendiente.id_estado }, ...prev])
    setDetalles((prev) => {
      const base = Math.max(0, ...prev.map((d) => d.id_presupuesto_detalle))
      return [...prev, ...nuevos.map((d, i) => ({ id_presupuesto_detalle: base + i + 1, id_presupuesto: id, ...d }))]
    })
    setBusqueda('')
    setIdEstado(null)
    setPagina(1)
    setModalAbierto(false)
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Presupuestos</h1>

      <div className="tiles-estado">
        {ESTADOS.map((e) => (
          <button key={e.id_estado} type="button" className={'tile-estado' + (idEstado === e.id_estado ? ' activa' : '')}
                  aria-pressed={idEstado === e.id_estado} onClick={() => tocarTarjeta(e.id_estado)}>
            <strong className={ESTADO_CLASE[e.nombre]}>{conteo[e.id_estado]}</strong>
            <span>{ESTADO_PLURAL[e.nombre]}</span>
          </button>
        ))}
      </div>

      <div className="filtros">
        <button type="button" className="btn-agregar" onClick={() => setModalAbierto(true)}>
          + Nuevo Presupuesto
        </button>
        <label className="campo-caja buscador">
          <IconSearch />
          <input type="search" placeholder="Buscar por número o cliente..." aria-label="Buscar presupuestos"
                 value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }} />
        </label>
        <label className="filtro-estado">
          Estado:
          <select value={idEstado ?? ''} onChange={(e) => { setIdEstado(e.target.value ? Number(e.target.value) : null); setPagina(1) }}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>)}
          </select>
          <IconChevronDown />
        </label>
      </div>

      <div className="tabla-ventas tabla-presupuestos">
        <div className="fila cabecera">
          <span>#</span><span>Nro. Presupuesto</span><span>Cliente</span><span>Fecha</span>
          <span>Total</span><span>Estado</span><span />
        </div>

        {visibles.map((f, i) => (
          <div className="fila fila-dato" key={f.id_presupuesto}>
            <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
            <span className="c-nro">{nroPresupuesto(f.id_presupuesto)}</span>
            <span>{f.cliente}</span>
            <span className="c-fecha">{fechaCorta(f.fecha)}</span>
            <span className="c-total">{gs(f.total)}</span>
            <span className={'c-estado ' + ESTADO_CLASE[f.estado]}>{f.estado}</span>
            {/* TODO: ver el detalle del presupuesto */}
            <button className="btn-ver" aria-label={`Ver ${nroPresupuesto(f.id_presupuesto)}`}><IconSearch /></button>
          </div>
        ))}
        {visibles.length === 0 && <p className="sin-resultados">No se encontraron presupuestos</p>}

        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>

      {modalAbierto && (
        <ModalNuevoPresupuesto
          clientes={CLIENTES.map((c) => ({
            id_cliente: c.id_cliente,
            etiqueta: `${c.persona.ruc ?? c.ci ?? 'S/D'} · ${nombreCliente(c)}`,
          }))}
          productos={PRODUCTOS}
          onCerrar={() => setModalAbierto(false)}
          onGuardar={guardar} />
      )}
    </section>
  )
}