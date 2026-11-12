import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'

/* Confirmación antes de eliminar un registro. Comparte el marco con FormModal (.fm-*).
 *
 * Props
 *   titulo     string
 *   mensaje    string
 *   onConfirmar  () => Promise | void   Si lanza error, se muestra en el modal y no se cierra
 *   onClose    () => void
 */
export default function ConfirmarEliminar({ titulo = 'Eliminar', mensaje, onConfirmar, onClose }) {
  const uid = useId()
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !enviando) onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, enviando])

  async function confirmar() {
    setError('')
    setEnviando(true)
    try {
      await onConfirmar()
    } catch (err) {
      setError(err.userMessage || err.message || 'No se pudo eliminar')
      setEnviando(false)
    }
  }

  return createPortal(
    <div className="fm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !enviando) onClose?.() }}>
      <div className="fm-modal" style={{ maxWidth: 460 }} role="alertdialog" aria-modal="true" aria-labelledby={`${uid}-title`}>
        <div className="fm-header">
          <h2 id={`${uid}-title`} className="fm-title">{titulo}</h2>
          <button type="button" className="fm-close" aria-label="Cerrar" onClick={onClose} disabled={enviando}>✕</button>
        </div>
        <div className="fm-body">
          <p className="fm-confirmar">{mensaje}</p>
          {error && <div className="fm-form-error" role="alert">{error}</div>}
          <div className="fm-actions">
            <button type="button" className="fm-btn fm-btn--secondary" onClick={onClose} disabled={enviando}>Cancelar</button>
            <button type="button" className="fm-btn fm-btn--danger" onClick={confirmar} disabled={enviando} autoFocus>
              {enviando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
