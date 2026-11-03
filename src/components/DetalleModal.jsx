import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

/* Modal de solo lectura (detalle de un registro). Comparte el marco con FormModal (.fm-*);
 * estilos propios en la sección "DetalleModal" de styles/theme.css.
 *
 * Props
 *   title      string
 *   campos     { label, value }[]                       Datos de cabecera, uno debajo de otro
 *   columnas   { key, label, align?: 'right', mono?: boolean }[]   Columnas de la tabla
 *   filas      object[]                                 Filas de la tabla (valores ya formateados)
 *   total      string                                   Total mostrado al pie de la tabla
 *   onClose    () => void                               ✕, Cerrar, Esc y clic en el fondo
 *   width      number | string                          default 780
 */
export default function DetalleModal({ title, campos = [], columnas = [], filas = [], total, onClose, width = 780 }) {
  const uid = useId()
  const cerrar = useRef(null)
  const grid = { gridTemplateColumns: columnas.map((c) => c.ancho ?? '1fr').join(' ') }

  useEffect(() => {
    cerrar.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="fm-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`}>
        <div className="fm-header">
          <h2 id={`${uid}-title`} className="fm-title">{title}</h2>
          <button type="button" className="fm-close" aria-label="Cerrar" onClick={onClose}>✕</button>
        </div>

        <div className="fm-body">
          <dl className="dm-campos">
            {campos.map((c) => (
              <div className="dm-campo" key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>

          {columnas.length > 0 && (
            <div className="dm-tabla">
              <div className="dm-tabla-in">
                <div className="dm-fila dm-cabecera" style={grid}>
                  {columnas.map((c) => <span key={c.key} className={c.align === 'right' ? 'dm-der' : undefined}>{c.label}</span>)}
                </div>
                {/* solo las filas se desplazan: la cabecera y el total quedan fijos */}
                <div className="dm-filas">
                  {filas.map((f, i) => (
                    <div className="dm-fila" style={grid} key={i}>
                      {columnas.map((c) => (
                        <span key={c.key} className={[c.align === 'right' && 'dm-der', c.mono && 'dm-mono'].filter(Boolean).join(' ')}>
                          {f[c.key]}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                {total != null && (
                  <div className="dm-total"><span>TOTAL</span><span className="dm-mono">{total}</span></div>
                )}
              </div>
            </div>
          )}

          <button ref={cerrar} type="button" className="fm-btn fm-btn--secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
