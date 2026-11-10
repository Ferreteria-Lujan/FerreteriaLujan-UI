import api from './cliente'

// Todo lo que habla con ms-compras (a través del gateway: baseURL '/api' + estos paths).
// Contrato real de ms-compras (DTO de commons, JSON en camelCase, listas paginadas con `Page` de Spring).
// Los nombres de campo del backend viven SOLO en este archivo: las pantallas usan la forma "de la UI".
const RUTAS = {
  facturas: '/facturas-compras',
  detalles: '/detalles-compras',
  proveedores: '/proveedores',
}

// El backend limita size a 100 (PAGE_MAX_SIZE). Se pide una página grande y se pagina en pantalla.
// TODO: si hay más de 100 registros, pasar a paginación real (?page=) o a /search con filtros.
const PAGINA = { size: 100 }

const contenido = (data) => (Array.isArray(data) ? data : data?.content ?? [])   // Page => content

// ------------------------------------------------------------------ Proveedores
// ProveedorDTO: { idPersona, nombre, apellido, ruc, direccion, telefono, correo, tipoPersona, plazoEntrega, ... }
// -> { id, nombre, etiqueta, claves }   (etiqueta = lo que se ve en el buscador; claves = RUC exacto)
const nombreCompleto = (p) => [p.nombre, p.apellido].filter(Boolean).join(' ')
const mapProveedor = (p) => ({
  id: p.idPersona,
  nombre: nombreCompleto(p),
  etiqueta: `${p.ruc || 'S/D'} · ${nombreCompleto(p)}`,
  claves: [p.ruc].filter(Boolean),
})

export async function listarProveedores() {
  const { data } = await api.get(RUTAS.proveedores, { params: { ...PAGINA, sort: 'nombre,asc' } })
  return contenido(data).map(mapProveedor)
}

// `datos` viene del modal: { nombre, ruc, telefono, correo, ciudad, direccion } (vacíos = null).
// 'ciudad' no existe en PersonaDTO: no se envía. El backend responde 409 si el RUC ya existe.
export async function crearProveedor({ nombre, ruc, telefono, correo, direccion }) {
  const { data } = await api.post(RUTAS.proveedores, { nombre, ruc, telefono, correo, direccion })
  return mapProveedor(data)
}

// ------------------------------------------------------------------ Facturas de compra
// FacturaCompraDTO: { idFacturaCompra, idProveedor, timbrado, nroFactura, fechaEmision, importeTotal,
//                     fechaVencimiento, idEstado, codigoFactura }
// El DTO trae solo ids: el nombre del proveedor se resuelve con la lista de proveedores.
// No hay endpoint de estados ni campo "pagada": las facturas listadas están todas activas (las anuladas no se
// devuelven), así que la columna muestra la CONDICIÓN: con fecha de vencimiento = Crédito, sin ella = Contado.
// -> { id, nro, tercero, fechaEmision, fechaVencimiento, total, estado }
export async function listarFacturasCompra() {
  const [facturas, proveedores] = await Promise.all([
    api.get(RUTAS.facturas, { params: { ...PAGINA, sort: 'idFacturaCompra,desc' } }),
    listarProveedores(),
  ])
  const nombres = new Map(proveedores.map((p) => [p.id, p.nombre]))
  return contenido(facturas.data).map((f) => ({
    id: f.idFacturaCompra,
    nro: f.nroFactura,
    tercero: nombres.get(f.idProveedor) ?? `Proveedor #${f.idProveedor}`,
    fechaEmision: f.fechaEmision,
    fechaVencimiento: f.fechaVencimiento,
    total: f.importeTotal ?? 0,
    estado: f.fechaVencimiento ? 'Crédito' : 'Contado',
  }))
}

// `d` es lo que entrega FacturaForm.onConfirmar.
// ms-compras no recibe la factura con sus líneas en un solo POST: primero se crea la factura (importe 0) y después
// cada línea en /detalles-compras. El servidor calcula montoIva y subtotal de cada línea y recalcula el importe total
// de la factura (lo que se envíe de IVA/subtotal/importe se ignora).
export async function crearFacturaCompra(d) {
  const { data: factura } = await api.post(RUTAS.facturas, {
    idProveedor: d.idTercero,
    nroFactura: d.nro,
    timbrado: Number(d.timbrado),
    fechaEmision: d.fechaEmision,
    fechaVencimiento: d.fechaVencimiento,   // null = contado
  })

  try {
    // En orden, una por una: cada alta recalcula el total de la factura y en paralelo se pisarían entre sí
    for (const it of d.items) {
      await api.post(RUTAS.detalles, {
        idFacturaCompra: factura.idFacturaCompra,
        idProducto: it.id_producto,
        cantidad: it.cantidad,
        precioUnitario: it.precio_unitario,
        porcentajeIva: d.porcentajeIva,
      })
    }
  } catch (err) {
    // No hay transacción entre los dos pasos: se intenta anular la factura (borrado lógico; el DELETE exige rol ADMIN)
    let anulada = true
    try { await api.delete(`${RUTAS.facturas}/${factura.idFacturaCompra}`) } catch { anulada = false }
    err.userMessage = `No se pudo registrar la compra: ${err.userMessage}` +
      (anulada ? '' : ` La factura ${d.nro} quedó incompleta: pedile a un administrador que la anule.`)
    throw err
  }
  return factura
}
