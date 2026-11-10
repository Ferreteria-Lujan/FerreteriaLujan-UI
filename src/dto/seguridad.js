// DTOs de ms-seguridad: LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, MeResponse.
export const toLoginRequestDTO = ({ username, password }) => ({
  username: username.trim(),
  password,
})

export const fromLoginResponseDTO = (d) => ({
  token: d.token,
  tokenType: d.tokenType,
  expiresIn: d.expiresIn,
  refreshToken: d.refreshToken,
  refreshExpiresIn: d.refreshExpiresIn,
})

export const toRefreshRequestDTO = (refreshToken) => ({ refreshToken })

export const fromRefreshResponseDTO = (d) => ({ token: d.token, expiresIn: d.expiresIn })

export const fromMeResponseDTO = (d) => ({ username: d.username, roles: d.roles ?? [] })
