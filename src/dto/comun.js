// Utilidades para armar DTO de envío: texto vacío -> null, número vacío -> null.
export const textoONull = (v) => {
  const t = String(v ?? '').trim()
  return t === '' ? null : t
}

export const numeroONull = (v) => (v === '' || v == null ? null : Number(v))
