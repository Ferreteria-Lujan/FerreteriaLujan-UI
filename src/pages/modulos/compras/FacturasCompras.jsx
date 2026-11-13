import { useState } from "react";
import FacturaLista from "../../../components/factura/FacturaLista";
import { FACTURA_COMPRA } from "../../../components/factura/facturaConfig";
import useCargar from "../../../hooks/useCargar";
import { listarFacturas } from "../../../services/comprasService";
import VerFacturaCompra from "./VerFacturaCompra";

// Facturas de compra: la lista es el componente compartido con Ventas.
export default function FacturasCompras() {
  const { datos, cargando, error, recargar } = useCargar(listarFacturas);
  const [verFactura, setVerFactura] = useState(null);
  return (
    <>
      <FacturaLista
        config={FACTURA_COMPRA}
        facturas={datos}
        cargando={cargando}
        error={error}
        onReintentar={recargar}
        onVer={setVerFactura}
      />
      {verFactura && <VerFacturaCompra factura={verFactura} onCerrar={() => setVerFactura(null)} />}
    </>
  );
}
