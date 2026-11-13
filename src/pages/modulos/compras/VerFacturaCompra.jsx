import DetalleModal from "../../../components/DetalleModal";
import useCargar from "../../../hooks/useCargar";
import { fechaCorta, gs } from "../../../components/factura/facturaConfig";
import { obtenerDetalleFacturaCompra } from "../../../services/comprasService";

export default function VerFacturaCompra({ factura, onCerrar }) {
  const detalle = useCargar(() => obtenerDetalleFacturaCompra(factura.id));
  const filas = detalle.datos.map((linea) => ({
    codigo: linea.codigo,
    descripcion: linea.descripcion,
    cantidad: linea.cantidad,
    precio: gs(linea.precioUnitario),
    subtotal: gs(linea.subtotal),
  }));

  return (
    <DetalleModal
      title={`Factura — ${factura.nro}`}
      width={768}
      campos={[
        { label: "Proveedor", value: factura.tercero || "—" },
        { label: "Fecha", value: fechaCorta(factura.fechaEmision) },
        { label: "Vencimiento", value: fechaCorta(factura.fechaVencimiento) },
        { label: "Pagada", value: factura.pagada ? "Sí" : "No" },
        { label: "Pedido asociado", value: factura.idPedido ? `PED-${factura.idPedido}` : "—" },
        { label: "Observaciones", value: factura.observaciones || "—" },
      ]}
      columnas={[
        { key: "codigo", label: "Código", ancho: "1.2fr", mono: true },
        { key: "descripcion", label: "Descripción", ancho: "1.7fr" },
        { key: "cantidad", label: "Cant.", ancho: ".65fr", align: "right" },
        { key: "precio", label: "P. Unit.", ancho: "1fr", align: "right", mono: true },
        { key: "subtotal", label: "Subtotal", ancho: "1.1fr", align: "right", mono: true },
      ]}
      filas={filas}
      total={gs(factura.total)}
      mensaje={detalle.cargando ? "Cargando detalle..." : detalle.error}
      onClose={onCerrar}
    />
  );
}
