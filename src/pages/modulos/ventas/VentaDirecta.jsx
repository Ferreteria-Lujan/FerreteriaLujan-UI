import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FacturaForm from '../../../components/factura/FacturaForm'
import { FACTURA_VENTA } from '../../../components/factura/facturaConfig'

// ---------- Datos de prueba (TODO: reemplazar por ms-ventas / ms-inventario) ----------
// Tienen la forma de las tablas reales: depositos, productos, inventarios, clientes + personas.
const DEPOSITOS = [
  { id_deposito: 1, nombre: 'Depósito Central' },
  { id_deposito: 2, nombre: 'Depósito Norte' },
  { id_deposito: 3, nombre: 'Depósito Sur' },
]
const PRODUCTOS = [
  { id_producto: 1, codigo: 'PRD-000001', nombre: 'Martillo carpintero 16 oz',         precio_venta: 45000 },
  { id_producto: 2, codigo: 'PRD-000002', nombre: 'Cemento Portland bolsa 50 kg',      precio_venta: 62000 },
  { id_producto: 3, codigo: 'PRD-000003', nombre: 'Tornillo autoperforante 1" x100',   precio_venta: 18000 },
  { id_producto: 4, codigo: 'PRD-000004', nombre: 'Pintura látex blanco 20 L',         precio_venta: 385000 },
  { id_producto: 5, codigo: 'PRD-000005', nombre: 'Cable unipolar 2,5 mm rollo 100 m', precio_venta: 290000 },
]
const INVENTARIOS = [   // stock de cada producto en cada depósito
  { id_deposito: 1, id_producto: 1, cantidad: 120 },
  { id_deposito: 1, id_producto: 2, cantidad: 8 },
  { id_deposito: 1, id_producto: 3, cantidad: 340 },
  { id_deposito: 1, id_producto: 4, cantidad: 15 },
  { id_deposito: 1, id_producto: 5, cantidad: 4 },
  { id_deposito: 2, id_producto: 1, cantidad: 40 },
  { id_deposito: 2, id_producto: 3, cantidad: 100 },
  { id_deposito: 2, id_producto: 4, cantidad: 6 },
  { id_deposito: 3, id_producto: 2, cantidad: 20 },
  { id_deposito: 3, id_producto: 5, cantidad: 10 },
]
const CLIENTES = [
  { id_cliente: 1, ci: '1234567', persona: { nombre: 'Ferretería El Tornillo', apellido: null, ruc: '80012345-6' } },
  { id_cliente: 2, ci: '2345678', persona: { nombre: 'Construcciones Aranda',  apellido: null, ruc: '80023456-7' } },
  { id_cliente: 3, ci: '3456789', persona: { nombre: 'Distribuidora Pérez',    apellido: null, ruc: '80034567-8' } },
  { id_cliente: 4, ci: '4567890', persona: { nombre: 'Carlos',                 apellido: 'López', ruc: '4567890-1' } },
  { id_cliente: 5, ci: '5678901', persona: { nombre: 'Obras Civiles SA',       apellido: null, ruc: '80056789-0' } },
]

const stockDe = (idDeposito, idProducto) =>
  INVENTARIOS.find((i) => i.id_deposito === idDeposito && i.id_producto === idProducto)?.cantidad ?? 0
const nombreCliente = (c) => [c.persona.nombre, c.persona.apellido].filter(Boolean).join(' ')
const documentoCliente = (c) => c.persona.ruc ?? c.ci ?? 'S/D'   // personas.ruc es nullable
// Forma que usa FacturaForm para clientes (y proveedores): { id, etiqueta, claves }
const aTercero = (c) => ({
  id: c.id_cliente,
  etiqueta: `${documentoCliente(c)} · ${nombreCliente(c)}`,
  claves: [c.persona.ruc, c.ci].filter(Boolean),
})

// Venta directa: el formulario es el componente compartido con Compras; acá solo van la config y los datos de ventas.
export default function VentaDirecta() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState(CLIENTES)   // TODO: cargar desde el backend

  const terceros = useMemo(() => clientes.map(aTercero), [clientes])
  const productos = useMemo(
    () => PRODUCTOS.map((p) => ({ id: p.id_producto, codigo: p.codigo, nombre: p.nombre, precio: p.precio_venta })), [])
  const depositos = useMemo(() => DEPOSITOS.map((d) => ({ id: d.id_deposito, nombre: d.nombre })), [])

  function guardarCliente(datos) {
    // TODO: POST a ms-ventas: crea la persona (nombre, ruc, telefono, correo, direccion) y el cliente.
    // 'ciudad' no existe en la tabla personas: definir dónde se guarda o quitar el campo del modal.
    const nuevo = {
      id_cliente: Math.max(0, ...clientes.map((c) => c.id_cliente)) + 1,
      ci: null,
      persona: { nombre: datos.nombre, apellido: null, ruc: datos.ruc },
    }
    setClientes((prev) => [...prev, nuevo])
    return aTercero(nuevo)   // queda seleccionado en la venta
  }

  function confirmar(d) {
    // Forma pensada para facturas_ventas + detalles_facturas_ventas.
    // nro_factura, timbrado, codigo_factura, fecha_emision e id_estado los define el backend.
    // facturas_ventas no tiene id_deposito: ms-ventas lo usa solo para descontar de inventarios.
    const venta = {
      id_cliente: d.idTercero,
      id_deposito: d.idDeposito,
      es_credito: false,
      iva: d.iva,
      importe_total: d.total,
      detalles: d.items,
    }
    // TODO: POST a ms-ventas con `venta`
    console.debug('venta directa', venta)
    navigate(FACTURA_VENTA.rutaAlGuardar)
  }

  return (
    <FacturaForm
      config={FACTURA_VENTA}
      terceros={terceros}
      productos={productos}
      depositos={depositos}
      stockDe={stockDe}
      onNuevoTercero={guardarCliente}
      onConfirmar={confirmar} />
  )
}
