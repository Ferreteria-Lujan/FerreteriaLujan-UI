// Sesión de la UI: tokens emitidos por ms-seguridad. Es el único lugar que toca localStorage.
const K_TOKEN = 'lujan.token'
const K_REFRESH = 'lujan.refresh'
const K_USUARIO = 'lujan.usuario'

export const getToken = () => localStorage.getItem(K_TOKEN)
export const getRefreshToken = () => localStorage.getItem(K_REFRESH)
export const getUsuario = () => localStorage.getItem(K_USUARIO)
export const isLoggedIn = () => !!getToken()

export function guardarSesion({ token, refreshToken, usuario }) {
  localStorage.setItem(K_TOKEN, token)
  if (refreshToken) localStorage.setItem(K_REFRESH, refreshToken)
  if (usuario) localStorage.setItem(K_USUARIO, usuario)
}

export function actualizarToken(token) {
  localStorage.setItem(K_TOKEN, token)
}

export function cerrarSesion() {
  ;[K_TOKEN, K_REFRESH, K_USUARIO].forEach((k) => localStorage.removeItem(k))
}
