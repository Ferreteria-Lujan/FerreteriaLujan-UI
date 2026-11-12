import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MAX_SUGERENCIAS = 8

// Caja de búsqueda con lista de sugerencias propia (reemplaza <datalist>, cuyo desplegable
// lo dibuja el navegador y no se puede estilar). La lista se dibuja en <body> con position fixed
// para que no la recorten los paneles con overflow: hidden.
//
//   id, value, onChange(texto), placeholder, disabled
//   opciones   [{ key, label }]      se filtran por el texto escrito (no distingue mayúsculas)
//   icono      elemento que va a la derecha de la caja
export default function BuscadorSugerencias({ id, value, onChange, opciones = [], placeholder, disabled = false, icono }) {
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(0)
  const [pos, setPos] = useState(null)
  const cajaRef = useRef(null)

  const q = value.trim().toLowerCase()
  const lista = (q ? opciones.filter((o) => o.label.toLowerCase().includes(q)) : opciones).slice(0, MAX_SUGERENCIAS)
  // Si lo escrito ya es exactamente una opción, no hace falta mostrar la lista
  const yaElegida = lista.length === 1 && lista[0].label === value
  const visible = abierto && !disabled && lista.length > 0 && !yaElegida

  function medir() {
    const r = cajaRef.current?.getBoundingClientRect()
    if (r) setPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }

  useLayoutEffect(() => { if (visible) medir() }, [visible, value])

  useEffect(() => {
    if (!visible) return
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)
    return () => {
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
  }, [visible])

  function elegir(o) {
    onChange(o.label)
    setAbierto(false)
  }

  function onKeyDown(e) {
    if (!visible) {
      if (e.key === 'ArrowDown') setAbierto(true)
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setResaltado((r) => (r + 1) % lista.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setResaltado((r) => (r - 1 + lista.length) % lista.length) }
    else if (e.key === 'Enter') { e.preventDefault(); elegir(lista[resaltado]) }
    else if (e.key === 'Escape') { setAbierto(false) }
  }

  return (
    <div className="combo" ref={cajaRef}>
      <div className="caja-busqueda compacta">
        <input
          id={id}
          role="combobox"
          aria-expanded={visible}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={(e) => { onChange(e.target.value); setResaltado(0); setAbierto(true) }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setAbierto(false)}
          onKeyDown={onKeyDown} />
        <span className="caja-busqueda-icono" aria-hidden="true">{icono}</span>
      </div>

      {visible && pos && createPortal(
        <ul className="combo-lista" role="listbox" style={{ top: pos.top, left: pos.left, width: pos.width }}>
          {lista.map((o, i) => (
            <li key={o.key} role="option" aria-selected={i === resaltado}
                className={'combo-item' + (i === resaltado ? ' activo' : '')}
                onMouseDown={(e) => { e.preventDefault(); elegir(o) }}
                onMouseEnter={() => setResaltado(i)}>
              {o.label}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </div>
  )
}
