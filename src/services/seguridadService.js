import { gateway } from '../gateway/client'
import { RUTAS } from '../gateway/routes'
import { guardarSesion } from '../gateway/session'
import { fromLoginResponseDTO, fromMeResponseDTO, toLoginRequestDTO } from '../dto/seguridad'

export async function iniciarSesion(usuario, contrasena) {
  const { data } = await gateway.post(
    RUTAS.auth.login,
    toLoginRequestDTO({ username: usuario, password: contrasena }),
    { sinAuth: true },
  )
  const sesion = fromLoginResponseDTO(data)
  guardarSesion({ token: sesion.token, refreshToken: sesion.refreshToken, usuario: usuario.trim() })
  return sesion
}

export async function usuarioActual() {
  const { data } = await gateway.get(RUTAS.auth.me)
  return fromMeResponseDTO(data)
}
