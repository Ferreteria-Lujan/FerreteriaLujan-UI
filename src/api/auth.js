import api from './cliente'

const MODE = import.meta.env.VITE_AUTH_MODE || 'local'

export async function login(usuario, contrasena) {
  if (MODE === 'local') {
    // Sin backend: compara con VITE_DEV_USER / VITE_DEV_PASS (.env.development)
    if (usuario === import.meta.env.VITE_DEV_USER && contrasena === import.meta.env.VITE_DEV_PASS) {
      localStorage.setItem('token', 'local')
      return
    }
    const err = new Error('Credenciales inválidas')
    err.userMessage = 'Usuario o contraseña incorrectos'
    throw err
  }
  // TODO: confirmar URL y nombres de campos con el backend
  const { data } = await api.post('/auth/login', { username: usuario, password: contrasena })
  localStorage.setItem('token', data.token)
}

export function logout() {
  localStorage.removeItem('token')
}

export function isLoggedIn() {
  return !!localStorage.getItem('token')
}
