import { gateway } from '../gateway/client'
import { RUTAS } from '../gateway/routes'
import { recurso } from './recurso'
import { productos } from './inventarioService'
import {
  fromClienteDTO, toClienteDTO, fromEstadoDTO,
  fromPresupuestoDTO, toPresupuestoDTO, fromPresupuestoDetalleDTO, toPresupuestoDetalleDTO,
  fromFacturaVentaDTO, fromDetalleFacturaVentaDTO,
} from '../dto/ventas'

export const clientes = recurso(RUTAS.ventas.clientes, { desde: fromClienteDTO, hacia: toClienteDTO })
export const estados = recurso(RUTAS.ventas.estados, { desde: fromEstadoDTO })
export const presupuestos = recurso(RUTAS.ventas.presupuestos, { desde: fromPresupuestoDTO, hacia: toPresupuestoDTO })
export const presupuestosDetalle = recurso(RUTAS.ventas.presupuestosDetalle, { desde: fromPresupuestoDetalleDTO })
export const facturas = recurso(RUTAS.ventas.facturas, { desde: fromFacturaVentaDTO })
export const detallesFacturas = recurso(RUTAS.ventas.detallesFacturas, { desde: fromDetalleFacturaVentaDTO })

const mapaNombres = (lista) => new Map(lista.map((c) => [c.id, c.nombreCompleto]))
const mapaEstados = (lista) => new Map(lista.map((e) => [e.id, e.nombre]))

// ---------- Clientes (terceros del formulario de factura) ----------

export async function listarTerceros() {
  const lista = await clientes.listar({ sort: 'nombre,asc' })
  return lista.map((c) => ({ id: c.id, etiqueta: c.etiqueta, claves: [c.ruc, c.ci].filter(Boolean) }))
}

export async function crearCliente(form) {
  const creado = await clientes.crear({
    nombre: form.nombre, ruc: form.ruc, telefono: form.telefono,
    correo: form.correo, direccion: form.direccion,
  })
  return { id: creado.id, etiqueta: creado.etiqueta }
}

// ---------- Presupuestos ----------

export async function listarPresupuestos() {
  const [pres, dets, cls, ests] = await Promise.all([
    presupuestos.listar({ sort: 'idPresupuesto,desc' }),
    presupuestosDetalle.buscar({}, { sort: 'idPresupuestoDetalle,desc' }),
    clientes.listar({ sort: 'nombre,asc' }),
    estados.listar(),
  ])
  const nombres = mapaNombres(cls)
  const nombreEstado = mapaEstados(ests)

  const totales = new Map()
  for (const d of dets) {
    totales.set(d.idPresupuesto, (totales.get(d.idPresupuesto) ?? 0) + d.cantidad * d.precioUnitario)
  }

  const filas = pres.map((p) => ({
    ...p,
    cliente: nombres.get(p.idCliente) ?? `Cliente #${p.idCliente}`,
    estado: nombreEstado.get(p.idEstado) ?? 'Sin estado',
    total: totales.get(p.id) ?? 0,
  }))
  return { filas, estados: ests }
}

// Cabecera + lineas en UNA sola peticion: el backend corre todo en una transaccion y decide el
// estado ("Pendiente"). Si una linea falla, el backend revierte todo; aca no hay nada que deshacer.
export async function crearPresupuesto({ id_cliente, detalles }) {
  const { data } = await gateway.post(`${RUTAS.ventas.presupuestos}/completo`, {
    cabecera: { idCliente: id_cliente },
    detalles: detalles.map((d) => ({
      idProducto: d.id_producto, cantidad: d.cantidad, precioUnitario: d.precio_unitario,
    })),
  })
  return fromPresupuestoDTO(data.presupuesto)
}

export async function obtenerPresupuestoParaEditar(id) {
  const [pre, dets, ests] = await Promise.all([
    presupuestos.obtener(id),
    presupuestosDetalle.buscar({ idPresupuesto: id }),
    estados.listar(),
  ])
  return {
    idCliente: pre.idCliente,
    fecha: pre.fecha,
    idEstado: pre.idEstado,
    nombreEstado: mapaEstados(ests).get(pre.idEstado) ?? '',
    detalles: dets.map((d) => ({
      idDetalle: d.id,
      id_producto: d.idProducto,
      cantidad: d.cantidad,
      precio: d.precioUnitario,
    })),
  }
}

// Edicion (agregar/quitar/actualizar lineas): sigue siendo varias peticiones desde el front.
// Pendiente: mover tambien esto a un PUT /completo en el backend (igual criterio que el alta).
export async function actualizarPresupuesto(id, { id_cliente, detalles }) {
  const actual = await presupuestos.obtener(id)
  await presupuestos.actualizar(id, { idCliente: id_cliente, fecha: actual.fecha, idEstado: actual.idEstado })

  const existentes = await presupuestosDetalle.buscar({ idPresupuesto: id })
  const conservar = new Set(detalles.map((d) => d.id).filter(Boolean))
  for (const viejo of existentes) {
    if (!conservar.has(viejo.id)) await presupuestosDetalle.eliminar(viejo.id)
  }
  for (const d of detalles) {
    const dto = toPresupuestoDetalleDTO(id, d)
    if (d.id) await presupuestosDetalle.actualizar(d.id, dto)
    else await presupuestosDetalle.crear(dto)
  }
  return actual
}

// El backend copia las lineas del presupuesto, crea la factura y marca "Convertido", todo atomico.
export async function generarFacturaDesdePresupuesto(id) {
  const { data } = await gateway.post(`${RUTAS.ventas.presupuestos}/${id}/generar-factura`)
  return fromFacturaVentaDTO(data.factura)
}

// ---------- Facturas de venta ----------

export async function listarFacturasVenta() {
  const [fs, cls, ests] = await Promise.all([
    facturas.listar({ sort: 'idFactura,desc' }),
    clientes.listar({ sort: 'nombre,asc' }),
    estados.listar(),
  ])
  const nombres = mapaNombres(cls)
  const nombreEstado = mapaEstados(ests)
  return fs.map((f) => ({
    id: f.id,
    nro: f.nro,
    tercero: nombres.get(f.idCliente) ?? `Cliente #${f.idCliente}`,
    fechaEmision: f.fechaEmision,
    fechaVencimiento: f.fechaVencimiento,
    total: f.total,
    esCredito: f.esCredito,
    estado: f.esCredito ? 'Crédito' : 'Contado',
    estadoNombre: nombreEstado.get(f.idEstado) ?? 'Sin estado',
  }))
}

export async function obtenerDetalleFacturaVenta(idFactura) {
  const [dets, prods] = await Promise.all([
    detallesFacturas.buscar({ idFactura }),
    productos.listar({ sort: 'nombre,asc' }),
  ])
  const porId = new Map(prods.map((p) => [p.id, p]))
  return dets.map((d) => {
    const p = porId.get(d.idProducto)
    return {
      codigo: p?.codigo ?? '—',
      descripcion: p?.nombre ?? `Producto #${d.idProducto}`,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      subtotal: d.cantidad * d.precioUnitario,
    }
  })
}

// Cabecera + lineas en UNA sola peticion: el backend calcula total, IVA y estado
// (Pagada/Pendiente segun esCredito) y corre todo en una transaccion.
export async function registrarVenta(d) {
  const { data } = await gateway.post(`${RUTAS.ventas.facturas}/completa`, {
    cabecera: {
      idCliente: d.idTercero,
      fechaEmision: d.fechaEmision,
      esCredito: d.esCredito,
      fechaVencimiento: d.fechaVencimiento,
    },
    detalles: d.items.map((item) => ({
      idProducto: item.id_producto, cantidad: item.cantidad, precioUnitario: item.precio_unitario,
    })),
  })
  return fromFacturaVentaDTO(data.factura)
}