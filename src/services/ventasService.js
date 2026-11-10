import { RUTAS } from '../gateway/routes'
import { recurso } from './recurso'
import { fromClienteDTO, toClienteDTO } from '../dto/ventas'

export const clientes = recurso(RUTAS.ventas.clientes, { desde: fromClienteDTO, hacia: toClienteDTO })
