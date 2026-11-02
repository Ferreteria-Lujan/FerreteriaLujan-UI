import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import InventarioShell from './InventarioShell'
import { gs, fechaCorta } from './datos'

// TODO: reemplazar por los datos del backend (ms-inventario)
const TRANSFERENCIAS = [
  { nro: 'TRF-000012', origen: 'Depósito Central', destino: 'Depósito Norte', total: 1250000, fecha: '2026-08-20', estado: 'Completada' },
  { nro: 'TRF-000011', origen: 'Depósito Central', destino: 'Depósito Sur',   total: 3480000, fecha: '2026-08-19', estado: 'Completada' },
  { nro: 'TRF-000010', origen: 'Depósito Norte',   destino: 'Depósito Sur',   total: 890000,  fecha: '2026-08-19', estado: 'Pendiente' },
  { nro: 'TRF-000009', origen: 'Depósito Sur',     destino: 'Depósito Central', total: 5200000, fecha: '2026-08-18', estado: 'Completada' },
  { nro: 'TRF-000008', origen: 'Depósito Central', destino: 'Depósito Norte', total: 2100000, fecha: '2026-08-17', estado: 'Completada' },
]
const ESTADOS = ['Completada', 'Pendiente']
const POR_PAGINA = 10

export default function Transferencias() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [pagina, setPagina] = useState(1)   // TODO: pedir esta página al backend

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return TRANSFERENCIAS.filter((t) =>
      (estado === 'Todos' || t.estado === estado) &&
      (!q || [t.nro, t.origen, t.destino].some((c) => c.toLowerCase().includes(q))))
  }, [busqueda, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  return (
    <InventarioShell
      accion={<button type="button" className="btn-agregar" onClick={() => navigate('/inventario/transferencias/nueva')}>+ Nueva Transferencia</button>}
      busqueda={busqueda} onBusqueda={(v) => { setBusqueda(v); setPagina(1) }}
      placeholder="Buscar por número o depósito..."
      estados={ESTADOS} estado={estado} onEstado={(v) => { setEstado(v); setPagina(1) }}>
      <div className="fila cabecera">
        <span>#</span><span>Nro. Transferencia</span><span>Origen</span><span>Destino</span>
        <span>Total</span><span>Fecha</span><span>Estado</span><span />
      </div>

      {visibles.map((t, i) => (
        <div className="fila fila-dato" key={t.nro}>
          <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
          <span className="c-nro">{t.nro}</span>
          <span>{t.origen}</span>
          <span>{t.destino}</span>
          <span className="c-total">{gs(t.total)}</span>
          <span className="c-fecha">{fechaCorta(t.fecha)}</span>
          <span className={'c-estado ' + (t.estado === 'Completada' ? 'estado-pagado' : 'estado-pendiente')}>{t.estado}</span>
          <button className="btn-ver" aria-label={`Ver ${t.nro}`}><IconSearch /></button>
        </div>
      ))}
      {visibles.length === 0 && <p className="sin-resultados">No se encontraron transferencias</p>}

      <div className="espacio" />
      <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </InventarioShell>
  )
}
