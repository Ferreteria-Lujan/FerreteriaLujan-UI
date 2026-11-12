import { RUTAS } from '../gateway/routes'
import { recurso } from './recurso'
import {
  fromCategoriaDTO, fromDepositoDTO, fromDetalleTransferenciaDTO, fromInventarioDTO, fromMarcaDTO,
  fromProductoDTO, fromTransferenciaDTO, toDepositoDTO, toDetalleTransferenciaDTO, toInventarioDTO,
  toProductoDTO, toTransferenciaDTO,
} from '../dto/inventario'

// En ms-inventario /search es GET (los filtros van en la query)
const GET = { busqueda: 'get' }

export const productos = recurso(RUTAS.inventario.productos, { desde: fromProductoDTO, hacia: toProductoDTO, ...GET })
export const marcas = recurso(RUTAS.inventario.marcas, { desde: fromMarcaDTO, ...GET })
export const categorias = recurso(RUTAS.inventario.categorias, { desde: fromCategoriaDTO, ...GET })
export const depositos = recurso(RUTAS.inventario.depositos, { desde: fromDepositoDTO, hacia: toDepositoDTO, ...GET })
export const inventarios = recurso(RUTAS.inventario.inventarios, { desde: fromInventarioDTO, hacia: toInventarioDTO, ...GET })
export const transferencias = recurso(RUTAS.inventario.transferencias, { desde: fromTransferenciaDTO, hacia: toTransferenciaDTO, ...GET })
export const detallesTransferencia = recurso(RUTAS.inventario.detallesTransferencia, {
  desde: fromDetalleTransferenciaDTO, hacia: toDetalleTransferenciaDTO, ...GET,
})
