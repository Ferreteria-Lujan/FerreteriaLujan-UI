import api from './cliente'

// Catálogos que vienen de ms-inventario (a través del gateway).
// ProductoDTO: { idProducto, nombre, codigo, descripcion, precioCompra, precioVenta, idMarca, idCategoria }
// TODO: confirmar que el controller de ms-inventario es /api/productos (mismo patrón que ms-compras).
const RUTAS = { productos: '/productos' }

const PAGINA = { size: 100 }   // máximo permitido por el backend; TODO: búsqueda por nombre/código si hay más productos

// -> { id, codigo, nombre, precioCompra, precioVenta }
export async function listarProductos() {
  const { data } = await api.get(RUTAS.productos, { params: { ...PAGINA, sort: 'nombre,asc' } })
  const lista = Array.isArray(data) ? data : data?.content ?? []
  return lista.map((p) => ({
    id: p.idProducto,
    codigo: p.codigo,
    nombre: p.nombre,
    precioCompra: p.precioCompra ?? 0,
    precioVenta: p.precioVenta ?? 0,
  }))
}
