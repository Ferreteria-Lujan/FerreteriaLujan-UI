import { useState } from 'react'
import FacturaLista from '../../../components/factura/FacturaLista'
import { FACTURA_VENTA } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { listarFacturasVenta } from '../../../services/ventasService'
import VerFacturaVenta from './VerFacturaVenta'

export default function Facturas() {
  const { datos, cargando, error, recargar } = useCargar(listarFacturasVenta)
  const [verFactura, setVerFactura] = useState(null)

  return (
    <>
      <FacturaLista
        config={FACTURA_VENTA}
        facturas={datos}
        cargando={cargando}
        error={error}
        onReintentar={recargar}
        onVer={setVerFactura} />

      {verFactura && <VerFacturaVenta factura={verFactura} onCerrar={() => setVerFactura(null)} />}
    </>
  )
}
