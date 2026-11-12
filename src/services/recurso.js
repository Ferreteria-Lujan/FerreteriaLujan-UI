import { gateway } from '../gateway/client'
import { leerPagina, PAGINA_MAX } from '../dto/page'

/*
 * CRUD generico sobre un recurso del API Gateway.
 *   desde(dtoBackend) -> modelo de la UI   (respuestas)
 *   hacia(modeloUI)   -> dtoBackend        (envios)
 *   busqueda: 'post' | 'get'  como expone /search el microservicio (ms-ventas: POST; ms-inventario: GET)
 */
export function recurso(ruta, { desde = (x) => x, hacia = (x) => x, busqueda = 'post' } = {}) {
  return {
    async listar(params = {}) {
      const { data } = await gateway.get(ruta, { params: { size: PAGINA_MAX, ...params } })
      return leerPagina(data).content.map(desde)
    },
    // Todas las paginas (el backend limita el tamano a PAGINA_MAX). Hasta que cada pantalla pida su pagina (Tarea 6).
    async listarTodo(params = {}) {
      const filas = []
      for (let page = 0; ; page++) {
        const { data } = await gateway.get(ruta, { params: { size: PAGINA_MAX, ...params, page } })
        const { content, totalPages } = leerPagina(data)
        filas.push(...content)
        if (page + 1 >= totalPages) return filas.map(desde)
      }
    },
    // Busqueda con filtros: en el body (POST) o en la query (GET), segun el microservicio
    async buscar(filtro = {}, params = {}) {
      const { data } = busqueda === 'get'
        ? await gateway.get(`${ruta}/search`, { params: { size: PAGINA_MAX, ...filtro, ...params } })
        : await gateway.post(`${ruta}/search`, filtro, { params: { size: PAGINA_MAX, ...params } })
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
