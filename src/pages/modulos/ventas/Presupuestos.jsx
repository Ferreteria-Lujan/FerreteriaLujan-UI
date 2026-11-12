import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconPencil, IconSearch } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import { fechaCorta, gs } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { productos } from '../../../services/inventarioService'
import {
  actualizarPresupuesto, crearPresupuesto, generarFacturaDesdePresupuesto,
  listarPresupuestos, listarTerceros, obtenerPresupuestoParaEditar,
} from '../../../services/ventasService'
import ModalNuevoPresupuesto from './ModalNuevoPresupuesto.jsx'

// Colores y etiquetas por nombre de estado (solo presentacion)
const ESTADO_CLASE = { Pendiente: 'estado-pendiente', Aprobado: 'estado-aprobado', Convertido: 'estado-convertido', Vencido: 'estado-vencida' }
const ESTADO_PLURAL = { Pendiente: 'Pendientes', Aprobado: 'Aprobados', Convertido: 'Convertidos', Vencido: 'Vencidos' }
const POR_PAGINA = 10

async function cargarPantalla() {
  const [{ filas, estados }, terceros, prods] = await Promise.all([
    listarPresupuestos(),
    listarTerceros(),
    productos.listar({ sort: 'nombre,asc' }),
  ])
  return {
    filas,
    estados: estados.filter((e) => ESTADO_CLASE[e.nombre]),   // solo los estados de presupuesto
    clientes: terceros.map((t) => ({ id_cliente: t.id, etiqueta: t.etiqueta })),
    productos: prods.map((p) => ({ id_producto: p.id, codigo: p.codigo, nombre: p.nombre, precio_venta: p.precioVenta })),
  }
}

// Carga el presupuesto y abre el modal de edición con sus datos
function ModalEditarPresupuesto({ id, nro, clientes, productos, onCerrar, onActualizado }) {
  const { datos, cargando, error } = useCargar(() => obtenerPresupuestoParaEditar(id), null)

  if (!datos) {
    return createPortal(
      <div className="fm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar() }}>
        <div className="fm-modal" style={{ maxWidth: 360 }}>
          <div className="fm-body">
            {error
              ? <p className="aviso-error" role="alert">{error}</p>
              : cargando && <p className="sin-resultados">Cargando presupuesto...</p>}
            <button type="button" className="fm-btn fm-btn--secondary" onClick={onCerrar}>Cerrar</button>
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <ModalNuevoPresupuesto
      titulo={`Presupuesto — ${nro}`}
      inicial={datos}
      puedeGenerarFactura={datos.nombreEstado !== 'Convertido'}
      clientes={clientes}
      productos={productos}
      onCerrar={onCerrar}
      onGuardar={async (payload) => {
        await actualizarPresupuesto(id, payload)
        onActualizado()
      }}
      onGenerarFactura={async () => {
        await generarFacturaDesdePresupuesto(id)
        onActualizado()
      }} />
  )
}

export default function Presupuestos() {
  const { datos, cargando, error, recargar } = useCargar(cargarPantalla, null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [idEstado, setIdEstado] = useState(null)   // null = Todos
  const [pagina, setPagina] = useState(1)

  const filas = datos?.filas ?? []
  const estados = datos?.estados ?? []

  const conteo = useMemo(() => Object.fromEntries(
    estados.map((e) => [e.id, filas.filter((f) => f.idEstado === e.id).length])), [estados, filas])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return filas.filter((f) =>
      (idEstado === null || f.idEstado === idEstado) &&
      (!q || f.nro.toLowerCase().includes(q) || f.cliente.toLowerCase().includes(q)))
  }, [filas, busqueda, idEstado])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA)

  const nroEditando = filas.find((f) => f.id === editandoId)?.nro ?? ''

  function tocarTarjeta(id) {
    setIdEstado(idEstado === id ? null : id)
    setPagina(1)
  }

  async function guardar(datosModal) {
    await crearPresupuesto(datosModal)   // lanza con userMessage si falla: el modal lo muestra
    setBusqueda('')
    setIdEstado(null)
    setPagina(1)
    setModalAbierto(false)
    recargar()
  }

  function alActualizar() {
    setEditandoId(null)
    recargar()
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Presupuestos</h1>

      {error && (
        <p className="aviso-error" role="alert">
          {error} <button type="button" className="link-reintentar" onClick={recargar}>Reintentar</button>
        </p>
      )}

      <div className="tiles-estado">
        {estados.map((e) => (
          <button key={e.id} type="button" className={'tile-estado' + (idEstado === e.id ? ' activa' : '')}
                  aria-pressed={idEstado === e.id} onClick={() => tocarTarjeta(e.id)}>
            <strong className={ESTADO_CLASE[e.nombre]}>{conteo[e.id] ?? 0}</strong>
            <span>{ESTADO_PLURAL[e.nombre]}</span>
          </button>
        ))}
      </div>

      <div className="filtros">
        <button type="button" className="btn-agregar" disabled={cargando || !datos}
                onClick={() => setModalAbierto(true)}>
          + Nuevo Presupuesto
        </button>
        <label className="campo-caja buscador">
          <IconSearch />
          <input type="search" placeholder="Buscar por numero o cliente..." aria-label="Buscar presupuestos"
                 value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }} />
        </label>
        <label className="filtro-estado">
          Estado:
          <select value={idEstado ?? ''} onChange={(e) => { setIdEstado(e.target.value ? Number(e.target.value) : null); setPagina(1) }}>
            <option value="">Todos</option>
            {estados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </label>
      </div>

      <div className="tabla-ventas tabla-presupuestos">
        <div className="fila cabecera">
          <span>#</span><span>Nro. Presupuesto</span><span>Cliente</span><span>Fecha</span>
          <span>Total</span><span>Estado</span><span />
        </div>

        {visibles.map((f, i) => (
          <div className="fila fila-dato" key={f.id}>
            <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
            <span className="c-nro">{f.nro}</span>
            <span>{f.cliente}</span>
            <span className="c-fecha">{fechaCorta(f.fecha)}</span>
            <span className="c-total">{gs(f.total)}</span>
            <span className={'c-estado ' + (ESTADO_CLASE[f.estado] ?? '')}>{f.estado}</span>
            <button className="btn-ver" aria-label={`Editar ${f.nro}`} onClick={() => setEditandoId(f.id)}>
              <IconPencil />
            </button>
          </div>
        ))}

        {cargando && <p className="sin-resultados">Cargando presupuestos...</p>}
        {!cargando && !error && visibles.length === 0 && <p className="sin-resultados">No se encontraron presupuestos</p>}

        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>

      {modalAbierto && datos && (
        <ModalNuevoPresupuesto
          clientes={datos.clientes}
          productos={datos.productos}
          onCerrar={() => setModalAbierto(false)}
          onGuardar={guardar} />
      )}

      {editandoId !== null && datos && (
        <ModalEditarPresupuesto
          key={editandoId}
          id={editandoId}
          nro={nroEditando}
          clientes={datos.clientes}
          productos={datos.productos}
          onCerrar={() => setEditandoId(null)}
          onActualizado={alActualizar} />
      )}
    </section>
  )
}
