import { useNavigate } from 'react-router-dom'

const errores = {
  400: {
    titulo: 'Solicitud incorrecta',
    mensaje: 'No pudimos procesar lo que pediste. Es posible que el enlace esté incompleto o haya vencido.',
    ayuda: 'Revisá la dirección o volvé a la pantalla anterior.',
  },
  500: {
    titulo: 'Algo salió mal',
    mensaje: 'Tuvimos un problema interno y no pudimos completar la operación. Tus datos están seguros.',
    ayuda: 'Esperá unos segundos y volvé a intentarlo.',
  },
}

export default function ErrorPage({ code }) {
  const navigate = useNavigate()
  const error = errores[code]

  return (
    <section className="error-page">
      <div className="error-icono" aria-hidden="true">
        {code === 400 ? (
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M39.5 8.5a16 16 0 0 0-17 22.2L8.8 44.4a6.8 6.8 0 0 0 9.6 9.6l13.7-13.7a16 16 0 0 0 22.2-17l-9.7 9.6-9.5-3.4-3.4-9.5 7.8-11.5Z" />
            <circle cx="14.7" cy="48.1" r="2.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 64 64" fill="none">
            <path d="m27.3 7.8 1.2-4.3h7l1.2 4.3a25 25 0 0 1 5.5 2.3l3.9-2.2 5 5-2.3 3.9a25 25 0 0 1 2.3 5.5l4.4 1.2v7l-4.4 1.2a25 25 0 0 1-2.3 5.5l2.3 3.9-5 5-3.9-2.2a25 25 0 0 1-5.5 2.3l-1.2 4.3h-7l-1.2-4.3a25 25 0 0 1-5.5-2.3l-3.9 2.2-5-5 2.3-3.9a25 25 0 0 1-2.3-5.5l-4.4-1.2v-7l4.4-1.2a25 25 0 0 1 2.3-5.5l-2.3-3.9 5-5 3.9 2.2a25 25 0 0 1 5.5-2.3Z" />
            <circle cx="32" cy="27" r="8" />
          </svg>
        )}
      </div>

      <p className="error-codigo">ERROR {code}</p>
      <h1>{error.titulo}</h1>
      <p className="error-mensaje">{error.mensaje}</p>
      <p className="error-ayuda">{error.ayuda}</p>

      <div className="error-acciones">
        {code === 500 ? (
          <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
        ) : (
          <button className="btn btn-primary" type="button" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        )}
        <button className="btn" type="button" onClick={() => navigate('/')}>
          Ir al inicio
        </button>
      </div>
    </section>
  )
}
