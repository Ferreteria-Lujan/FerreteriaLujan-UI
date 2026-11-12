import { useMemo, useState } from 'react'
import { IconPencil, IconTrash } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import FormModal from '../../../components/FormModal'
import ConfirmarEliminar from '../../../components/ConfirmarEliminar'
import { productoModalConfig, campoUnico } from '../../../components/formModalConfigs'
import useCargar from '../../../hooks/useCargar'
import { esAdmin } from '../../../gateway/roles'
import {
  productos as productosApi, depositos as depositosApi, inventarios as inventariosApi,
  marcas as marcasApi, categorias as categoriasApi, detallesTransferencia as detallesApi,
} from '../../../services/inventarioService'
import InventarioShell from './InventarioShell'
import { gs } from '../../../components/factura/facturaConfig'

const ESTADOS = ['En stock', 'Stock bajo']
const POR_PAGINA = 10
const STOCK_BAJO = 10   // umbral si el producto no tiene stockMinimo cargado en inventarios

// Productos + stock por depósito (inventarios) + depósitos, todo vía gateway -> ms-inventario
async function cargar() {
  const [prods, invs, deps, marcas, categorias] = await Promise.all([
    productosApi.listarTodo({ sort: 'codigo,asc' }),
    inventariosApi.listarTodo(),
    depositosApi.listarTodo(),
    marcasApi.listarTodo(),
    categoriasApi.listarTodo(),
  ])
  const lista = prods.map((p) => {
    const propios = invs.filter((i) => i.idProducto === p.id)
    const stock = propios.reduce((s, i) => s + i.cantidad, 0)
    const conStock = propios.find((i) => i.cantidad > 0) ?? propios[0]
    const minimo = propios.reduce((m, i) => m + (i.stockMinimo ?? 0), 0)   // stockMinimo de InventarioDTO
    const umbral = minimo > 0 ? minimo : STOCK_BAJO
    return {
      id: p.id, codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion,
      precioCompra: p.precioCompra, precio: p.precioVenta, idMarca: p.idMarca, idCategoria: p.idCategoria,
      stock, estado: stock < umbral ? 'Stock bajo' : 'En stock',
      idDeposito: conStock?.idDeposito ?? '', inventarios: propios,
    }
  })
  return { lista, depositos: deps, marcas, categorias }
}

// Registro de la tabla -> valores del formulario
const aFormulario = (p) => ({
  codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion ?? '',
  cantidad: p.stock, precioCompra: p.precioCompra ?? '', precioVenta: p.precio,
  depositoOrigen: p.idDeposito === '' ? '' : String(p.idDeposito),
  marca: p.idMarca == null ? '' : String(p.idMarca),
  categoria: p.idCategoria == null ? '' : String(p.idCategoria),
})

export default function Productos() {
  const { datos, cargando, error, recargar } = useCargar(cargar, { lista: [], depositos: [], marcas: [], categorias: [] })
  const productos = datos.lista
  const [modal, setModal] = useState(null)                // null | { producto: null } (nuevo) | { producto } (editar)
  const [aEliminar, setAEliminar] = useState(null)         // producto pendiente de confirmar
  const admin = esAdmin()                                   // solo el ADMIN ve el botón Eliminar
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [pagina, setPagina] = useState(1)   // TODO: pedir esta página al backend (Tarea 6)

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

  const opciones = (lista) => lista.map((x) => ({ value: String(x.id), label: x.nombre }))
  const editando = modal?.producto ?? null
  let cfg = campoUnico(productoModalConfig(opciones(datos.depositos), opciones(datos.marcas), opciones(datos.categorias)), 'codigo', productos, (p) => p.codigo,
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
    const datosProducto = {
      codigo: v.codigo.trim(), nombre: v.nombre.trim(), descripcion: v.descripcion.trim() || null,
      precioCompra: Number(v.precioCompra), precioVenta: Number(v.precioVenta),
      idMarca: Number(v.marca), idCategoria: v.categoria ? Number(v.categoria) : null,
    }
    const idDeposito = Number(v.depositoOrigen)
    const cantidad = Number(v.cantidad)
    const guardado = editando
      ? await productosApi.actualizar(editando.id, datosProducto)
      : await productosApi.crear(datosProducto)

    // Stock en el depósito elegido (inventarios)
    const existente = editando?.inventarios.find((i) => i.idDeposito === idDeposito)
    const stock = { idDeposito, idProducto: guardado.id, cantidad }
    if (existente?.id != null) {
      if (existente.cantidad !== cantidad) await inventariosApi.actualizar(existente.id, { ...existente, cantidad })
    } else if (!existente) {
      await inventariosApi.crear(stock)
    }
    setModal(null)
    setPagina(1)
    recargar()
  }

  // El backend no borra en cascada: sus registros de stock (inventarios) referencian al producto y
  // bloquean el DELETE (409). Se borran primero, salvo que el producto ya figure en una transferencia.
  async function eliminarProducto() {
    const enTransferencias = await detallesApi.buscar({ idProducto: aEliminar.id }, { size: 1 })
    if (enTransferencias.length > 0) {
      throw new Error('No se puede eliminar: el producto figura en transferencias registradas')
    }
    for (const inv of aEliminar.inventarios) await inventariosApi.eliminar(inv.id)
    await productosApi.eliminar(aEliminar.id)   // DELETE /api/productos/{id} (solo ADMIN en el backend)
    setAEliminar(null)
    recargar()
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
          <div className="fila fila-dato" key={p.id}>
            <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
            <span className="c-nro">{p.codigo}</span>
            <span>{p.nombre}</span>
            <span className="c-total">{gs(p.precio)}</span>
            <span className="c-fecha">{p.stock}</span>
            <span className={'c-estado ' + (p.estado === 'En stock' ? 'estado-pagado' : 'estado-pendiente')}>{p.estado}</span>
            <div className="acciones-fila">
              <button className="btn-ver" aria-label={`Editar ${p.codigo}`} onClick={() => setModal({ producto: p })}><IconPencil /></button>
              {admin && (
                <button className="btn-ver btn-ver--peligro" aria-label={`Eliminar ${p.codigo}`} onClick={() => setAEliminar(p)}><IconTrash /></button>
              )}
            </div>
          </div>
        ))}
        {cargando && <p className="sin-resultados">Cargando productos…</p>}
        {error && (
          <p className="sin-resultados" role="alert">
            {error} <button type="button" className="btn-ver" onClick={recargar}>Reintentar</button>
          </p>
        )}
        {!cargando && !error && visibles.length === 0 && <p className="sin-resultados">No se encontraron productos</p>}

        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </InventarioShell>

      <FormModal
        open={modal !== null}
        {...cfg}
        initialValues={valoresIniciales}
        onClose={() => setModal(null)}
        onSubmit={guardarProducto} />

      {aEliminar && (
        <ConfirmarEliminar
          titulo="Eliminar producto"
          mensaje={`¿Eliminar el producto ${aEliminar.codigo} — ${aEliminar.nombre}? Se borra también su stock en los depósitos. Esta acción no se puede deshacer.`}
          onConfirmar={eliminarProducto}
          onClose={() => setAEliminar(null)} />
      )}
    </>
  )
}
