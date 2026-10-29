import { IconChevronLeft, IconChevronRight } from './Icons'

// Barra de paginación (usa las clases .paginacion / .pag-btn de theme.css)
export default function Paginacion({ pagina, totalPaginas, onCambiar }) {
  return (
    <div className="paginacion">
      <button className="pag-btn flecha" disabled={pagina === 1}
              onClick={() => onCambiar(pagina - 1)} aria-label="Anterior"><IconChevronLeft /></button>
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
        <button key={n} className={'pag-btn' + (n === pagina ? ' activa' : '')}
                onClick={() => onCambiar(n)}>{n}</button>
      ))}
      <button className="pag-btn flecha" disabled={pagina === totalPaginas}
              onClick={() => onCambiar(pagina + 1)} aria-label="Siguiente"><IconChevronRight /></button>
    </div>
  )
}
