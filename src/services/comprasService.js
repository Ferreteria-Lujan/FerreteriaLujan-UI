import { gateway } from '../gateway/client'
import { RUTAS } from '../gateway/routes'
import { recurso } from './recurso'
import {
  fromFacturaCompraDTO, fromProveedorDTO, toDetalleFacturaCompraDTO,
  toFacturaCompraDTO, toProveedorDTO,
} from '../dto/compras'

export const proveedores = recurso(RUTAS.compras.proveedores, { desde: fromProveedorDTO, hacia: toProveedorDTO })
export const facturas = recurso(RUTAS.compras.facturas, { desde: fromFacturaCompraDTO, hacia: toFacturaCompraDTO })
export const detalles = recurso(RUTAS.compras.detalles)

const condicion = (f) => (f.fechaVencimiento ? 'Crédito' : 'Contado')

// Lista de facturas con el nombre del proveedor (el DTO trae solo idProveedor)
export async function listarFacturas() {
  const [lista, provs] = await Promise.all([
    facturas.listar({ sort: 'idFacturaCompra,desc' }),
    proveedores.listar({ sort: 'nombre,asc' }),
  ])
  const nombres = new Map(provs.map((p) => [p.id, p.nombreCompleto]))
  return lista.map((f) => ({
    id: f.id,
    nro: f.nro,
    tercero: nombres.get(f.idProveedor) ?? `Proveedor #${f.idProveedor}`,
    fechaEmision: f.fechaEmision,
    fechaVencimiento: f.fechaVencimiento,
    total: f.total,
    estado: condicion(f),
  }))
}

// 1) Cabecera de la factura (importe 0)  2) una línea por producto, en orden
// Sin transacción entre ambos pasos: si una línea falla se intenta anular la factura.
export async function registrarFacturaCompra(d) {
  const factura = await facturas.crear({
    idTercero: d.idTercero,
    nro: d.nro,
    timbrado: d.timbrado,
    fechaEmision: d.fechaEmision,
    fechaVencimiento: d.fechaVencimiento,
  })
  try {
    for (const item of d.items) {
      await detalles.crear(toDetalleFacturaCompraDTO(factura.id, item, d.porcentajeIva))
    }
  } catch (err) {
    let anulada = true
    try {
      await facturas.eliminar(factura.id)
    } catch {
      anulada = false
    }
    err.userMessage = `No se pudo registrar la compra: ${err.userMessage}` +
      (anulada ? '' : ` La factura ${d.nro} quedó incompleta: pedile a un administrador que la anule.`)
    throw err
  }
  return factura
}
