import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const CAMPOS = [
  { id: 'nombre',    label: 'Nombre / Razón Social', placeholder: 'Nombre del cliente o empresa', completo: true },
  { id: 'ruc',       label: 'RUC / CI',              placeholder: '80000000-0' },
  { id: 'telefono',  label: 'Teléfono',              placeholder: '021-000-0000', type: 'tel' },
  { id: 'correo',    label: 'Email',                 placeholder: 'correo@cliente.com', type: 'email' },
  { id: 'ciudad',    label: 'Ciudad',                placeholder: 'Asunción' },
  { id: 'direccion', label: 'Dirección',             placeholder: 'Dirección completa', completo: true },
]
// Estilos propios del modal: no dependen de theme.css (colores definidos acá, clases con prefijo mnc-)
const ESTILOS = `
.mnc-fondo {
  --mnc-bg: #303030; --mnc-surface: #404040; --mnc-accent: #37aa9c; --mnc-borde: #676767;
  --mnc-texto: #eeeeee; --mnc-muted: #b5b5b5; --mnc-danger: #eb5757;
  position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;
  padding: 16px; background: rgba(0,0,0,.6); font-family: inherit; box-sizing: border-box;
}
.mnc-fondo *, .mnc-fondo *::before, .mnc-fondo *::after { box-sizing: border-box; }
.mnc-modal {
  width: min(100%, 460px); max-height: calc(100vh - 32px); overflow-y: auto; margin: 0;
  background: var(--mnc-bg); color: var(--mnc-texto);
  border: 1px solid var(--mnc-accent); border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,.6);
}
.mnc-cabecera {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 22px; border-bottom: 1px solid var(--mnc-accent);
}
.mnc-cabecera h2 { margin: 0; font-size: 1.4rem; font-weight: 400; color: var(--mnc-texto); }
.mnc-cerrar { background: none; border: 0; padding: 0; color: var(--mnc-muted); font-size: 1.8rem; line-height: 1; cursor: pointer; }
.mnc-cerrar:hover { color: var(--mnc-texto); }
.mnc-cuerpo { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 18px 22px 22px; }
.mnc-completo { grid-column: 1 / -1; }
.mnc-campo { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.mnc-campo label { color: var(--mnc-texto); font-size: .8rem; font-weight: 400; }
.mnc-campo input {
  width: 100%; height: 38px; padding: 0 12px; margin: 0;
  background: var(--mnc-surface); color: var(--mnc-texto);
  border: 1px solid var(--mnc-borde); border-radius: 6px; outline: 0;
  font: inherit; font-size: .8rem;
}
.mnc-campo input::placeholder { color: var(--mnc-borde); opacity: 1; }
.mnc-campo input:focus { border-color: var(--mnc-accent); }
.mnc-campo input:disabled { cursor: default; }
.mnc-campo input.mnc-invalida { border-color: var(--mnc-danger); }
.mnc-error { color: var(--mnc-danger); font-size: .7rem; }
.mnc-acciones { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
.mnc-acciones button { height: 44px; border-radius: 6px; font: inherit; font-size: 1rem; font-weight: 700; cursor: pointer; }
.mnc-acciones button:hover { filter: brightness(1.1); }
.mnc-cancelar { background: var(--mnc-surface); color: var(--mnc-texto); border: 1px solid var(--mnc-borde); }
.mnc-guardar { background: var(--mnc-accent); color: #fff; border: 1px solid var(--mnc-accent); }
`

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Modal "Nuevo Cliente" (también se usa para "Nuevo Proveedor": cambia `titulo`).
// Al guardar llama onGuardar({ nombre, ruc, telefono, correo, ciudad, direccion }); los vacíos van como null.
// onGuardar puede ser async: si lanza, el modal queda abierto y muestra el mensaje del servidor.
export default function ModalNuevoCliente({ titulo = 'Nuevo Cliente', ocultar = [], onCerrar, onGuardar }) {
  const [form, setForm] = useState({ nombre: '', ruc: '', telefono: '', correo: '', ciudad: '', direccion: '' })
  const [intentado, setIntentado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'   // la pantalla de atrás no scrollea mientras el modal está abierto
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onCerrar])

  const errores = {
    nombre: !form.nombre.trim() && 'Ingresá el nombre o la razón social',
    ruc: !form.ruc.trim() && 'Ingresá el RUC o la CI',
    correo: form.correo.trim() !== '' && !EMAIL.test(form.correo.trim()) && 'El email no es válido',
  }
  const hayErrores = Object.values(errores).some(Boolean)

  async function enviar(e) {
    e.preventDefault()
    setIntentado(true)
    if (hayErrores || guardando) return
    const limpio = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || null]))
    setErrorServidor(null)
    setGuardando(true)
    try {
      await onGuardar(limpio)
    } catch (err) {
      setErrorServidor(err.userMessage || err.message || 'No se pudo guardar')
      setGuardando(false)
    }
  }

  // Portal: se dibuja sobre el <body>, por encima de toda la pantalla actual
  return createPortal(
    <div className="mnc-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar() }}>
      <style>{ESTILOS}</style>
      <form className="mnc-modal" role="dialog" aria-modal="true" aria-labelledby="modal-cliente-titulo"
            noValidate onSubmit={enviar}>
        <div className="mnc-cabecera">
          <h2 id="modal-cliente-titulo">{titulo}</h2>
          <button type="button" className="mnc-cerrar" aria-label="Cerrar" onClick={onCerrar}>×</button>
        </div>

        <div className="mnc-cuerpo">

          {CAMPOS.filter((c) => !ocultar.includes(c.id)).map(({ id, label, placeholder, type, completo }) => {
            const error = intentado && errores[id]
            return (
              <div className={'mnc-campo' + (completo ? ' mnc-completo' : '')} key={id}>
                <label htmlFor={'cli-' + id}>{label}</label>
                <input id={'cli-' + id} type={type ?? 'text'} placeholder={placeholder}
                       className={error ? 'mnc-invalida' : undefined}
                       value={form[id]} onChange={(e) => setForm({ ...form, [id]: e.target.value })} />
                {error && <span className="mnc-error">{error}</span>}
              </div>
            )
          })}

          {errorServidor && <span className="mnc-error mnc-completo" role="alert">{errorServidor}</span>}

          <div className="mnc-acciones">
            <button type="button" className="mnc-cancelar" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="mnc-guardar" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  )
}