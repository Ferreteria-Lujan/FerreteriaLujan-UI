import DetalleModal from '../../../components/DetalleModal'
import { fechaCorta, gs } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { obtenerDetalleFacturaVenta } from '../../../services/ventasService'

const COLUMNAS = [
  { key: 'codigo', label: 'Código', mono: true, ancho: '130px' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'cantidad', label: 'Cant.', align: 'right', ancho: '60px' },
  { key: 'precioUnitario', label: 'P. Unit.', align: 'right', mono: true, ancho: '130px' },
  { key: 'subtotal', label: 'Subtotal', align: 'right', mono: true, ancho: '130px' },
]

// Se monta solo al abrir la factura: trae sus líneas desde el backend
export default function VerFacturaVenta({ factura, onCerrar }) {
  const { datos, cargando, error } = useCargar(() => obtenerDetalleFacturaVenta(factura.id))

  const filas = datos.map((l) => ({
    codigo: l.codigo,
    descripcion: l.descripcion,
    cantidad: l.cantidad,
    precioUnitario: gs(l.precioUnitario),
    subtotal: gs(l.subtotal),
  }))
  const total = datos.reduce((s, l) => s + l.subtotal, 0)

  const campos = [
    { label: 'Cliente', value: factura.tercero },
    { label: 'Fecha emisión', value: fechaCorta(factura.fechaEmision) },
    { label: 'Fecha vencimiento', value: fechaCorta(factura.fechaVencimiento) },
    { label: 'Estado', value: factura.estadoNombre },
    { label: 'Condición', value: factura.estado },
  ]

  return (
    <DetalleModal
      title={`Factura — ${factura.nro}`}
      campos={campos}
      columnas={COLUMNAS}
      filas={filas}
      total={!cargando && !error ? gs(total) : undefined}
      mensaje={cargando ? 'Cargando detalle...' : error}
      onClose={onCerrar} />
  )
}
