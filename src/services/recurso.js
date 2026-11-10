import { gateway } from '../gateway/client'
import { leerPagina, PAGINA_MAX } from '../dto/page'

/*
 * CRUD genérico sobre un recurso del API Gateway.
 *   desde(dtoBackend) -> modelo de la UI   (respuestas)
 *   hacia(modeloUI)   -> dtoBackend        (envíos)
 */
export function recurso(ruta, { desde = (x) => x, hacia = (x) => x } = {}) {
  return {
    async listar(params = {}) {
      const { data } = await gateway.get(ruta, { params: { size: PAGINA_MAX, ...params } })
      return leerPagina(data).content.map(desde)
    },
    async obtener(id) {
      const { data } = await gateway.get(`${ruta}/${id}`)
      return desde(data)
    },
    async crear(datos) {
      const { data } = await gateway.post(ruta, hacia(datos))
      return desde(data)
    },
    async actualizar(id, datos) {
      const { data } = await gateway.put(`${ruta}/${id}`, hacia(datos))
      return desde(data)
    },
    async eliminar(id) {
      await gateway.delete(`${ruta}/${id}`)
    },
  }
}
