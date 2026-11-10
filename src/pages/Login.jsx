import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../services/seguridadService'

export default function Login() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await iniciarSesion(usuario, contrasena)
      navigate('/')
    } catch (err) {
      setError(err.userMessage || 'No se pudo iniciar sesión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-card">
        <svg className="login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
        <label htmlFor="usuario">Usuario</label>
        <input id="usuario" className="input" value={usuario}
               onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required />
        <label htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" className="input" type="password" value={contrasena}
               onChange={(e) => setContrasena(e.target.value)} autoComplete="current-password" required />
        {error && <p className="badge-danger">{error}</p>}
      </div>
      <button className="btn btn-primary" type="submit" disabled={enviando}>
        {enviando ? 'Ingresando...' : 'Iniciar sesion'}
      </button>
    </form>
  )
}
