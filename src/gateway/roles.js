import { tieneRol } from './session'

// Roles de ms-seguridad
export const ROLES = { ADMIN: 'ADMIN' }

// La UI solo oculta los botones; el backend (rol ADMIN en el DELETE) es quien realmente lo impide.
export const esAdmin = () => tieneRol(ROLES.ADMIN)
