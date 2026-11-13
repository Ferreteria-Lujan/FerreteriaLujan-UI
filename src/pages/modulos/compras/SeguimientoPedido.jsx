import DetalleModal from "../../../components/DetalleModal";
import { fechaCorta, gs } from "../../../components/factura/facturaConfig";

const pasos = ["En espera", "En proceso", "Recibido"];

export default function SeguimientoPedido({ pedido, onCerrar }) {
  const estado = pedido.estado === "Pendiente" ? "En espera" : pedido.estado;
  const pasoActual = Math.max(0, pasos.indexOf(estado));
  const filas = (pedido.items ?? []).map((item) => ({
    codigo: item.codigo,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precio: gs(item.precioUnitario),
    subtotal: gs(item.cantidad * item.precioUnitario),
  }));

  return (
    <DetalleModal
      title={`Seguimiento — ${pedido.nro}`}
      width={768}
      campos={[
        { label: "Proveedor", value: pedido.proveedor },
        { label: "Fecha de emisión", value: fechaCorta(pedido.fechaEmision) },
        { label: "Fecha de recepción", value: fechaCorta(pedido.fechaRecepcion) },
        { label: "Estado", value: estado },
        { label: "Pagado", value: pedido.pagado ? "Sí" : "No" },
        { label: "Observaciones", value: pedido.observaciones || "—" },
      ]}
      columnas={[
        { key: "codigo", label: "Código", ancho: "1.15fr", mono: true },
        { key: "descripcion", label: "Descripción", ancho: "1.6fr" },
        { key: "cantidad", label: "Cant.", ancho: ".65fr", align: "right" },
        { key: "precio", label: "P. Unit.", ancho: "1fr", align: "right", mono: true },
        { key: "subtotal", label: "Subtotal", ancho: "1.1fr", align: "right", mono: true },
      ]}
      filas={filas}
      total={gs(pedido.total)}
      extra={
        <div className="seguimiento">
          <p>Línea de Seguimiento</p>
          <div className="seguimiento-pasos">
            {pasos.map((paso, indice) => (
              <div
                className={`seguimiento-paso ${indice <= pasoActual ? "completo" : ""}`}
                key={paso}
              >
                <div>
                  <span>{indice + 1}</span>
                </div>
                <small>{paso}</small>
              </div>
            ))}
          </div>
        </div>
      }
      onClose={onCerrar}
    />
  );
}
