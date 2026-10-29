import { useMemo, useState } from 'react'
import { IconSearch } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import InventarioShell from './InventarioShell'
import { PRODUCTOS, gs } from './datos'

const ESTADOS = ['En stock', 'Stock bajo']
const POR_PAGINA = 10

export default function Productos() {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [pagina, setPagina] = useState(1)   // TODO: pedir esta página al backend

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return PRODUCTOS.filter((p) =>
      (estado === 'Todos' || p.estado === estado) &&
      (!q || p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q)))
  }, [busqueda, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  return (
    <InventarioShell
      busqueda={busqueda} onBusqueda={(v) => { setBusqueda(v); setPagina(1) }}
      placeholder="Buscar por código o producto..."
      estados={ESTADOS} estado={estado} onEstado={(v) => { setEstado(v); setPagina(1) }}>
      <div className="fila cabecera">
        <span>#</span><span>Código</span><span>Producto</span>
        <span>Precio</span><span>Stock</span><span>Estado</span><span />
      </div>

      {visibles.map((p, i) => (
        <div className="fila fila-dato" key={p.codigo}>
          <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
          <span className="c-nro">{p.codigo}</span>
          <span>{p.nombre}</span>
          <span className="c-total">{gs(p.precio)}</span>
          <span className="c-fecha">{p.stock}</span>
          <span className={'c-estado ' + (p.estado === 'En stock' ? 'estado-pagado' : 'estado-pendiente')}>{p.estado}</span>
          <button className="btn-ver" aria-label={`Ver ${p.codigo}`}><IconSearch /></button>
        </div>
      ))}
      {visibles.length === 0 && <p className="sin-resultados">No se encontraron productos</p>}

      <div className="espacio" />
      <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </InventarioShell>
  )
}
