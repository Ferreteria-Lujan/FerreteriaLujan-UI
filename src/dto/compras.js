// DTOs de ms-compras (commons): ProveedorDTO (hereda PersonaDTO), FacturaCompraDTO, DetalleFacturaCompraDTO.
import { textoONull } from "./comun";

export const fromProveedorDTO = (p) => {
  const nombreCompleto = [p.nombre, p.apellido].filter(Boolean).join(" ");
  return {
    id: p.idPersona,
    nombre: p.nombre ?? "",
    apellido: p.apellido ?? null,
    nombreCompleto,
    ruc: p.ruc ?? null,
    telefono: p.telefono ?? null,
    correo: p.correo ?? null,
    direccion: p.direccion ?? null,
    etiqueta: `${p.ruc || "S/D"} · ${nombreCompleto}`,
  };
};

export const toProveedorDTO = (f) => ({
  nombre: textoONull(f.nombre),
  ruc: textoONull(f.ruc),
  telefono: textoONull(f.telefono),
  correo: textoONull(f.correo),
  direccion: textoONull(f.direccion),
});

export const fromFacturaCompraDTO = (f) => {
  const referenciaPedido = f.codigoFactura?.startsWith("PED-")
    ? Number(f.codigoFactura.slice(4)) || null
    : null;
  const idPedido = f.idPedido ?? referenciaPedido;
  return {
    id: f.idFacturaCompra,
    idProveedor: f.idProveedor,
    nro: f.nroFactura,
    timbrado: f.timbrado,
    fechaEmision: f.fechaEmision,
    fechaVencimiento: f.fechaVencimiento,
    total: f.importeTotal ?? 0,
    idEstado: f.idEstado,
    idPedido,
    pagada: f.pagada ?? f.pagoRealizado ?? Boolean(idPedido),
    observaciones: f.observaciones ?? null,
  };
};

// El importe, IVA y subtotal los calcula el servidor: no se envían.
export const toFacturaCompraDTO = (d) => ({
  idProveedor: d.idTercero ?? d.idProveedor,
  nroFactura: textoONull(d.nro),
  fechaEmision: d.fechaEmision,
  fechaVencimiento: d.fechaVencimiento || null,
  idPedido: d.idPedido ?? null,
});

export const toDetalleFacturaCompraDTO = (idFacturaCompra, item, porcentajeIva) => ({
  idFacturaCompra,
  idProducto: item.id_producto,
  cantidad: item.cantidad,
  precioUnitario: item.precio_unitario,
  porcentajeIva,
});

const nombreEstado = (p) => p.nombreEstado ?? p.estado?.nombre ?? p.estado ?? "En espera";

export const fromPedidoCompraDTO = (p) => ({
  id: p.idPedido,
  nro: p.nroPedido,
  idProveedor: p.idProveedor,
  fechaEmision: p.fechaEmision,
  fechaRecepcion: p.fechaRecepcion ?? null,
  total: Number(p.total ?? 0),
  pagado: Boolean(p.pagado),
  idEstado: p.idEstado ?? null,
  estado: nombreEstado(p) === "Pendiente" ? "En espera" : nombreEstado(p),
  observaciones: p.observaciones ?? "",
  items: p.items ?? p.detalles ?? [],
});

export const toPedidoCompraDTO = (p) => ({
  nroPedido: p.nro,
  idProveedor: p.idProveedor,
  fechaEmision: p.fechaEmision,
  fechaRecepcion: p.fechaRecepcion || null,
  total: Number(p.total ?? 0),
  pagado: Boolean(p.pagado),
  idEstado: p.idEstado ?? null,
  observaciones: p.observaciones || null,
});

export const toDetallePedidoCompraDTO = (idPedido, item) => ({
  idPedido,
  idProducto: item.idProducto ?? item.id_producto ?? null,
  cantidad: Number(item.cantidad),
  precioUnitario: Number(item.precioUnitario ?? item.precio_unitario),
});
