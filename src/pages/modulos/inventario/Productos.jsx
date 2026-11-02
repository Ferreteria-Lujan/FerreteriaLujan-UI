import { useMemo, useState } from 'react'
import { IconPencil, IconSearch } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import FormModal from '../../../components/FormModal'
import { productoModalConfig, campoUnico } from '../../../components/formModalConfigs'
import InventarioShell from './InventarioShell'
import { DEPOSITOS, PRODUCTOS, gs } from './datos'

const ESTADOS = ['En stock', 'Stock bajo']
const POR_PAGINA = 10
const STOCK_BAJO = 10   // TODO: el umbral debería venir del backend

// Registro de la tabla -> valores del formulario
const aFormulario = (p) => ({
  codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion ?? '',
  cantidad: p.stock, precioCompra: p.precioCompra ?? '', precioVenta: p.precio,
  depositoOrigen: p.deposito ?? '',
})

export default function Productos() {
  const [productos, setProductos] = useState(PRODUCTOS)   // TODO: cargar desde ms-inventario
  const [modal, setModal] = useState(null)                // null | { producto: null } (nuevo) | { producto } (editar)
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [pagina, setPagina] = useState(1)   // TODO: pedir esta página al backend

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos.filter((p) =>
      (estado === 'Todos' || p.estado === estado) &&
      (!q || p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q)))
  }, [productos, busqueda, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  const editando = modal?.producto ?? null
  let cfg = campoUnico(productoModalConfig(DEPOSITOS), 'codigo', productos, (p) => p.codigo,
    'Ya existe un producto con ese código', editando)
  if (editando) {
    cfg = {
      ...cfg, title: 'Editar Producto',
      fields: cfg.fields.map((f) => f.name === 'codigo' ? { ...f, disabled: true } : f),   // el código es la clave
    }
  }
  const valoresIniciales = editando
    ? aFormulario(editando)
    : { codigo: 'PRD-' + String(productos.length + 1).padStart(6, '0') }

  async function guardarProducto(v) {
    // TODO: POST / PUT a ms-inventario (el stock inicial se registra en el depósito elegido)
    const stock = Number(v.cantidad)
    const datos = {
      codigo: v.codigo.trim(), nombre: v.nombre.trim(), descripcion: v.descripcion.trim() || null,
      precioCompra: Number(v.precioCompra), precio: Number(v.precioVenta),
      deposito: v.depositoOrigen, stock,
      estado: stock < STOCK_BAJO ? 'Stock bajo' : 'En stock',
    }
    if (editando) setProductos((prev) => prev.map((p) => (p === editando ? { ...p, ...datos } : p)))
    else { setProductos((prev) => [datos, ...prev]); setPagina(1) }
    setModal(null)
  }

  return (
    <>
      <InventarioShell
        accion={<button type="button" className="btn-agregar" onClick={() => setModal({ producto: null })}>+ Nuevo Producto</button>}
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
            <div className="acciones-fila">
              <button className="btn-ver" aria-label={`Ver ${p.codigo}`}><IconSearch /></button>
              <button className="btn-ver" aria-label={`Editar ${p.codigo}`} onClick={() => setModal({ producto: p })}><IconPencil /></button>
            </div>
          </div>
        ))}
        {visibles.length === 0 && <p className="sin-resultados">No se encontraron productos</p>}

        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </InventarioShell>

      <FormModal
        open={modal !== null}
        {...cfg}
        initialValues={valoresIniciales}
        onClose={() => setModal(null)}
        onSubmit={guardarProducto} />
    </>
  )
}
