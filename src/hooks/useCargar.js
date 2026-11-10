import { useCallback, useEffect, useState } from 'react'

// Carga datos del backend al montar la pantalla.
//   const { datos, cargando, error, recargar } = useCargar(listarFacturasCompra)
// `datos` arranca en `inicial` (por defecto []), así la pantalla puede dibujarse sin if.
export default function useCargar(fn, inicial = []) {
  const [estado, setEstado] = useState({ datos: inicial, cargando: true, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let vigente = true   // si la pantalla se cierra antes de que llegue la respuesta, se ignora
    fn()
      .then((datos) => { if (vigente) setEstado({ datos, cargando: false, error: null }) })
      .catch((err) => {
        if (vigente) setEstado((s) => ({ ...s, cargando: false, error: err.userMessage || err.message }))
      })
    return () => { vigente = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fn es una función de api/*.js (estable)
  }, [version])

  const recargar = useCallback(() => {
    setEstado((s) => ({ ...s, cargando: true, error: null }))
    setVersion((v) => v + 1)
  }, [])

  return { ...estado, recargar }
}
