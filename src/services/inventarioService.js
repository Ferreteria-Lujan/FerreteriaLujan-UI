import { RUTAS } from '../gateway/routes'
import { recurso } from './recurso'
import { fromDepositoDTO, fromInventarioDTO, fromProductoDTO } from '../dto/inventario'

export const productos = recurso(RUTAS.inventario.productos, { desde: fromProductoDTO })
export const depositos = recurso(RUTAS.inventario.depositos, { desde: fromDepositoDTO })
export const inventarios = recurso(RUTAS.inventario.inventarios, { desde: fromInventarioDTO })
