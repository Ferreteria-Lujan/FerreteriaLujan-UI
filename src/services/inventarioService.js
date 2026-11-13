import { gateway } from '../gateway/client'
import { RUTAS } from '../gateway/routes'
import { recurso } from './recurso'
import {
  fromCategoriaDTO, fromDepositoDTO, fromDetalleTransferenciaDTO, fromInventarioDTO, fromMarcaDTO,
  fromProductoDTO, fromTransferenciaDTO, fromTransferenciaProcesadaDTO, toAjusteStockDTO, toDepositoDTO,
  toDetalleTransferenciaDTO, toInventarioDTO, toProcesarTransferenciaDTO, toProductoDTO, toTransferenciaDTO,
} from '../dto/inventario'

// En ms-inventario /search es GET (los filtros van en la query)
const GET = { busqueda: 'get' }

export const productos = recurso(RUTAS.inventario.productos, { desde: fromProductoDTO, hacia: toProductoDTO, ...GET })
export const marcas = recurso(RUTAS.inventario.marcas, { desde: fromMarcaDTO, ...GET })
export const categorias = recurso(RUTAS.inventario.categorias, { desde: fromCategoriaDTO, ...GET })
export const depositos = recurso(RUTAS.inventario.depositos, { desde: fromDepositoDTO, hacia: toDepositoDTO, ...GET })

// Todas las peticiones van al API Gateway (baseURL /api) y de ahi a ms-inventario.
export const inventarios = {
  ...recurso(RUTAS.inventario.inventarios, { desde: fromInventarioDTO, hacia: toInventarioDTO, ...GET }),

  // GET /inventarios/stock?idDeposito=&idProducto= -> cantidad disponible (0 si no hay registro)
  async consultarStock(idDeposito, idProducto) {
    const { data } = await gateway.get(`${RUTAS.inventario.inventarios}/stock`, { params: { idDeposito, idProducto } })
    return Number(data)
  },
  // POST /inventarios/incrementar: sube el stock y crea el registro si el producto no estaba en el deposito
  async incrementar(ajuste) {
    const { data } = await gateway.post(`${RUTAS.inventario.inventarios}/incrementar`, toAjusteStockDTO(ajuste))
    return fromInventarioDTO(data)
  },
  // POST /inventarios/descontar: baja el stock (422 si no alcanza)
  async descontar(ajuste) {
    const { data } = await gateway.post(`${RUTAS.inventario.inventarios}/descontar`, toAjusteStockDTO(ajuste))
    return fromInventarioDTO(data)
  },
}

export const transferencias = {
  ...recurso(RUTAS.inventario.transferencias, { desde: fromTransferenciaDTO, hacia: toTransferenciaDTO, ...GET }),

  // POST /transferencias/procesar: guarda cabecera y detalles, descuenta del origen y suma en el destino,
  // todo en una sola transaccion del backend (422 si no hay stock, deposito inexistente u origen = destino)
  async procesar(transferencia) {
    const { data } = await gateway.post(`${RUTAS.inventario.transferencias}/procesar`, toProcesarTransferenciaDTO(transferencia))
    return fromTransferenciaProcesadaDTO(data)
  },
}
export const detallesTransferencia = recurso(RUTAS.inventario.detallesTransferencia, {
  desde: fromDetalleTransferenciaDTO, hacia: toDetalleTransferenciaDTO, ...GET,
})
