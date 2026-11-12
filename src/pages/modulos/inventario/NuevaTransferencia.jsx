import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconChevronDown } from '../../../components/Icons'
import FormModal from '../../../components/FormModal'
import { depositoModalConfig, campoUnico } from '../../../components/formModalConfigs'
import { gs } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { getUsuario } from '../../../gateway/session'
import {
  productos as productosApi, depositos as depositosApi,
  transferencias as transferenciasApi, detallesTransferencia as detallesApi,
} from '../../../services/inventarioService'

// ms-inventario: DepositoDTO solo tiene nombre
const configDeposito = { ...depositoModalConfig, fields: depositoModalConfig.fields.filter((f) => f.name === 'nombre') }

// LocalDateTime en hora local (toISOString usa UTC)
const ahoraLocal = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

async function cargar() {
  const [prods, deps] = await Promise.all([productosApi.listarTodo({ sort: 'codigo,asc' }), depositosApi.listarTodo()])
  return { productos: prods.map((p) => ({ ...p, precio: p.precioVenta })), depositos: deps }
}

const etiqueta = (p) => `${p.codigo} · ${p.nombre}`

export default function NuevaTransferencia() {
  const navigate = useNavigate()
  const [origen, setOrigen] = useState('')
  const [destino, setDestino] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const { datos, cargando, error, recargar } = useCargar(cargar, { productos: [], depositos: [] })
  const { productos: PRODUCTOS, depositos } = datos
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [modalDeposito, setModalDeposito] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [items, setItems] = useState([])

  const producto = PRODUCTOS.find((p) =>
    etiqueta(p) === busqueda || p.codigo.toLowerCase() === busqueda.trim().toLowerCase())
  const mismoDeposito = origen !== '' && origen === destino
  const depOrigen = depositos.find((d) => d.nombre === origen)
  const depDestino = depositos.find((d) => d.nombre === destino)
  const origenOk = !!depOrigen
  const depositosOk = origenOk && !!depDestino && !mismoDeposito
  // El producto sale del depósito de origen: se completa solo y no se edita acá
  const deposito = origenOk ? origen : ''
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0)

  function agregar() {
    if (!producto) return
    setItems((prev) => prev.some((i) => i.id === producto.id)
      ? prev.map((i) => i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i)
      : [...prev, { id: producto.id, codigo: producto.codigo, nombre: producto.nombre, precio: producto.precio, cantidad }])
    setBusqueda('')
    setCantidad(1)
  }

  async function crearDeposito(form) {
    await depositosApi.crear({ nombre: form.nombre.trim() })
    setModalDeposito(false)
    recargar()
  }

  // Cabecera + una linea por producto (hasta que exista el DTO compuesto, Tarea 5).
  // Si falla una linea se intenta deshacer la cabecera (DELETE solo funciona con rol ADMIN).
  async function confirmar() {
    setErrorEnvio('')
    setEnviando(true)
    let cabecera = null
    const lineas = []
    try {
      cabecera = await transferenciasApi.crear({
        fechaCreacion: ahoraLocal(), creador: getUsuario(),
        idDepositoOrigen: depOrigen.id, idDepositoDestino: depDestino.id,
      })
      for (const i of items) {
        lineas.push(await detallesApi.crear({ idTransferencia: cabecera.id, idProducto: i.id, cantidad: i.cantidad }))
      }
      navigate('/inventario/transferencias')
    } catch (err) {
      let msg = err.userMessage || err.message || 'No se pudo crear la transferencia'
      if (cabecera) {
        try {
          for (const l of lineas) await detallesApi.eliminar(l.id)   // sin cascada: primero las lineas ya creadas
          await transferenciasApi.eliminar(cabecera.id)
        }
        catch { msg += ' La transferencia quedó incompleta: pedile a un administrador que la elimine.' }
      }
      setErrorEnvio(msg)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Nueva Transferencia</h1>
      {cargando && <p className="campo-error">Cargando depósitos y productos…</p>}
      {error && <p className="campo-error" role="alert">{error} <button type="button" className="btn-ver" onClick={recargar}>Reintentar</button></p>}

      <div className="form-paneles">
        {/* 1. Depósitos */}
        <div className="panel-form">
          <div className="panel-titulo">Seleccionar Depósitos</div>
          <div className="panel-cuerpo fila-campos abajo">
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
            <button type="button" className="btn-agregar" onClick={() => setModalDeposito(true)}>+ Crear depósito</button>
            <datalist id="lista-depositos">{depositos.map((d) => <option key={d.id} value={d.nombre} />)}</datalist>
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
              <datalist id="lista-productos">{PRODUCTOS.map((p) => <option key={p.id} value={etiqueta(p)} />)}</datalist>
            </div>

            <div className="campo" style={{ width: 170 }}>
              <label htmlFor="deposito">Depósito</label>
              <div className="campo-caja select-caja">
                <select id="deposito" value={deposito} disabled>
                  {deposito === '' ? <option value="">Elegí el depósito origen</option> : <option value={deposito}>{deposito}</option>}
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

            <button type="button" className="btn-agregar" disabled={!producto || !origenOk} onClick={agregar}>+ Agregar</button>
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
              <div className="items-fila" key={i.id}>
                <span className="c-nro">{i.codigo}</span>
                <span>{i.nombre}</span>
                <span>{i.cantidad}</span>
                <span>{gs(i.precio)}</span>
                <span className="c-total">{gs(i.precio * i.cantidad)}</span>
                <button type="button" className="btn-quitar" aria-label={`Quitar ${i.nombre}`}
                        onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}>×</button>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <div className="items-pie">
              <strong>Total: {gs(total)}</strong>
              <button type="button" className="btn-agregar" disabled={!depositosOk || enviando} onClick={confirmar}>
                {enviando ? 'Guardando…' : 'Confirmar transferencia'}
              </button>
            </div>
          )}
          {errorEnvio && <p className="campo-error" role="alert">{errorEnvio}</p>}
        </div>
      </div>

      <FormModal
        open={modalDeposito}
        {...campoUnico(configDeposito, 'nombre', depositos, (d) => d.nombre, 'Ya existe un depósito con ese nombre')}
        onClose={() => setModalDeposito(false)}
        onSubmit={crearDeposito} />
    </section>
  )
}
