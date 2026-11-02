// Configuraciones de FormModal por entidad. Para un módulo nuevo: definir { title, fields }.

// Los depósitos vienen del backend, por eso es una función
export const productoModalConfig = (depositos = []) => ({
  title: 'Nuevo Producto',
  cancelLabel: 'Cancelar',
  fields: [
    { name: 'codigo', label: 'Código', placeholder: 'PRD-000001', required: true },
    { name: 'nombre', label: 'Nombre', placeholder: 'Nombre del producto', required: true },
    { name: 'cantidad', label: 'Cantidad', type: 'number', min: 0, step: 1, placeholder: '0', required: true, half: true },
    { name: 'precioCompra', label: 'Precio Compra', type: 'number', min: 0, placeholder: '0', required: true, half: true },
    { name: 'precioVenta', label: 'Precio Venta', type: 'number', min: 0, placeholder: '0', required: true, half: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción del producto' },
    { name: 'depositoOrigen', label: 'Depósito Origen', type: 'select', options: depositos, placeholder: 'Seleccionar depósito', required: true },
  ],
})

export const proveedorModalConfig = {
  title: 'Nuevo Proveedor',
  cancelLabel: 'Cancelar',
  fields: [
    { name: 'codigo', label: 'Código', placeholder: 'PROV-005', required: true },
    { name: 'nombreEmpresa', label: 'Nombre empresa', placeholder: 'Nombre del proveedor', required: true },
    { name: 'contacto', label: 'Contacto', placeholder: 'Nombre del contacto' },
    { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '021-000-0000' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'correo@empresa.com' },
    { name: 'ruc', label: 'RUC', placeholder: '80000000-0', required: true },
    { name: 'direccion', label: 'Dirección', type: 'textarea', rows: 2, placeholder: 'Dirección completa' },
  ],
}

export const clienteModalConfig = {
  title: 'Nuevo Cliente',
  cancelLabel: 'Cancelar',
  fields: [
    { name: 'nombre', label: 'Nombre / Razón Social', placeholder: 'Nombre del cliente o empresa', required: true },
    { name: 'ruc', label: 'RUC / CI', placeholder: '80000000-0', required: true, half: true },
    { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '021-000-0000', half: true },
    { name: 'correo', label: 'Email', type: 'email', placeholder: 'correo@cliente.com', half: true },
    { name: 'ciudad', label: 'Ciudad', placeholder: 'Asunción', half: true },
    { name: 'direccion', label: 'Dirección', placeholder: 'Dirección completa' },
  ],
}

// Devuelve la config con un campo que no admite repetidos.
//   existentes: registros ya cargados · obtener: (registro) => valor a comparar · ignorar: registro que se está editando
export function campoUnico(config, name, existentes, obtener, mensaje, ignorar) {
  const norm = (v) => String(v ?? '').trim().toLowerCase()
  return {
    ...config,
    fields: config.fields.map((f) => f.name !== name ? f : {
      ...f,
      validate: (v) => existentes.some((r) => r !== ignorar && norm(obtener(r)) === norm(v)) ? mensaje : undefined,
    }),
  }
}

// Campos vacíos -> null (para enviar al backend)
export const vaciosANull = (form) =>
  Object.fromEntries(Object.entries(form).map(([k, v]) => [k, String(v).trim() || null]))
