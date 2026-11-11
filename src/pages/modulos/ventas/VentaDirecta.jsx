import { useNavigate } from 'react-router-dom'
import FacturaForm from '../../../components/factura/FacturaForm'
import { FACTURA_VENTA } from '../../../components/factura/facturaConfig'
import useCargar from '../../../hooks/useCargar'
import { depositos, inventarios, productos } from '../../../services/inventarioService'
import { crearCliente, listarTerceros, registrarVenta } from '../../../services/ventasService'

async function cargarCatalogos() {
  const [terceros, prods, deps, inv] = await Promise.all([
    listarTerceros(),
    productos.listar({ sort: 'nombre,asc' }),
    depositos.listar({ sort: 'nombre,asc' }),
    inventarios.listar(),   // TODO: si hay mas de 100 registros de stock, usar busqueda por deposito
  ])
  return {
    terceros,
    productos: prods.map((p) => ({ id: p.id, codigo: p.codigo, nombre: p.nombre, precio: p.precioVenta })),
    depositos: deps.map((d) => ({ id: d.id, nombre: d.nombre })),
    stock: new Map(inv.map((i) => [`${i.idDeposito}-${i.idProducto}`, i.cantidad])),
  }
}

const VACIO = { terceros: [], productos: [], depositos: [], stock: new Map() }

export default function VentaDirecta() {
  const navigate = useNavigate()
  const { datos, cargando, error, recargar } = useCargar(cargarCatalogos, null)
  const cat = datos ?? VACIO

  const stockDe = (idDeposito, idProducto) => cat.stock.get(`${idDeposito}-${idProducto}`) ?? 0

  async function nuevoCliente(form) {
    const creado = await crearCliente(form)   // lanza con userMessage si falla
    recargar()                                // refresca la lista de clientes
    return creado
  }

  async function confirmar(d) {
    await registrarVenta(d)
    navigate(FACTURA_VENTA.rutaAlGuardar)
  }

  return (
    <FacturaForm
      config={FACTURA_VENTA}
      terceros={cat.terceros}
      productos={cat.productos}
      depositos={cat.depositos}
      stockDe={stockDe}
      cargando={cargando}
      error={error}
      onNuevoTercero={nuevoCliente}
      onConfirmar={confirmar} />
  )
}
