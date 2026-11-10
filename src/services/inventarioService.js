import { RUTAS } from '../gateway/routes'
import { recurso } from './recurso'
import { fromDepositoDTO, fromProductoDTO } from '../dto/inventario'

export const productos = recurso(RUTAS.inventario.productos, { desde: fromProductoDTO })
export const depositos = recurso(RUTAS.inventario.depositos, { desde: fromDepositoDTO })
