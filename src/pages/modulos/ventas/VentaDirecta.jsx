import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconChevronDown } from '../../../components/Icons'
import ModalNuevoCliente from './ModalNuevoCliente'
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
const IVA = 0.10   // 10%

const stockDe = (idDeposito, idProducto) =>
  INVENTARIOS.find((i) => i.id_deposito === idDeposito && i.id_producto === idProducto)?.cantidad ?? 0
const nombreCliente = (c) => [c.persona.nombre, c.persona.apellido].filter(Boolean).join(' ')
const documentoCliente = (c) => c.persona.ruc ?? c.ci ?? 'S/D'   // personas.ruc es nullable

const gs = (n) => n.toLocaleString('es-PY') + ' Gs.'
const etiquetaCliente = (c) => `${documentoCliente(c)} · ${nombreCliente(c)}`
const etiquetaProducto = (p) => `${p.codigo} · ${p.nombre}`
const hoy = () => new Date().toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function VentaDirecta() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState(CLIENTES)   // TODO: cargar desde el backend
  const [modalCliente, setModalCliente] = useState(false)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [deposito, setDeposito] = useState(DEPOSITOS[0])
  const [cantidad, setCantidad] = useState(1)
  const [items, setItems] = useState([])

  // Se puede escribir el RUC o la CI exactos, o elegir de la lista
  const cliente = clientes.find((c) => {
    const q = busquedaCliente.trim()
    return etiquetaCliente(c) === busquedaCliente || (q !== '' && (c.persona.ruc === q || c.ci === q))
  })
  const producto = PRODUCTOS.find((p) =>
    etiquetaProducto(p) === busqueda || p.codigo.toLowerCase() === busqueda.trim().toLowerCase())

  // Stock real del producto en el depósito elegido (tabla inventarios)
  const stock = producto ? stockDe(deposito.id_deposito, producto.id_producto) : null
  const yaAgregado = items.find((i) => i.id_producto === producto?.id_producto)?.cantidad ?? 0
  const disponible = stock === null ? null : Math.max(0, stock - yaAgregado)
  const sinStock = producto !== undefined && cantidad > disponible

  const subtotal = items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0)
  const iva = Math.round(subtotal * IVA)   // TODO: confirmar si precio_venta ya incluye IVA
  const total = subtotal + iva

  function agregar() {
    if (!producto || sinStock) return
    setItems((prev) => prev.some((i) => i.id_producto === producto.id_producto)
      ? prev.map((i) => i.id_producto === producto.id_producto ? { ...i, cantidad: i.cantidad + cantidad } : i)
      : [...prev, {
          id_producto: producto.id_producto, codigo: producto.codigo, nombre: producto.nombre,
          precio_unitario: producto.precio_venta, cantidad,
        }])
    setBusqueda('')
    setCantidad(1)
  }

  function guardarCliente(datos) {
    // TODO: POST a ms-ventas: crea la persona (nombre, ruc, telefono, correo, direccion) y el cliente.
    // 'ciudad' no existe en la tabla personas: definir dónde se guarda o quitar el campo del modal.
    const nuevo = {
      id_cliente: Math.max(0, ...clientes.map((c) => c.id_cliente)) + 1,
      ci: null,
      persona: { nombre: datos.nombre, apellido: null, ruc: datos.ruc },
    }
    setClientes((prev) => [...prev, nuevo])
    setBusquedaCliente(etiquetaCliente(nuevo))   // queda seleccionado en la venta
    setModalCliente(false)
  }

  function confirmar() {
    // Forma pensada para facturas_ventas + detalles_facturas_ventas.
    // nro_factura, timbrado, codigo_factura, fecha_emision e id_estado los define el backend.
    // facturas_ventas no tiene id_deposito: ms-ventas lo usa solo para descontar de inventarios.
    const venta = {
      id_cliente: cliente.id_cliente,
      id_deposito: deposito.id_deposito,
      es_credito: false,
      iva,
      importe_total: total,
      detalles: items.map(({ id_producto, cantidad, precio_unitario }) => ({ id_producto, cantidad, precio_unitario })),
    }
    // TODO: POST a ms-ventas con `venta`
    console.debug('venta directa', venta)
    navigate('/ventas')
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Nueva Venta Directa</h1>

      <div className="venta-grid">
        {/* Columna izquierda */}
        <div className="form-paneles">
          {/* 1. Cliente */}
          <div className="panel-form">
            <div className="panel-titulo">Seleccionar Cliente</div>
            <div className="panel-cuerpo fila-campos abajo">
              <div className="campo crece">
                <label htmlFor="cliente">Cliente *</label>
                <div className="campo-caja"><IconSearch />
                  <input id="cliente" list="lista-clientes" placeholder="Buscar cliente por nombre o RUC..."
                         value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)} />
                </div>
                <datalist id="lista-clientes">
                  {clientes.map((c) => <option key={c.id_cliente} value={etiquetaCliente(c)} />)}
                </datalist>
              </div>
              <button type="button" className="btn-agregar" onClick={() => setModalCliente(true)}>+ Nuevo Cliente</button>
            </div>
          </div>

          {/* 2. Agregar producto */}
          <div className="panel-form">
            <div className="panel-titulo">Agregar Producto</div>
            <div className="panel-cuerpo fila-campos abajo">
              <div className="campo crece">
                <label htmlFor="producto">Buscar producto</label>
                <div className="campo-caja"><IconSearch />
                  <input id="producto" list="lista-productos" placeholder="Buscar por nombre o código..."
                         value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                <datalist id="lista-productos">
                  {PRODUCTOS.map((p) => <option key={p.id_producto} value={etiquetaProducto(p)} />)}
                </datalist>
              </div>

              <div className="campo" style={{ width: 170 }}>
                <label htmlFor="deposito">Depósito</label>
                <div className="campo-caja select-caja">
                  {/* Con productos cargados el depósito queda fijo: una venta descuenta de un solo depósito */}
                  <select id="deposito" value={deposito.id_deposito} disabled={items.length > 0}
                          onChange={(e) => setDeposito(DEPOSITOS.find((d) => d.id_deposito === Number(e.target.value)))}>
                    {DEPOSITOS.map((d) => <option key={d.id_deposito} value={d.id_deposito}>{d.nombre}</option>)}
                  </select>
                  <IconChevronDown />
                </div>
              </div>

              <div className="campo" style={{ width: 130 }}>
                <label htmlFor="cantidad">Cantidad</label>
                <div className="stepper">
                  <button type="button" aria-label="Menos" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
                  <input id="cantidad" type="number" min="1" value={cantidad}
                         onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value, 10) || 1))} />
                  <button type="button" aria-label="Más" className="mas" onClick={() => setCantidad((c) => c + 1)}>+</button>
                </div>
              </div>

              <button type="button" className="btn-agregar" disabled={!producto || sinStock} onClick={agregar}>
                + Agregar
              </button>
            </div>
            {sinStock && (
              <p className="campo-error">Stock insuficiente en {deposito.nombre} (disponible: {disponible})</p>
            )}
          </div>

          {/* 3. Productos de la venta */}
          <div className="panel-form crece">
            <div className="panel-titulo">Productos en la Venta</div>
            <div className="items-cabecera">
              <span>Código</span><span>Producto</span><span>Cant.</span><span>Precio Unit.</span><span>Subtotal</span><span />
            </div>
            <div className="panel-cuerpo items-cuerpo">
              {items.length === 0 && <p className="items-vacio">No hay productos seleccionados...</p>}
              {items.map((i) => (
                <div className="items-fila" key={i.id_producto}>
                  <span className="c-nro">{i.codigo}</span>
                  <span>{i.nombre}</span>
                  <span>{i.cantidad}</span>
                  <span>{gs(i.precio_unitario)}</span>
                  <span className="c-total">{gs(i.precio_unitario * i.cantidad)}</span>
                  <button type="button" className="btn-quitar" aria-label={`Quitar ${i.nombre}`}
                          onClick={() => setItems((prev) => prev.filter((x) => x.id_producto !== i.id_producto))}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <aside className="venta-lateral">
          <div className="panel-form">
            <div className="panel-titulo">Resumen</div>
            <div className="panel-cuerpo resumen">
              <div className="resumen-fila"><span>Fecha:</span><strong>{hoy()}</strong></div>
              <div className="resumen-fila"><span>Subtotal:</span><strong>{gs(subtotal)}</strong></div>
              <div className="resumen-fila"><span>IVA (10%):</span><strong>{gs(iva)}</strong></div>
              <div className="resumen-fila total"><span>Total:</span><strong>{gs(total)}</strong></div>
            </div>
            <div className="resumen-pie">
              <button type="button" className="btn-agregar btn-confirmar"
                      disabled={!cliente || items.length === 0} onClick={confirmar}>
                Confirmar Venta
              </button>
            </div>
          </div>

          <div className="panel-form">
            <div className="panel-titulo">Depósito Seleccionado</div>
            <div className="panel-cuerpo deposito-info">
              <span>{deposito.nombre}</span>
              <small>Stock disponible para descuento</small>
              {producto && <small>{producto.codigo}: {disponible} unidades</small>}
            </div>
          </div>
        </aside>
      </div>

      {modalCliente && (
        <ModalNuevoCliente
          codigo={'CLT-' + String(Math.max(0, ...clientes.map((c) => c.id_cliente)) + 1).padStart(4, '0')}
          onCerrar={() => setModalCliente(false)}
          onGuardar={guardarCliente} />
      )}
    </section>
  )
}