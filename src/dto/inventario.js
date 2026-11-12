// DTOs de ms-inventario (OpenAPI del servicio): ProductoDTO, MarcaDTO, CategoriaProductoDTO, DepositoDTO,
// InventarioDTO, TransferenciaDTO, DetalleTransferenciaDTO.
const num = (v) => (v == null ? null : Number(v))

export const fromProductoDTO = (p) => ({
  id: p.idProducto,
  codigo: p.codigo ?? '',
  nombre: p.nombre ?? '',
  descripcion: p.descripcion ?? null,
  precioCompra: Number(p.precioCompra ?? 0),
  precioVenta: Number(p.precioVenta ?? 0),
  idMarca: p.idMarca ?? null,
  idCategoria: p.idCategoria ?? null,
})
// idMarca es obligatorio en el backend
export const toProductoDTO = (p) => ({
  codigo: p.codigo,
  nombre: p.nombre,
  descripcion: p.descripcion ?? null,
  precioCompra: p.precioCompra,
  precioVenta: p.precioVenta,
  idMarca: p.idMarca,
  idCategoria: p.idCategoria ?? null,
})

export const fromMarcaDTO = (m) => ({ id: m.idMarca, nombre: m.nombre ?? '' })
export const fromCategoriaDTO = (c) => ({ id: c.idCategoria, nombre: c.nombre ?? '', descripcion: c.descripcion ?? null })

export const fromDepositoDTO = (d) => ({ id: d.idDeposito, nombre: d.nombre ?? '' })
export const toDepositoDTO = (d) => ({ nombre: d.nombre })

// Stock de un producto en un deposito
export const fromInventarioDTO = (i) => ({
  id: i.id ?? null,
  idDeposito: i.idDeposito,
  idProducto: i.idProducto,
  cantidad: Number(i.cantidad ?? 0),
  stockMinimo: num(i.stockMinimo),
  stockMaximo: num(i.stockMaximo),
})
export const toInventarioDTO = (i) => ({
  idDeposito: i.idDeposito,
  idProducto: i.idProducto,
  cantidad: i.cantidad,
  stockMinimo: i.stockMinimo ?? null,
  stockMaximo: i.stockMaximo ?? null,
})

// El backend no tiene numero, total ni estado de transferencia: solo estos campos
export const fromTransferenciaDTO = (t) => ({
  id: t.idTransferencia,
  fechaCreacion: t.fechaCreacion ?? null,
  fechaEstimada: t.fechaEstimada ?? null,
  creador: t.creador ?? '',
  idDepositoOrigen: t.idDepositoOrigen,
  idDepositoDestino: t.idDepositoDestino ?? null,
})
export const toTransferenciaDTO = (t) => ({
  fechaCreacion: t.fechaCreacion,
  fechaEstimada: t.fechaEstimada ?? null,
  creador: t.creador,
  idDepositoOrigen: t.idDepositoOrigen,
  idDepositoDestino: t.idDepositoDestino,
})

export const fromDetalleTransferenciaDTO = (d) => ({
  id: d.idDetTrans,
  idTransferencia: d.idTransferencia,
  idProducto: d.idProducto,
  cantidad: Number(d.cantidad ?? 0),
})
export const toDetalleTransferenciaDTO = (d) => ({
  idTransferencia: d.idTransferencia,
  idProducto: d.idProducto,
  cantidad: d.cantidad,
})
