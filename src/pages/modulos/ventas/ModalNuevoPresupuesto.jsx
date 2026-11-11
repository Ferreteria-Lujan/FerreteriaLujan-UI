import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// Estilos propios del modal (prefijo mnp-), igual que ModalNuevoCliente
const ESTILOS = `
.mnp-fondo {
  --mnp-bg: #313131; --mnp-surface: #414141; --mnp-accent: #37aa9c;
  --mnp-borde: #676767; --mnp-texto: #eeeeee; --mnp-muted: #aaaaaa; --mnp-danger: #fb2c36;
  position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;
  padding: 16px; background: rgba(0,0,0,.6); font-family: var(--font-ventas, inherit); box-sizing: border-box;
}
.mnp-fondo *, .mnp-fondo *::before, .mnp-fondo *::after { box-sizing: border-box; }
.mnp-modal {
  width: min(100%, 780px); max-height: calc(100vh - 32px); overflow-y: auto; margin: 0;
  background: var(--mnp-bg); color: var(--mnp-texto);
  border: 1px solid var(--mnp-accent); border-radius: 12px; box-shadow: 0 25px 25px rgba(0,0,0,.25);
}
.mnp-cabecera {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--mnp-accent);
}
.mnp-cabecera h2 { margin: 0; font-size: 1.4rem; font-weight: 400; color: var(--mnp-texto); }
.mnp-cerrar { background: none; border: 0; padding: 0; color: var(--mnp-muted); font-size: 1.6rem; line-height: 1; cursor: pointer; }
.mnp-cerrar:hover { color: var(--mnp-texto); }
.mnp-cuerpo { display: flex; flex-direction: column; gap: 16px; padding: 20px; }
.mnp-campo { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.mnp-campo label, .mnp-titulo { color: var(--mnp-texto); font-size: .8rem; }
.mnp-campo select, .mnp-item input {
  width: 100%; height: 36px; padding: 0 12px; margin: 0;
  background: var(--mnp-surface); color: var(--mnp-texto);
  border: 1px solid var(--mnp-surface); border-radius: 4px; outline: 0;
  font: inherit; font-size: .8rem;
}
.mnp-campo select option { background: var(--mnp-surface); }
.mnp-item input::placeholder { color: var(--mnp-borde); opacity: 1; }
.mnp-campo select:focus, .mnp-item input:focus { border-color: var(--mnp-accent); }
.mnp-invalida { border-color: var(--mnp-danger) !important; }
.mnp-error { color: var(--mnp-danger); font-size: .7rem; }
.mnp-seccion { display: flex; flex-direction: column; gap: 8px; }
.mnp-secc-cabecera { display: flex; justify-content: space-between; align-items: center; }
.mnp-agregar { background: none; border: 0; padding: 0; color: var(--mnp-accent); font: inherit; font-size: .75rem; cursor: pointer; }
.mnp-agregar:hover { filter: brightness(1.2); }
.mnp-items { display: flex; flex-direction: column; gap: 6px; }
.mnp-items-cab, .mnp-item {
  display: grid; grid-template-columns: 1fr 80px 140px 32px; gap: 8px; align-items: center;
}
.mnp-items-cab span { font-size: .7rem; text-transform: uppercase; letter-spacing: .05em; color: var(--mnp-texto); }
.mnp-quitar { height: 32px; border: 0; background: none; color: var(--mnp-danger); font-size: 1.2rem; cursor: pointer; }
.mnp-total { text-align: right; font-size: .9rem; color: var(--mnp-texto); }
.mnp-total b { color: var(--mnp-accent); font-family: Consolas, monospace; font-weight: 400; }
.mnp-acciones { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 4px; }
.mnp-acciones button { height: 44px; border-radius: 4px; font: inherit; font-size: 1rem; cursor: pointer; }
.mnp-acciones button:hover { filter: brightness(1.15); }
.mnp-acciones button:disabled { opacity: .6; cursor: progress; }
.mnp-cancelar { background: #464646; color: var(--mnp-texto); border: 1px solid #5a5a5a; }
.mnp-guardar { background: var(--mnp-accent); color: #fff; border: 1px solid var(--mnp-accent); font-weight: 700; }
@media (max-width: 640px) {
  .mnp-items-cab { display: none; }
  .mnp-item { grid-template-columns: 1fr 1fr 32px; }
  .mnp-item .mnp-prod { grid-column: 1 / -1; }
}
`

const gs = (n) => n.toLocaleString('es-PY') + ' Gs.'
const etiquetaProducto = (p) => `${p.codigo} · ${p.nombre}`

let secuencia = 0
const nuevoItem = () => ({ key: ++secuencia, texto: '', id_producto: null, cantidad: '1', precio: '' })

// Un item esta completo si tiene producto valido, cantidad > 0 y precio >= 0
const itemIncompleto = (i) => i.id_producto === null || !(Number(i.cantidad) > 0) || i.precio === '' || Number(i.precio) < 0

// Modal "Nuevo Presupuesto". Al guardar llama onGuardar({ id_cliente, detalles: [{ id_producto, cantidad, precio_unitario }] }).
// onGuardar puede ser async: si lanza, el modal queda abierto y muestra el mensaje del servidor.
// clientes: [{ id_cliente, etiqueta }]   productos: [{ id_producto, codigo, nombre, precio_venta }]
export default function ModalNuevoPresupuesto({ clientes, productos, onCerrar, onGuardar }) {
  const [idCliente, setIdCliente] = useState('')
  const [items, setItems] = useState(() => [nuevoItem()])
  const [intentado, setIntentado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !guardando) onCerrar() }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'   // la pantalla de atras no scrollea mientras el modal esta abierto
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onCerrar, guardando])

  const total = items.reduce((s, i) => s + (Number(i.cantidad) || 0) * (Number(i.precio) || 0), 0)

  const errores = {
    cliente: !idCliente && 'Selecciona un cliente',
    items: items.length === 0 ? 'Agrega al menos un producto'
         : items.some(itemIncompleto) ? 'Completa producto, cantidad y precio de cada item'
         : false,
  }
  const hayErrores = Object.values(errores).some(Boolean)

  function cambiarItem(key, campos) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...campos } : i)))
  }

  // Si el texto coincide con un producto (nombre+codigo o solo codigo), completa id y precio de venta
  function cambiarProducto(key, texto) {
    const q = texto.trim().toLowerCase()
    const producto = productos.find((p) => etiquetaProducto(p) === texto || p.codigo.toLowerCase() === q)
    cambiarItem(key, producto
      ? { texto, id_producto: producto.id_producto, precio: String(producto.precio_venta) }
      : { texto, id_producto: null })
  }

  async function enviar(e) {
    e.preventDefault()
    setIntentado(true)
    if (hayErrores || guardando) return
    setErrorServidor(null)
    setGuardando(true)
    try {
      await onGuardar({
        id_cliente: Number(idCliente),
        detalles: items.map(({ id_producto, cantidad, precio }) => ({
          id_producto,
          cantidad: Number(cantidad),
          precio_unitario: Number(precio),
        })),
      })
    } catch (err) {
      setErrorServidor(err.userMessage || err.message || 'No se pudo guardar el presupuesto')
      setGuardando(false)
    }
  }

  // Portal: se dibuja sobre el <body>, por encima de toda la pantalla actual
  return createPortal(
    <div className="mnp-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) onCerrar() }}>
      <style>{ESTILOS}</style>
      <form className="mnp-modal" role="dialog" aria-modal="true" aria-labelledby="modal-presupuesto-titulo"
            noValidate onSubmit={enviar}>
        <div className="mnp-cabecera">
          <h2 id="modal-presupuesto-titulo">Nuevo Presupuesto</h2>
          <button type="button" className="mnp-cerrar" aria-label="Cerrar" onClick={onCerrar} disabled={guardando}>×</button>
        </div>

        <div className="mnp-cuerpo">
          <div className="mnp-campo">
            <label htmlFor="pre-cliente">Cliente</label>
            <select id="pre-cliente" value={idCliente} disabled={guardando}
                    className={intentado && errores.cliente ? 'mnp-invalida' : undefined}
                    onChange={(e) => setIdCliente(e.target.value)}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => <option key={c.id_cliente} value={c.id_cliente}>{c.etiqueta}</option>)}
            </select>
            {intentado && errores.cliente && <span className="mnp-error">{errores.cliente}</span>}
          </div>

          <div className="mnp-seccion">
            <div className="mnp-secc-cabecera">
              <span className="mnp-titulo">Productos del Presupuesto</span>
              <button type="button" className="mnp-agregar" disabled={guardando}
                      onClick={() => setItems((p) => [...p, nuevoItem()])}>
                + Agregar item
              </button>
            </div>

            <div className="mnp-items">
              <div className="mnp-items-cab" aria-hidden="true">
                <span>Producto</span><span>Cant.</span><span>Precio Gs.</span><span />
              </div>
              {items.map((i) => (
                <div className="mnp-item" key={i.key}>
                  <input className={'mnp-prod' + (intentado && i.id_producto === null ? ' mnp-invalida' : '')}
                         list="lista-productos-presupuesto" aria-label="Producto" disabled={guardando}
                         placeholder="Buscar por nombre o codigo..."
                         value={i.texto} onChange={(e) => cambiarProducto(i.key, e.target.value)} />
                  <input aria-label="Cantidad" type="number" min="1" inputMode="numeric" disabled={guardando}
                         className={intentado && !(Number(i.cantidad) > 0) ? 'mnp-invalida' : undefined}
                         value={i.cantidad} onChange={(e) => cambiarItem(i.key, { cantidad: e.target.value })} />
                  <input aria-label="Precio" type="number" min="0" inputMode="numeric" placeholder="0" disabled={guardando}
                         className={intentado && (i.precio === '' || Number(i.precio) < 0) ? 'mnp-invalida' : undefined}
                         value={i.precio} onChange={(e) => cambiarItem(i.key, { precio: e.target.value })} />
                  <button type="button" className="mnp-quitar" aria-label="Quitar item" disabled={guardando}
                          onClick={() => setItems((p) => p.filter((x) => x.key !== i.key))}>×</button>
                </div>
              ))}
              <datalist id="lista-productos-presupuesto">
                {productos.map((p) => <option key={p.id_producto} value={etiquetaProducto(p)} />)}
              </datalist>
            </div>
            {intentado && errores.items && <span className="mnp-error">{errores.items}</span>}
          </div>

          <div className="mnp-total">Total: <b>{gs(total)}</b></div>

          {errorServidor && <span className="mnp-error" role="alert">{errorServidor}</span>}

          <div className="mnp-acciones">
            <button type="button" className="mnp-cancelar" onClick={onCerrar} disabled={guardando}>Cancelar</button>
            <button type="submit" className="mnp-guardar" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Presupuesto'}
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  )
}
