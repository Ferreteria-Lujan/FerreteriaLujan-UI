// DTOs de ms-ventas (commons): ClienteDTO (hereda PersonaDTO), EstadoDTO, PresupuestoDTO,
// PresupuestoDetalleDTO, FacturaVentaDTO, DetalleFacturaVentaDTO.
import { numeroONull, textoONull } from './comun'

export const fromClienteDTO = (c) => {
  const nombre = [c.nombre, c.apellido].filter(Boolean).join(' ')
  return {
    id: c.idPersona,
    nombre: c.nombre ?? '',
    apellido: c.apellido ?? null,
    nombreCompleto: nombre,
    ruc: c.ruc ?? null,
    ci: c.ci ?? null,
    telefono: c.telefono ?? null,
    correo: c.correo ?? null,
    direccion: c.direccion ?? null,
    limiteSaldo: c.limiteSaldo ?? null,
    saldoActual: c.saldoActual ?? 0,
    etiqueta: `${c.ruc || c.ci || 'S/D'} · ${nombre}`,
  }
}

export const toClienteDTO = (f) => ({
  nombre: textoONull(f.nombre),
  apellido: textoONull(f.apellido),
  ruc: textoONull(f.ruc),
  ci: textoONull(f.ci),
  telefono: textoONull(f.telefono),
  correo: textoONull(f.correo),
  direccion: textoONull(f.direccion),
  limiteSaldo: numeroONull(f.limiteSaldo),
  saldoActual: numeroONull(f.saldoActual) ?? 0,
})

export const fromEstadoDTO = (e) => ({
  id: e.idEstado,
  nombre: e.nombre ?? '',
})

// Presupuesto: la tabla no tiene numero, se deriva del id
export const fromPresupuestoDTO = (p) => ({
  id: p.idPresupuesto,
  nro: 'PRE-' + String(p.idPresupuesto).padStart(6, '0'),
  idCliente: p.idCliente,
  fecha: p.fecha,
  idEstado: p.idEstado ?? null,
})

export const toPresupuestoDTO = (d) => ({
  idCliente: d.idCliente,
  fecha: d.fecha,
  idEstado: d.idEstado,
})

export const fromPresupuestoDetalleDTO = (d) => ({
  id: d.idPresupuestoDetalle,
  idPresupuesto: d.idPresupuesto,
  idProducto: d.idProducto,
  cantidad: Number(d.cantidad ?? 0),
  precioUnitario: Number(d.precioUnitario ?? 0),
})

// Linea de la UI ({ id_producto, cantidad, precio_unitario }) -> detalle del backend
export const toPresupuestoDetalleDTO = (idPresupuesto, item) => ({
  idPresupuesto,
  idProducto: item.id_producto,
  cantidad: item.cantidad,
  precioUnitario: item.precio_unitario,
})

export const fromFacturaVentaDTO = (f) => ({
  id: f.idFactura,
  idCliente: f.idCliente,
  idPresupuesto: f.idPresupuesto ?? null,
  nro: f.nroFactura ?? f.codigoFactura ?? 'FAC-' + String(f.idFactura).padStart(6, '0'),
  fechaEmision: f.fechaEmision,
  fechaVencimiento: f.fechaVencimiento ?? null,
  total: Number(f.importeTotal ?? 0),
  iva: Number(f.iva ?? 0),
  esCredito: !!f.esCredito,
  idEstado: f.idEstado ?? null,
})

// El backend no genera numero de factura ni calcula el total: se envia lo que calculo el formulario
export const toFacturaVentaDTO = (d) => ({
  idCliente: d.idCliente,
  idPresupuesto: d.idPresupuesto ?? null,
  fechaEmision: d.fechaEmision,
  esCredito: !!d.esCredito,
  fechaVencimiento: d.fechaVencimiento || null,
  importeTotal: d.total,
  iva: d.iva,
  idEstado: d.idEstado,
})

export const toDetalleFacturaVentaDTO = (idFactura, item) => ({
  idFactura,
  idProducto: item.id_producto,
  cantidad: item.cantidad,
  precioUnitario: item.precio_unitario,
})

// Línea de factura de venta (el detalle trae solo idProducto; código y nombre se cruzan en el servicio)
export const fromDetalleFacturaVentaDTO = (d) => ({
  id: d.id,
  idFactura: d.idFactura,
  idProducto: d.idProducto,
  cantidad: Number(d.cantidad ?? 0),
  precioUnitario: Number(d.precioUnitario ?? 0),
})
