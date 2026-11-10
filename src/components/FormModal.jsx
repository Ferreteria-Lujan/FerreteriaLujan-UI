import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* Modal de formulario configurable. Estilos: sección "FormModal" de styles/theme.css.
 * Configuraciones listas (producto, proveedor, cliente): ./formModalConfigs.js
 *
 * Props
 *   open            boolean                 Muestra/oculta el modal
 *   title           string                  Título del encabezado
 *   fields          Field[]                 Campos del formulario
 *   initialValues   object                  { [name]: value } (para editar, pasar el registro)
 *   onSubmit        (values) => void|Promise  Se llama al guardar si todo es válido.
 *                                           Si lanza un error, se muestra su mensaje en el formulario.
 *   onClose         () => void              ✕, Cancelar, Esc y clic en el fondo
 *   submitLabel     string                  default "Guardar"
 *   cancelLabel     string | null           null = sin botón secundario
 *   closeOnOverlay  boolean                 default true
 *   width           number | string         default 480
 *
 * Field
 *   name (obligatorio), label, type: text | number | email | tel | textarea | select,
 *   placeholder, required, options: (string | {value,label})[] (select), rows (textarea),
 *   half (media fila), disabled, min / max / step (number),
 *   validate: (value, allValues) => string | undefined
 */

const normalizarOpciones = (opciones = []) =>
  opciones.map((o) => (typeof o === 'object' ? o : { value: o, label: o }))

const valoresIniciales = (fields, initialValues = {}) =>
  Object.fromEntries(fields.map((f) => [f.name, initialValues[f.name] ?? '']))

function validarCampo(field, values) {
  const value = values[field.name]
  const vacio = value === '' || value == null
  if (field.required && vacio) return 'Este campo es obligatorio'
  if (vacio) return undefined
  if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) return 'Ingresá un correo válido'
  if (field.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return 'Ingresá un número válido'
    if (field.min != null && n < field.min) return `El mínimo es ${field.min}`
    if (field.max != null && n > field.max) return `El máximo es ${field.max}`
  }
  return field.validate?.(value, values)
}

export default function FormModal({ open = true, ...props }) {
  // El formulario solo existe mientras está abierto: cada apertura arranca con sus valores iniciales
  return open ? createPortal(<Formulario {...props} />, document.body) : null
}

function Formulario({
  title, fields = [], initialValues, onSubmit, onClose,
  submitLabel = 'Guardar', cancelLabel = null, closeOnOverlay = true, width = 480,
}) {
  const uid = useId()
  const [values, setValues] = useState(() => valoresIniciales(fields, initialValues))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const primero = useRef(null)

  useEffect(() => { primero.current?.focus() }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [saving, onClose])

  const cambiar = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  async function enviar(e) {
    e.preventDefault()
    const nuevos = {}
    fields.forEach((f) => {
      const msg = validarCampo(f, values)
      if (msg) nuevos[f.name] = msg
    })
    setErrors(nuevos)
    if (Object.keys(nuevos).length) return

    try {
      setSaving(true)
      setFormError('')
      await onSubmit?.(values)
    } catch (err) {
      setFormError(err?.userMessage || err?.message || 'No se pudo guardar. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  function control(f, id, i) {
    const comunes = {
      id, name: f.name, value: values[f.name],
      disabled: f.disabled || saving, required: f.required,
      'aria-invalid': !!errors[f.name],
      'aria-describedby': errors[f.name] ? `${id}-err` : undefined,
      ref: i === 0 ? primero : undefined,
      onChange: (e) => cambiar(f.name, e.target.value),
    }
    if (f.type === 'textarea')
      return <textarea {...comunes} rows={f.rows || 3} placeholder={f.placeholder} className="fm-control" />
    if (f.type === 'select')
      return (
        <select {...comunes} className="fm-control fm-select">
          <option value="" disabled hidden>{f.placeholder || 'Seleccionar'}</option>
          {normalizarOpciones(f.options).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    return (
      <input {...comunes} type={f.type || 'text'} placeholder={f.placeholder}
             min={f.min} max={f.max} step={f.step}
             inputMode={f.type === 'number' ? 'decimal' : undefined} className="fm-control" />
    )
  }

  return (
    <div className="fm-overlay"
         onMouseDown={(e) => { if (closeOnOverlay && !saving && e.target === e.currentTarget) onClose?.() }}>
      <form className="fm-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true"
            aria-labelledby={`${uid}-title`} onSubmit={enviar} noValidate>
        <div className="fm-header">
          <h2 id={`${uid}-title`} className="fm-title">{title}</h2>
          <button type="button" className="fm-close" aria-label="Cerrar" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="fm-body">
          <div className="fm-grid">
            {fields.map((f, i) => {
              const id = `${uid}-${f.name}`
              const err = errors[f.name]
              return (
                <div key={f.name}
                     className={['fm-field', f.half && 'fm-field--half', err && 'fm-field--error'].filter(Boolean).join(' ')}>
                  <label htmlFor={id} className="fm-label">
                    {f.label}
                    {f.required && <span className="fm-req" aria-hidden="true">*</span>}
                  </label>
                  {control(f, id, i)}
                  {err && <span id={`${id}-err`} className="fm-error" role="alert">{err}</span>}
                </div>
              )
            })}
          </div>

          {formError && <div className="fm-form-error" role="alert">{formError}</div>}

          <div className="fm-actions">
            {cancelLabel && (
              <button type="button" className="fm-btn fm-btn--secondary" onClick={onClose} disabled={saving}>
                {cancelLabel}
              </button>
            )}
            <button type="submit" className="fm-btn fm-btn--primary" disabled={saving}>
              {saving ? 'Guardando…' : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
