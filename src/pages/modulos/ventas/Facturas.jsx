import { useMemo } from 'react'
import FacturaLista from '../../../components/factura/FacturaLista'
import { FACTURA_VENTA } from '../../../components/factura/facturaConfig'

// TODO: reemplazar por los datos del backend (ms-ventas).
// Forma de facturas_ventas + cliente (clientes -> personas) + estado (estados.nombre).
const FACTURAS = [
  { id_factura: 12, nro_factura: 'FAC-000012', cliente: 'Ferretería El Tornillo', fecha_emision: '2026-08-20', fecha_vencimiento: '2026-09-20', importe_total: 1250000, estado: 'Pagada' },
  { id_factura: 11, nro_factura: 'FAC-000011', cliente: 'Construcciones Aranda',  fecha_emision: '2026-08-19', fecha_vencimiento: '2026-09-19', importe_total: 3480000, estado: 'Pendiente' },
  { id_factura: 10, nro_factura: 'FAC-000010', cliente: 'Distribuidora Pérez',    fecha_emision: '2026-08-19', fecha_vencimiento: '2026-09-19', importe_total: 890000,  estado: 'Pendiente' },
  { id_factura: 9,  nro_factura: 'FAC-000009', cliente: 'Constructora López',     fecha_emision: '2026-08-18', fecha_vencimiento: '2026-08-17', importe_total: 5200000, estado: 'Vencida' },
  { id_factura: 8,  nro_factura: 'FAC-000008', cliente: 'Obras Civiles SA',       fecha_emision: '2026-08-17', fecha_vencimiento: '2026-09-16', importe_total: 2100000, estado: 'Pagada' },
  { id_factura: 7,  nro_factura: 'FAC-000007', cliente: 'Consumidor Final',       fecha_emision: '2026-08-16', fecha_vencimiento: '2026-09-16', importe_total: 320000,  estado: 'Pagada' },
  { id_factura: 6,  nro_factura: 'FAC-000006', cliente: 'Constructora López',     fecha_emision: '2026-08-15', fecha_vencimiento: '2026-09-14', importe_total: 780000,  estado: 'Pagada' },
  { id_factura: 5,  nro_factura: 'FAC-000005', cliente: 'Ferretería El Tornillo', fecha_emision: '2026-08-14', fecha_vencimiento: '2026-09-13', importe_total: 640000,  estado: 'Pagada' },
  { id_factura: 4,  nro_factura: 'FAC-000004', cliente: 'Distribuidora Pérez',    fecha_emision: '2026-08-12', fecha_vencimiento: '2026-09-11', importe_total: 1150000, estado: 'Pagada' },
  { id_factura: 3,  nro_factura: 'FAC-000003', cliente: 'Construcciones Aranda',  fecha_emision: '2026-08-10', fecha_vencimiento: '2026-09-09', importe_total: 2760000, estado: 'Pagada' },
  { id_factura: 2,  nro_factura: 'FAC-000002', cliente: 'Consumidor Final',       fecha_emision: '2026-08-08', fecha_vencimiento: '2026-09-08', importe_total: 150000,  estado: 'Pagada' },
  { id_factura: 1,  nro_factura: 'FAC-000001', cliente: 'Obras Civiles SA',       fecha_emision: '2026-08-05', fecha_vencimiento: '2026-09-04', importe_total: 4300000, estado: 'Pagada' },
]

// Facturas de venta: la lista es el componente compartido con Compras; acá solo se le da la config y los datos.
export default function Facturas() {
  // Misma forma que usa FacturaLista: { id, nro, tercero, fechaEmision, fechaVencimiento, total, estado }
  const facturas = useMemo(() => FACTURAS.map((f) => ({   // TODO: cuando ms-ventas esté listo, esto sale de api/ventas.js
    id: f.id_factura, nro: f.nro_factura, tercero: f.cliente, fechaEmision: f.fecha_emision,
    fechaVencimiento: f.fecha_vencimiento, total: f.importe_total, estado: f.estado,
  })), [])
  return <FacturaLista config={FACTURA_VENTA} facturas={facturas} />
}
