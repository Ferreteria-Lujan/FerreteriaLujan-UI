// DTOs de ms-ventas (commons): ClienteDTO (hereda PersonaDTO).
import { numeroONull, textoONull } from './comun'

export const fromClienteDTO = (c) => {
  const nombre = [c.nombre, c.apellido].filter(Boolean).join(' ')
  return {
    id: c.idPersona,
    nombre: c.nombre ?? '',
    apellido: c.apellido ?? null,
    ruc: c.ruc ?? null,
    ci: c.ci ?? null,
    telefono: c.telefono ?? null,
    correo: c.correo ?? null,
    direccion: c.direccion ?? null,
    limiteSaldo: c.limiteSaldo ?? null,
    saldoActual: c.saldoActual ?? 0,
    etiqueta: `${c.ruc || c.ci || 'S/D'} · ${nombre}`,
  }
}

export const toClienteDTO = (f) => ({
  nombre: textoONull(f.nombre),
  apellido: textoONull(f.apellido),
  ruc: textoONull(f.ruc),
  ci: textoONull(f.ci),
  telefono: textoONull(f.telefono),
  correo: textoONull(f.correo),
  direccion: textoONull(f.direccion),
  limiteSaldo: numeroONull(f.limiteSaldo),
  saldoActual: numeroONull(f.saldoActual) ?? 0,
})
