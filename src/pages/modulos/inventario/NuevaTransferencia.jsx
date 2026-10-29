import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconChevronDown } from '../../../components/Icons'
import { DEPOSITOS, PRODUCTOS, gs } from './datos'

const etiqueta = (p) => `${p.codigo} · ${p.nombre}`

export default function NuevaTransferencia() {
  const navigate = useNavigate()
  const [origen, setOrigen] = useState('')
  const [destino, setDestino] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [deposito, setDeposito] = useState(DEPOSITOS[0])
  const [cantidad, setCantidad] = useState(1)
  const [items, setItems] = useState([])

  const producto = PRODUCTOS.find((p) =>
    etiqueta(p) === busqueda || p.codigo.toLowerCase() === busqueda.trim().toLowerCase())
  const mismoDeposito = origen !== '' && origen === destino
  const depositosOk = DEPOSITOS.includes(origen) && DEPOSITOS.includes(destino) && !mismoDeposito
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0)

  function agregar() {
    if (!producto) return
    setItems((prev) => prev.some((i) => i.codigo === producto.codigo)
      ? prev.map((i) => i.codigo === producto.codigo ? { ...i, cantidad: i.cantidad + cantidad } : i)
      : [...prev, { codigo: producto.codigo, nombre: producto.nombre, precio: producto.precio, cantidad }])
    setBusqueda('')
    setCantidad(1)
  }

  function confirmar() {
    // TODO: POST al backend (origen, destino, items)
    navigate('/inventario/transferencias')
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Nueva Transferencia</h1>

      <div className="form-paneles">
        {/* 1. Depósitos */}
        <div className="panel-form">
          <div className="panel-titulo">Seleccionar Depósitos</div>
          <div className="panel-cuerpo fila-campos">
            <div className="campo grande">
              <label htmlFor="origen">Depósito Origen *</label>
              <div className="campo-caja"><IconSearch />
                <input id="origen" list="lista-depositos" placeholder="Buscar depósito por nombre..."
                       value={origen} onChange={(e) => setOrigen(e.target.value)} />
              </div>
            </div>
            <div className="campo grande">
              <label htmlFor="destino">Depósito Destino *</label>
              <div className="campo-caja"><IconSearch />
                <input id="destino" list="lista-depositos" placeholder="Buscar depósito por nombre..."
                       value={destino} onChange={(e) => setDestino(e.target.value)} />
              </div>
            </div>
            <datalist id="lista-depositos">{DEPOSITOS.map((d) => <option key={d} value={d} />)}</datalist>
          </div>
          {mismoDeposito && <p className="campo-error">El origen y el destino deben ser distintos</p>}
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
              <datalist id="lista-productos">{PRODUCTOS.map((p) => <option key={p.codigo} value={etiqueta(p)} />)}</datalist>
            </div>

            <div className="campo" style={{ width: 170 }}>
              <label htmlFor="deposito">Depósito</label>
              <div className="campo-caja select-caja">
                <select id="deposito" value={deposito} onChange={(e) => setDeposito(e.target.value)}>
                  {DEPOSITOS.map((d) => <option key={d} value={d}>{d}</option>)}
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

            <button type="button" className="btn-agregar" disabled={!producto} onClick={agregar}>+ Agregar</button>
          </div>
        </div>

        {/* 3. Productos de la transferencia */}
        <div className="panel-form crece">
          <div className="panel-titulo">Productos en la Transferencia</div>
          <div className="items-cabecera">
            <span>Código</span><span>Producto</span><span>Cant.</span><span>Precio Unit.</span><span>Subtotal</span><span />
          </div>
          <div className="panel-cuerpo items-cuerpo">
            {items.length === 0 && <p className="items-vacio">No hay productos seleccionados...</p>}
            {items.map((i) => (
              <div className="items-fila" key={i.codigo}>
                <span className="c-nro">{i.codigo}</span>
                <span>{i.nombre}</span>
                <span>{i.cantidad}</span>
                <span>{gs(i.precio)}</span>
                <span className="c-total">{gs(i.precio * i.cantidad)}</span>
                <button type="button" className="btn-quitar" aria-label={`Quitar ${i.nombre}`}
                        onClick={() => setItems((prev) => prev.filter((x) => x.codigo !== i.codigo))}>×</button>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <div className="items-pie">
              <strong>Total: {gs(total)}</strong>
              <button type="button" className="btn-agregar" disabled={!depositosOk} onClick={confirmar}>
                Confirmar transferencia
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
