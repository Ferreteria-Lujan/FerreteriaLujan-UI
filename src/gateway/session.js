// Sesión de la UI: tokens emitidos por ms-seguridad. Es el único lugar que toca localStorage.
const K_TOKEN = 'lujan.token'
const K_REFRESH = 'lujan.refresh'
const K_USUARIO = 'lujan.usuario'
const K_ROLES = 'lujan.roles'

export const getToken = () => localStorage.getItem(K_TOKEN)
export const getRefreshToken = () => localStorage.getItem(K_REFRESH)
export const getUsuario = () => localStorage.getItem(K_USUARIO)
export const isLoggedIn = () => !!getToken()

// Roles del usuario (los devuelve /auth/me). Ej.: ['ADMIN'] o ['ROLE_ADMIN']
export function getRoles() {
  try { return JSON.parse(localStorage.getItem(K_ROLES)) ?? [] } catch { return [] }
}
export function guardarRoles(roles) {
  localStorage.setItem(K_ROLES, JSON.stringify(roles ?? []))
}
// Acepta 'ADMIN' o 'ROLE_ADMIN', sin importar mayúsculas
const normalizar = (r) => String(r).replace(/^ROLE_/i, '').toUpperCase()
export const tieneRol = (rol) => getRoles().some((r) => normalizar(r) === normalizar(rol))

export function guardarSesion({ token, refreshToken, usuario }) {
  localStorage.setItem(K_TOKEN, token)
  if (refreshToken) localStorage.setItem(K_REFRESH, refreshToken)
  if (usuario) localStorage.setItem(K_USUARIO, usuario)
}

export function actualizarToken(token) {
  localStorage.setItem(K_TOKEN, token)
}

export function cerrarSesion() {
  ;[K_TOKEN, K_REFRESH, K_USUARIO, K_ROLES].forEach((k) => localStorage.removeItem(k))
}
