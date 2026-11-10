import axios from 'axios'
import { RUTAS } from './routes'
import { actualizarToken, cerrarSesion, getRefreshToken, getToken } from './session'
import { fromRefreshResponseDTO, toRefreshRequestDTO } from '../dto/seguridad'

/*
 * Cliente HTTP ÚNICO de la UI. Toda llamada al backend pasa por acá y va al API Gateway
 * (mismo origen: '/api'; en desarrollo Vite lo reenvía a VITE_API_TARGET).
 * Nunca se apunta a un microservicio ni a la base de datos.
 */
export const gateway = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

// Access token en cada petición, salvo las marcadas con sinAuth (login y refresh)
gateway.interceptors.request.use((config) => {
  const token = getToken()
  if (token && !config.sinAuth) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Un único refresh aunque haya varias peticiones con 401 a la vez
let renovacion = null
function renovarToken() {
  if (!renovacion) {
    renovacion = gateway
      .post(RUTAS.auth.refresh, toRefreshRequestDTO(getRefreshToken()), { sinAuth: true })
      .then(({ data }) => {
        const { token } = fromRefreshResponseDTO(data)
        actualizarToken(token)
        return token
      })
      .finally(() => { renovacion = null })
  }
  return renovacion
}

gateway.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config ?? {}
    const status = err.response?.status ?? null

    if (status === 401 && !config.sinAuth) {
      if (!config._reintentado && getRefreshToken()) {
        try {
          const token = await renovarToken()
          config._reintentado = true
          config.headers.Authorization = `Bearer ${token}`
          return gateway(config)
        } catch {
          // sin renovación posible: se cierra la sesión abajo
        }
      }
      cerrarSesion()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }

    err.status = status
    err.userMessage = mensajeDe(err)
    return Promise.reject(err)
  },
)

// Mensaje para la pantalla. El backend responde ApiErrorDTO { timestamp, status, error, message, path }
function mensajeDe(err) {
  const dto = err.response?.data
  if (dto?.message) return dto.message
  if (err.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder'
  if (!err.response) return 'No se pudo conectar con el servidor'
  return 'No se pudo completar la operación'
}
