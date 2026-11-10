// Respuesta paginada de Spring (org.springframework.data.domain.Page) tal como la envía el backend.
export const PAGINA_MAX = 100   // PAGE_MAX_SIZE del backend

export function leerPagina(data) {
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, number: 0 }
  }
  return {
    content: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
    number: data?.number ?? 0,
  }
}
