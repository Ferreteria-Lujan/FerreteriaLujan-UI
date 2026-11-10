// Rutas de la API. Son las URL que el API Gateway expone (ver api-gateway/application.yml).
// La UI nunca arma URLs a microservicios: todo sale de acá, relativo a /api del gateway.
export const RUTAS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  compras: {
    proveedores: '/proveedores',
    facturas: '/facturas-compras',
    detalles: '/detalles-compras',
  },
  inventario: {
    productos: '/productos',
    marcas: '/marcas',
    categorias: '/categorias-productos',
    depositos: '/depositos',
    inventarios: '/inventarios',
    transferencias: '/transferencias',
    detallesTransferencia: '/detalles-transferencia',
  },
  ventas: {
    clientes: '/clientes',
    presupuestos: '/presupuestos',
    presupuestosDetalle: '/presupuestos-detalle',
    facturas: '/facturas-ventas',
    detallesFacturas: '/detalles-facturas-ventas',
  },
}
