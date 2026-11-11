import FacturaLista from '../../../components/factura/FacturaLista'
import { FACTURA_VENTA } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { listarFacturasVenta } from '../../../services/ventasService'

// Facturas de venta: lista desde ms-ventas.
export default function Facturas() {
  const { datos, cargando, error, recargar } = useCargar(listarFacturasVenta)
  return <FacturaLista config={FACTURA_VENTA} facturas={datos} cargando={cargando} error={error} onReintentar={recargar} />
}
