import FacturaLista from '../../../components/factura/FacturaLista'
import { FACTURA_COMPRA } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { listarFacturasCompra } from '../../../api/compras'

// Facturas de compra: la lista es el componente compartido con Ventas; acá solo se le da la config y los datos.
export default function FacturasCompras() {
  const { datos, cargando, error, recargar } = useCargar(listarFacturasCompra)
  return <FacturaLista config={FACTURA_COMPRA} facturas={datos} cargando={cargando} error={error} onReintentar={recargar} />
}
