// DTOs de ms-inventario (commons): ProductoDTO, DepositoDTO, InventarioDTO.
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

export const fromDepositoDTO = (d) => ({
  id: d.idDeposito,
  nombre: d.nombre ?? '',
})

// Stock de un producto en un deposito
export const fromInventarioDTO = (i) => ({
  id: i.id ?? null,
  idDeposito: i.idDeposito,
  idProducto: i.idProducto,
  cantidad: Number(i.cantidad ?? 0),
})
