// Configuración de la factura reutilizable.
// FacturaForm y FacturaLista son UNA sola implementación: lo que cambia entre
// compra y venta vive acá, en un objeto de configuración.
//
// Para agregar otro tipo (ej. nota de crédito) se crea otro objeto con la misma forma.

export const gs = (n) => Number(n ?? 0).toLocaleString('es-PY') + ' Gs.'
export const fechaCorta = (iso) => (iso ? iso.split('T')[0].split('-').reverse().join('/') : '—')   // 2026-08-20 -> 20/08/2026
export const hoyISO = () => new Date().toLocaleDateString('en-CA')   // YYYY-MM-DD en hora LOCAL (toISOString usa UTC y de noche daría el día siguiente)
export const hoyLargo = () =>
  new Date().toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const CONDICIONES = ['Contado', 'Crédito']
export const CONDICION_CLASE = { Contado: 'estado-pagado', Crédito: 'estado-pendiente' }

// ---------------------------------------------------------------- COMPRA
export const FACTURA_COMPRA = {
  tipo: 'compra',
  iva: 0.10,
  ivaIncluido: true,                 // igual que ms-compras (app.compras.iva.incluido-en-precio=true): el costo ya incluye el IVA

  // Qué cambia en el FORMULARIO
  titulo: 'Nueva Factura de Compra',
  tercero: {
    panel: 'Proveedor y Datos de la Factura',
    label: 'Proveedor *',
    placeholder: 'Buscar proveedor por nombre o RUC...',
    botonNuevo: '+ Nuevo Proveedor',
    modalTitulo: 'Nuevo Proveedor',
    ocultarCampos: ['ciudad'],       // PersonaDTO no tiene ciudad
  },
  datosDocumento: true,              // la factura la emite el proveedor: se carga nro, timbrado, fechas y condición
  precioEditable: true,              // el costo puede variar en cada compra
  validaStock: false,                // comprar no descuenta stock
  deposito: null,                    // ms-compras no guarda depósito ni suma stock (ver docs/CONEXION_BACKEND.md)
  itemsPanel: 'Productos de la Factura',
  precioLabel: 'Costo Unit.',
  confirmar: 'Registrar Compra',

  // Qué cambia en la LISTA
  lista: {
    titulo: 'Facturas de compras',
    terceroColumna: 'Proveedor',
    estadoColumna: 'Condición',      // el backend no tiene estado de pago: se muestra Contado / Crédito
    estados: CONDICIONES,
    estadoClase: CONDICION_CLASE,
    botonNueva: '+ Nueva Compra',
    rutaNueva: '/compras/facturas/nueva',
    placeholder: 'Buscar por número o proveedor...',
  },
  rutaAlGuardar: '/compras/facturas',
}

// ---------------------------------------------------------------- VENTA
export const FACTURA_VENTA = {
  tipo: 'venta',
  iva: 0.10,                         // TODO: confirmar si precio_venta ya incluye IVA
  ivaIncluido: false,                // hoy el IVA se suma al precio (cambiar a true si ms-ventas lo incluye)

  titulo: 'Nueva Venta Directa',
  tercero: {
    panel: 'Seleccionar Cliente',
    label: 'Cliente *',
    placeholder: 'Buscar cliente por nombre o RUC...',
    botonNuevo: '+ Nuevo Cliente',
    modalTitulo: 'Nuevo Cliente',
  },
  datosDocumento: false,             // nro, timbrado y fecha los define el backend
  precioEditable: false,             // se vende al precio de lista
  validaStock: true,                 // una venta descuenta del depósito elegido
  deposito: {
    label: 'Depósito',
    panel: 'Depósito Seleccionado',
    nota: 'Stock disponible para descuento',
  },
  itemsPanel: 'Productos en la Venta',
  precioLabel: 'Precio Unit.',
  confirmar: 'Confirmar Venta',

  lista: {
    titulo: 'Facturas',
    terceroColumna: 'Cliente',
    estadoColumna: 'Condición',      // igual que compras: Contado / Crédito, según la factura
    estados: CONDICIONES,
    estadoClase: CONDICION_CLASE,
    botonNueva: '+ Nueva Venta',
    rutaNueva: '/ventas/venta-directa',
    placeholder: 'Buscar por número o cliente...',
  },
  rutaAlGuardar: '/ventas',
}
