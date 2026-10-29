import { useState } from 'react'
import { IconSearch, IconChevronLeft, IconChevronRight } from '../../../components/Icons'

// TODO: reemplazar por los datos del backend (ms-ventas)
const VENTAS = [
  { nro: 'VTA-000012', cliente: 'Ferretería El Tornillo', total: 1250000, fecha: '20/08/2026', estado: 'Pagado' },
  { nro: 'VTA-000011', cliente: 'Construcciones Aranda',  total: 3480000, fecha: '19/08/2026', estado: 'Pagado' },
  { nro: 'VTA-000010', cliente: 'Distribuidora Pérez',    total: 890000,  fecha: '19/08/2026', estado: 'Pendiente' },
  { nro: 'VTA-000009', cliente: 'Constructora López',     total: 5200000, fecha: '18/08/2026', estado: 'Pagado' },
  { nro: 'VTA-000008', cliente: 'Obras Civiles SA',       total: 2100000, fecha: '17/08/2026', estado: 'Pagado' },
]
const PAGINAS = 5

const gs = (n) => n.toLocaleString('es-PY') + ' Gs.'

export default function VentasHome() {
  const [pagina, setPagina] = useState(1)   // TODO: pedir esta página al backend
  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Módulo de Ventas</h1>

      <div className="tabla-ventas">
        <div className="fila cabecera">
          <span>#</span><span>Nro. Venta</span><span>Cliente</span>
          <span>Total</span><span>Fecha</span><span>Estado</span><span />
        </div>

        {VENTAS.map((v, i) => (
          <div className="fila fila-dato" key={v.nro}>
            <span className="c-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="c-nro">{v.nro}</span>
            <span>{v.cliente}</span>
            <span className="c-total">{gs(v.total)}</span>
            <span className="c-fecha">{v.fecha}</span>
            <span className={'c-estado ' + (v.estado === 'Pagado' ? 'estado-pagado' : 'estado-pendiente')}>
              {v.estado}
            </span>
            <button className="btn-ver" aria-label={`Ver ${v.nro}`}><IconSearch /></button>
          </div>
        ))}

        <div className="espacio" />

        <div className="paginacion">
          <button className="pag-btn flecha" disabled={pagina === 1}
                  onClick={() => setPagina(pagina - 1)} aria-label="Anterior"><IconChevronLeft /></button>
          {Array.from({ length: PAGINAS }, (_, i) => i + 1).map((n) => (
            <button key={n} className={'pag-btn' + (n === pagina ? ' activa' : '')}
                    onClick={() => setPagina(n)}>{n}</button>
          ))}
          <button className="pag-btn flecha" disabled={pagina === PAGINAS}
                  onClick={() => setPagina(pagina + 1)} aria-label="Siguiente"><IconChevronRight /></button>
        </div>
      </div>
    </section>
  )
}


