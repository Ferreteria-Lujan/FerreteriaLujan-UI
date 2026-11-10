import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import FacturaForm from '../../../components/factura/FacturaForm'
import { FACTURA_COMPRA } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { crearFacturaCompra, crearProveedor, listarProveedores } from '../../../api/compras'
import { listarProductos } from '../../../api/inventario'

// Nueva factura de compra: el formulario es el componente compartido con Ventas.
// Esta página solo trae los catálogos (proveedores, productos) y guarda en ms-compras.
export default function NuevaFacturaCompra() {
  const navigate = useNavigate()
  const proveedores = useCargar(listarProveedores)
  const productos = useCargar(listarProductos)

  // En una compra el precio de lista es el precio de compra (el costo)
  const productosCompra = useMemo(
    () => productos.datos.map((p) => ({ id: p.id, codigo: p.codigo, nombre: p.nombre, precio: p.precioCompra })),
    [productos.datos],
  )

  async function nuevoProveedor(datos) {
    const creado = await crearProveedor(datos)
    proveedores.recargar()   // la lista incluye al nuevo
    return creado
  }

  async function confirmar(datos) {
    await crearFacturaCompra(datos)
    navigate(FACTURA_COMPRA.rutaAlGuardar)
  }

  return (
    <FacturaForm
      config={FACTURA_COMPRA}
      terceros={proveedores.datos}
      productos={productosCompra}
      cargando={proveedores.cargando || productos.cargando}
      error={proveedores.error || productos.error}
      onNuevoTercero={nuevoProveedor}
      onConfirmar={confirmar} />
  )
}
