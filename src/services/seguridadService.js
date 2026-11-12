import { gateway } from '../gateway/client'
import { RUTAS } from '../gateway/routes'
import { guardarRoles, guardarSesion } from '../gateway/session'
import { fromLoginResponseDTO, fromMeResponseDTO, toLoginRequestDTO } from '../dto/seguridad'

export async function iniciarSesion(usuario, contrasena) {
  const { data } = await gateway.post(
    RUTAS.auth.login,
    toLoginRequestDTO({ username: usuario, password: contrasena }),
    { sinAuth: true },
  )
  const sesion = fromLoginResponseDTO(data)
  guardarSesion({ token: sesion.token, refreshToken: sesion.refreshToken, usuario: usuario.trim() })
  // Roles para decidir qué botones se muestran. Si /auth/me falla, la sesión queda sin roles (sin permisos extra).
  try {
    guardarRoles((await usuarioActual()).roles)
  } catch {
    guardarRoles([])
  }
  return sesion
}

export async function usuarioActual() {
  const { data } = await gateway.get(RUTAS.auth.me)
  return fromMeResponseDTO(data)
}
