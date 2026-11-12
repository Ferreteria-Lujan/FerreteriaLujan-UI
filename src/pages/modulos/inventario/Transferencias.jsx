import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconReceipt, IconTrash } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import DetalleModal from '../../../components/DetalleModal'
import ConfirmarEliminar from '../../../components/ConfirmarEliminar'
import { fechaCorta, gs } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { esAdmin } from '../../../gateway/roles'
import {
  transferencias as transferenciasApi, detallesTransferencia as detallesApi,
  productos as productosApi, depositos as depositosApi,
} from '../../../services/inventarioService'
import InventarioShell from './InventarioShell'

const COLUMNAS_DETALLE = [
  { key: 'codigo', label: 'Código', ancho: '130px' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'cantidad', label: 'Cant.', align: 'right', ancho: '60px' },
  { key: 'precio', label: 'P. Unit.', align: 'right', mono: true, ancho: '120px' },
  { key: 'subtotal', label: 'Subtotal', align: 'right', mono: true, ancho: '130px' },
]
const POR_PAGINA = 10

// El backend no tiene numero ni total de transferencia: el numero se arma con el id y el total
// se calcula con los detalles (cantidad x precio de venta actual del producto).
const nro = (id) => 'TRF-' + String(id).padStart(6, '0')

async function cargar() {
  const [trfs, dets, prods, deps] = await Promise.all([
    transferenciasApi.listarTodo({ sort: 'fechaCreacion,desc' }),
    detallesApi.listarTodo(),
    productosApi.listarTodo(),
    depositosApi.listarTodo(),
  ])
  const producto = new Map(prods.map((p) => [p.id, p]))
  const deposito = new Map(deps.map((d) => [d.id, d.nombre]))
  const porTransferencia = new Map()
  dets.forEach((d) => {
    if (!porTransferencia.has(d.idTransferencia)) porTransferencia.set(d.idTransferencia, [])
    porTransferencia.get(d.idTransferencia).push({ ...d, producto: producto.get(d.idProducto) })
  })
  return trfs.map((t) => {
    const items = porTransferencia.get(t.id) ?? []
    return {
      id: t.id, nro: nro(t.id), creador: t.creador, fecha: t.fechaCreacion, llegada: t.fechaEstimada,
      origen: deposito.get(t.idDepositoOrigen) ?? '—', destino: deposito.get(t.idDepositoDestino) ?? '—',
      items, total: items.reduce((s, i) => s + i.cantidad * (i.producto?.precioVenta ?? 0), 0),
    }
  })
}

function detalleDe(t) {
  const filas = t.items.map((i) => {
    const precio = i.producto?.precioVenta ?? 0
    return {
      codigo: i.producto?.codigo ?? '—', descripcion: i.producto?.nombre ?? `Producto ${i.idProducto}`,
      cantidad: i.cantidad, precio: gs(precio), subtotal: gs(precio * i.cantidad),
    }
  })
  return {
    title: `Transferencia — ${t.nro}`,
    campos: [
      { label: 'Depósito origen', value: t.origen },
      { label: 'Fecha realizada', value: fechaCorta(t.fecha) },
      { label: 'Depósito destino', value: t.destino },
      { label: 'Fecha estimada de llegada', value: fechaCorta(t.llegada) },
      { label: 'Autor', value: t.creador || '—' },
    ],
    filas,
    total: gs(t.total),
  }
}

export default function Transferencias() {
  const navigate = useNavigate()
  const { datos: transferencias, cargando, error, recargar } = useCargar(cargar)
  const [detalle, setDetalle] = useState(null)   // transferencia abierta en el modal
  const [aEliminar, setAEliminar] = useState(null)   // transferencia pendiente de confirmar
  const admin = esAdmin()   // solo el ADMIN ve el botón Eliminar
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)   // TODO: pedir esta página al backend (Tarea 6)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return transferencias.filter((t) =>
      !q || [t.nro, t.origen, t.destino, t.creador].some((c) => (c ?? '').toLowerCase().includes(q)))
  }, [transferencias, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  // El backend no borra en cascada: las lineas (detalles) referencian a la transferencia, asi que van primero.
  // OJO: no se revierte el stock (el backend tampoco lo mueve al crear la transferencia).
  async function eliminarTransferencia() {
    for (const i of aEliminar.items) await detallesApi.eliminar(i.id)
    await transferenciasApi.eliminar(aEliminar.id)   // DELETE /api/transferencias/{id} (solo ADMIN en el backend)
    setAEliminar(null)
    recargar()
  }

  return (
    <>
    <InventarioShell
      accion={<button type="button" className="btn-agregar" onClick={() => navigate('/inventario/transferencias/nueva')}>+ Nueva Transferencia</button>}
      busqueda={busqueda} onBusqueda={(v) => { setBusqueda(v); setPagina(1) }}
      placeholder="Buscar por número, depósito o autor...">
      <div className="fila cabecera">
        <span>#</span><span>Nro. Transferencia</span><span>Origen</span><span>Destino</span>
        <span>Total</span><span>Fecha</span><span>Autor</span><span />
      </div>

      {visibles.map((t, i) => (
        <div className="fila fila-dato" key={t.id}>
          <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
          <span className="c-nro">{t.nro}</span>
          <span>{t.origen}</span>
          <span>{t.destino}</span>
          <span className="c-total">{gs(t.total)}</span>
          <span className="c-fecha">{fechaCorta(t.fecha)}</span>
          <span className="c-fecha">{t.creador || '—'}</span>
          <div className="acciones-fila">
            <button className="btn-ver" aria-label={`Ver ${t.nro}`} onClick={() => setDetalle(t)}><IconReceipt /></button>
            {admin && (
              <button className="btn-ver btn-ver--peligro" aria-label={`Eliminar ${t.nro}`} onClick={() => setAEliminar(t)}><IconTrash /></button>
            )}
          </div>
        </div>
      ))}
      {cargando && <p className="sin-resultados">Cargando transferencias…</p>}
      {error && (
        <p className="sin-resultados" role="alert">
          {error} <button type="button" className="btn-ver" onClick={recargar}>Reintentar</button>
        </p>
      )}
      {!cargando && !error && visibles.length === 0 && <p className="sin-resultados">No se encontraron transferencias</p>}

      <div className="espacio" />
      <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </InventarioShell>

    {detalle && <DetalleModal {...detalleDe(detalle)} columnas={COLUMNAS_DETALLE} onClose={() => setDetalle(null)} />}

    {aEliminar && (
      <ConfirmarEliminar
        titulo="Eliminar transferencia"
        mensaje={`¿Eliminar la transferencia ${aEliminar.nro} (${aEliminar.origen} → ${aEliminar.destino})? Esta acción no se puede deshacer.`}
        onConfirmar={eliminarTransferencia}
        onClose={() => setAEliminar(null)} />
    )}
    </>
  )
}
