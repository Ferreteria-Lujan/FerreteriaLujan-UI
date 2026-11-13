import { gateway } from "../gateway/client";
import { RUTAS } from "../gateway/routes";
import { recurso } from "./recurso";
import {
  fromFacturaCompraDTO,
  fromPedidoCompraDTO,
  fromProveedorDTO,
  toFacturaCompraDTO,
  toPedidoCompraDTO,
  toProveedorDTO,
} from "../dto/compras";
import { productos } from "./inventarioService";

export const proveedores = recurso(RUTAS.compras.proveedores, {
  desde: fromProveedorDTO,
  hacia: toProveedorDTO,
});
export const facturas = recurso(RUTAS.compras.facturas, {
  desde: fromFacturaCompraDTO,
  hacia: toFacturaCompraDTO,
});
export const detallesCompras = recurso(RUTAS.compras.detalles);
export const detallesPedidosCompras = recurso(RUTAS.compras.detallesPedidos);
export const pedidos = recurso(RUTAS.compras.pedidos, {
  desde: fromPedidoCompraDTO,
  hacia: toPedidoCompraDTO,
});

export async function listarPedidos() {
  const [lista, provs] = await Promise.all([
    pedidos.listarTodo({ sort: "fechaEmision,desc" }),
    proveedores.listarTodo({ sort: "nombre,asc" }),
  ]);
  const nombres = new Map(provs.map((p) => [p.id, p.nombreCompleto]));
  return lista.map((pedido) => ({
    ...pedido,
    proveedor: nombres.get(pedido.idProveedor) ?? `Proveedor #${pedido.idProveedor}`,
  }));
}

export async function crearPedido(datos, proveedor) {
  const fechaEmision = new Date().toLocaleDateString("en-CA");
  const base = {
    nro: `PED-${new Date().getFullYear()}-${Date.now()}`,
    idProveedor: datos.proveedorId,
    fechaEmision,
    fechaRecepcion: null,
    total: datos.total,
    pagado: false,
    estado: "En espera",
    observaciones: datos.observaciones,
  };
  const { data } = await gateway.post(RUTAS.compras.pedidos, {
    nroPedido: base.nro,
    idProveedor: base.idProveedor,
    fechaEmision: base.fechaEmision,
    observaciones: base.observaciones,
    detalles: datos.items.map((item) => ({
      idProducto: item.idProducto,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
    })),
  });
  const creado = fromPedidoCompraDTO(data);
  return {
    ...creado,
    proveedor: proveedor?.nombreCompleto ?? `Proveedor #${creado.idProveedor}`,
    items: datos.items,
  };
}

export async function actualizarPedido(pedido, cambios) {
  const accion = cambios.estado === "Recibido" ? "recibir" : cambios.pagado ? "pagar" : null;
  if (!accion) return { ...pedido, ...cambios };
  const { data } = await gateway.post(`${RUTAS.compras.pedidos}/${pedido.id}/${accion}`);
  return fromPedidoCompraDTO(data);
}

export async function listarFacturas() {
  const [lista, provs] = await Promise.all([
    facturas.listarTodo({ sort: "idFacturaCompra,desc" }),
    proveedores.listarTodo({ sort: "nombre,asc" }),
  ]);
  const nombres = new Map(provs.map((p) => [p.id, p.nombreCompleto]));
  return lista.map((f) => ({
    ...f,
    tercero: nombres.get(f.idProveedor) ?? `Proveedor #${f.idProveedor}`,
    estado: f.pagada ? "Sí" : "No",
  }));
}

export async function obtenerDetalleFacturaCompra(idFactura) {
  const [lineas, catalogo] = await Promise.all([
    detallesCompras
      .buscar({ idFacturaCompra: idFactura })
      .catch(() => detallesCompras.listarTodo({ idFacturaCompra: idFactura })),
    productos.listarTodo({ sort: "nombre,asc" }),
  ]);
  const porId = new Map(catalogo.map((producto) => [producto.id, producto]));
  return lineas
    .filter((linea) => Number(linea.idFacturaCompra) === Number(idFactura))
    .map((linea) => {
      const producto = porId.get(linea.idProducto);
      return {
        codigo: producto?.codigo ?? `PROD-${linea.idProducto}`,
        descripcion: producto?.nombre ?? `Producto #${linea.idProducto}`,
        cantidad: Number(linea.cantidad ?? 0),
        precioUnitario: Number(linea.precioUnitario ?? 0),
        subtotal: Number(
          linea.subtotal ?? Number(linea.cantidad ?? 0) * Number(linea.precioUnitario ?? 0),
        ),
      };
    });
}

export async function registrarFacturaCompra(d) {
  const { data } = await gateway.post(RUTAS.compras.registrarFactura, {
    idProveedor: d.idTercero,
    nroFactura: d.nro,
    fechaEmision: d.fechaEmision,
    fechaVencimiento: d.fechaVencimiento,
    idPedido: d.idPedido ?? null,
    detalles: d.items.map((item) => ({
      idProducto: item.id_producto,
      cantidad: item.cantidad,
      precioUnitario: item.precio_unitario,
    })),
  });
  return fromFacturaCompraDTO(data);
}
