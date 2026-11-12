import { RUTAS } from '../gateway/routes'
import { recurso } from './recurso'
import { productos } from './inventarioService'
import {
  fromClienteDTO, toClienteDTO, fromEstadoDTO,
  fromPresupuestoDTO, toPresupuestoDTO, fromPresupuestoDetalleDTO, toPresupuestoDetalleDTO,
  fromFacturaVentaDTO, toFacturaVentaDTO, toDetalleFacturaVentaDTO, fromDetalleFacturaVentaDTO,
} from '../dto/ventas'

const hoyISO = () => new Date().toLocaleDateString('en-CA')   // YYYY-MM-DD en hora local
const IVA_VENTA = 0.10                                         // igual que FACTURA_VENTA.iva (IVA aparte)

export const clientes = recurso(RUTAS.ventas.clientes, { desde: fromClienteDTO, hacia: toClienteDTO })
export const estados = recurso(RUTAS.ventas.estados, { desde: fromEstadoDTO })
export const presupuestos = recurso(RUTAS.ventas.presupuestos, { desde: fromPresupuestoDTO, hacia: toPresupuestoDTO })
export const presupuestosDetalle = recurso(RUTAS.ventas.presupuestosDetalle, { desde: fromPresupuestoDetalleDTO })
export const facturas = recurso(RUTAS.ventas.facturas, { desde: fromFacturaVentaDTO, hacia: toFacturaVentaDTO })
export const detallesFacturas = recurso(RUTAS.ventas.detallesFacturas, { desde: fromDetalleFacturaVentaDTO })

// Id de un estado por su nombre (sin ids fijos en el codigo)
async function idEstadoPorNombre(nombre) {
  const lista = await estados.listar()
  const encontrado = lista.find((e) => e.nombre.trim().toLowerCase() === nombre.toLowerCase())
  if (!encontrado) throw new Error(`No existe el estado "${nombre}" en la tabla estados`)
  return encontrado.id
}

const mapaNombres = (lista) => new Map(lista.map((c) => [c.id, c.nombreCompleto]))
const mapaEstados = (lista) => new Map(lista.map((e) => [e.id, e.nombre]))

// ---------- Clientes (terceros del formulario de factura) ----------

export async function listarTerceros() {
  const lista = await clientes.listar({ sort: 'nombre,asc' })
  return lista.map((c) => ({ id: c.id, etiqueta: c.etiqueta, claves: [c.ruc, c.ci].filter(Boolean) }))
}

// Recibe lo que entrega ModalNuevoCliente (la ciudad no existe en el backend y se descarta)
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

// 1) Cabecera del presupuesto  2) una linea por producto
// Si una linea falla, se intenta borrar la cabecera (borrado logico, requiere ADMIN).
export async function crearPresupuesto({ id_cliente, detalles }) {
  const idEstado = await idEstadoPorNombre('Pendiente')
  const cabecera = await presupuestos.crear({ idCliente: id_cliente, fecha: hoyISO(), idEstado })
  try {
    for (const d of detalles) {
      await presupuestosDetalle.crear(toPresupuestoDetalleDTO(cabecera.id, d))
    }
  } catch (err) {
    await presupuestos.eliminar(cabecera.id).catch(() => {})
    err.userMessage = `No se pudo guardar el presupuesto: ${err.userMessage ?? err.message}`
    throw err
  }
  return cabecera
}

// Datos del presupuesto para el modal de edición (cabecera + líneas con su id)
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

// Guarda cabecera y líneas. detalles: [{ id (null si es nueva), id_producto, cantidad, precio_unitario }]
// Las líneas que ya no están se borran (requiere ADMIN), las existentes se actualizan y las nuevas se crean.
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

// Crea la factura de venta con las líneas del presupuesto y marca el presupuesto como Convertido.
// Lee el presupuesto del servidor (no lo que haya en pantalla). Si falla una línea, se intenta anular la factura.
export async function generarFacturaDesdePresupuesto(id) {
  const [pre, dets, idPendiente, idConvertido] = await Promise.all([
    presupuestos.obtener(id),
    presupuestosDetalle.buscar({ idPresupuesto: id }),
    idEstadoPorNombre('Pendiente'),
    idEstadoPorNombre('Convertido'),
  ])
  if (dets.length === 0) throw new Error('El presupuesto no tiene productos')

  const base = dets.reduce((s, d) => s + d.cantidad * d.precioUnitario, 0)
  const iva = Math.round(base * IVA_VENTA)
  const factura = await facturas.crear({
    idCliente: pre.idCliente,
    idPresupuesto: id,
    fechaEmision: hoyISO(),
    esCredito: false,
    fechaVencimiento: null,
    total: base + iva,
    iva,
    idEstado: idPendiente,
  })
  try {
    for (const d of dets) {
      await detallesFacturas.crear(toDetalleFacturaVentaDTO(factura.id, {
        id_producto: d.idProducto, cantidad: d.cantidad, precio_unitario: d.precioUnitario,
      }))
    }
    await presupuestos.actualizar(id, { idCliente: pre.idCliente, fecha: pre.fecha, idEstado: idConvertido })
  } catch (err) {
    await facturas.eliminar(factura.id).catch(() => {})
    err.userMessage = `No se pudo generar la factura: ${err.userMessage ?? err.message}`
    throw err
  }
  return factura
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
    estado: f.esCredito ? 'Crédito' : 'Contado',                // columna de la lista (igual que compras)
    estadoNombre: nombreEstado.get(f.idEstado) ?? 'Sin estado', // estado de ms-ventas, para el modal
  }))
}

// Líneas de una factura con código y nombre del producto
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

// d: lo que entrega FacturaForm a onConfirmar
// 1) Cabecera de la factura  2) una linea por producto
export async function registrarVenta(d) {
  const idEstado = await idEstadoPorNombre('Pendiente')
  const factura = await facturas.crear({
    idCliente: d.idTercero,
    fechaEmision: d.fechaEmision,
    esCredito: d.esCredito,
    fechaVencimiento: d.fechaVencimiento,
    total: d.total,
    iva: d.iva,
    idEstado,
  })
  try {
    for (const item of d.items) {
      await detallesFacturas.crear(toDetalleFacturaVentaDTO(factura.id, item))
    }
  } catch (err) {
    await facturas.eliminar(factura.id).catch(() => {})
    err.userMessage = `No se pudo registrar la venta: ${err.userMessage ?? err.message}`
    throw err
  }
  return factura
}
