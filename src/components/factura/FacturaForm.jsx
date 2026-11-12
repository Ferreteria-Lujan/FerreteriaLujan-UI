import { useState } from 'react'
import { IconSearch, IconChevronDown } from '../Icons'
import BuscadorSugerencias from '../BuscadorSugerencias'
import ModalNuevoCliente from '../../pages/modulos/ventas/ModalNuevoCliente'
import { gs, hoyISO, hoyLargo } from './facturaConfig'

// Formulario de factura reutilizable (compra y venta).
// No conoce el backend ni los nombres de las tablas: recibe datos ya normalizados y,
// al confirmar, entrega un objeto neutro a `onConfirmar` (cada página lo traduce a su API).
//
// Props
//   config        FACTURA_COMPRA | FACTURA_VENTA (ver facturaConfig.js)
//   terceros      [{ id, etiqueta, claves: [ruc, ci] }]      proveedores o clientes
//   productos     [{ id, codigo, nombre, precio }]           precio = costo (compra) o precio de venta
//   depositos     [{ id, nombre }]                           solo si config.deposito
//   stockDe       (idDeposito, idProducto) => number         solo si config.validaStock
//   cargando      true mientras llegan los catálogos
//   error         mensaje si fallaron los catálogos
//   onNuevoTercero(datos) => Promise<tercero>|tercero        si falta, se oculta el botón "+ Nuevo ..."
//   onConfirmar(datos) => Promise                            si lanza, se muestra el error y se puede reintentar
//
// `datos` que recibe onConfirmar:
//   { idTercero, idDeposito (null si la config no usa depósito), porcentajeIva, items: [{ id_producto, cantidad, precio_unitario }],
//     subtotal (sin IVA), iva, total, nro, timbrado, fechaEmision, esCredito, fechaVencimiento }

const etiquetaProducto = (p) => `${p.codigo} · ${p.nombre}`

export default function FacturaForm({
  config, terceros = [], productos = [], depositos = [], stockDe,
  cargando = false, error = null, onNuevoTercero, onConfirmar,
}) {
  const [busquedaTercero, setBusquedaTercero] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [depositoId, setDepositoId] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [precioManual, setPrecioManual] = useState(null)
  const [items, setItems] = useState([])
  const [doc, setDoc] = useState({ nro: '', timbrado: '', fechaEmision: hoyISO(), esCredito: false, fechaVencimiento: '' })
  const [modal, setModal] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState(null)

  const t = config.tercero
  // Depósito: solo si la config lo usa (la venta descuenta de uno; la compra no, ms-compras no maneja stock)
  const deposito = config.deposito ? (depositos.find((d) => d.id === depositoId) ?? depositos[0]) : null

  // El tercero se puede escribir (RUC o CI exactos) o elegir de la lista
  const q = busquedaTercero.trim()
  const tercero = terceros.find((x) => x.etiqueta === busquedaTercero || (q !== '' && x.claves?.includes(q)))
  const producto = productos.find((p) =>
    etiquetaProducto(p) === busqueda || p.codigo.toLowerCase() === busqueda.trim().toLowerCase())

  // Precio de la línea: el de lista, o el que escribió la persona si la config lo permite
  const precioUnit = config.precioEditable ? (precioManual ?? producto?.precio ?? 0) : (producto?.precio ?? 0)

  // Stock (solo ventas): lo ya agregado a la factura se descuenta de lo disponible
  const stock = config.validaStock && producto && deposito && stockDe ? stockDe(deposito.id, producto.id) : null
  const yaAgregado = items.filter((i) => i.id_producto === producto?.id).reduce((s, i) => s + i.cantidad, 0)
  const disponible = stock === null ? null : Math.max(0, stock - yaAgregado)
  const sinStock = disponible !== null && cantidad > disponible

  // IVA incluido en el precio (compra): total = suma de líneas e IVA = total * p / (100 + p).
  // IVA aparte (venta): IVA = suma * p y se agrega al total.
  const pct = Math.round(config.iva * 100)
  const sumaLineas = items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0)
  const iva = Math.round(config.ivaIncluido ? sumaLineas * pct / (100 + pct) : sumaLineas * config.iva)
  const total = config.ivaIncluido ? sumaLineas : sumaLineas + iva
  const subtotal = total - iva   // base sin IVA

  // Validación de los datos del documento (solo si la config los pide)
  const errorDoc = !config.datosDocumento ? null
    : !doc.nro.trim() ? 'Ingresá el número de factura'
    : !doc.timbrado.trim() ? 'Ingresá el timbrado'
    : !doc.fechaEmision ? 'Ingresá la fecha de emisión'
    : doc.esCredito && !doc.fechaVencimiento ? 'Ingresá la fecha de vencimiento'
    : doc.esCredito && doc.fechaVencimiento < doc.fechaEmision ? 'El vencimiento no puede ser anterior a la emisión'
    : null

  const puedeConfirmar = !!tercero && (!config.deposito || !!deposito) && items.length > 0 && !errorDoc && !guardando

  function agregar() {
    if (!producto || sinStock || precioUnit <= 0) return
    setItems((prev) => {
      // Misma línea (producto + precio) => suma cantidad; distinto precio => línea nueva
      const existe = prev.some((i) => i.id_producto === producto.id && i.precio_unitario === precioUnit)
      return existe
        ? prev.map((i) => (i.id_producto === producto.id && i.precio_unitario === precioUnit)
            ? { ...i, cantidad: i.cantidad + cantidad } : i)
        : [...prev, {
            id_producto: producto.id, codigo: producto.codigo, nombre: producto.nombre,
            precio_unitario: precioUnit, cantidad,
          }]
    })
    setBusqueda('')
    setCantidad(1)
    setPrecioManual(null)
  }

  const quitar = (it) =>
    setItems((prev) => prev.filter((x) => !(x.id_producto === it.id_producto && x.precio_unitario === it.precio_unitario)))

  async function guardarTercero(datos) {
    const nuevo = await onNuevoTercero(datos)   // si lanza, el modal muestra el error y queda abierto
    if (nuevo) setBusquedaTercero(nuevo.etiqueta)   // queda seleccionado en la factura
    setModal(false)
  }

  async function confirmar() {
    setErrorEnvio(null)
    setGuardando(true)
    try {
      await onConfirmar({
        idTercero: tercero.id,
        idDeposito: deposito?.id ?? null,
        porcentajeIva: pct,
        items: items.map(({ id_producto, cantidad, precio_unitario }) => ({ id_producto, cantidad, precio_unitario })),
        subtotal, iva, total,
        nro: doc.nro.trim(),
        timbrado: doc.timbrado.trim(),
        fechaEmision: doc.fechaEmision,
        esCredito: doc.esCredito,
        fechaVencimiento: doc.esCredito ? doc.fechaVencimiento : null,
      })
    } catch (err) {
      setErrorEnvio(err.userMessage || err.message || 'No se pudo guardar la factura')
      setGuardando(false)
    }
  }

  const opcionesTerceros = terceros.map((x) => ({ key: x.id, label: x.etiqueta }))
  const opcionesProductos = productos.map((p) => ({ key: p.id, label: etiquetaProducto(p) }))

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">{config.titulo}</h1>

      {(error || errorEnvio) && <p className="aviso-error" role="alert">{error || errorEnvio}</p>}

      <div className="venta-grid">
        {/* Columna izquierda */}
        <div className="form-paneles">
          {/* 1. Tercero (+ datos del documento si corresponde) */}
          <div className="panel-form">
            <div className="panel-titulo">{t.panel}</div>
            <div className="panel-cuerpo columna-campos">
              <div className="fila-campos abajo">
                <div className="campo crece">
                  <label htmlFor="tercero">{t.label}</label>
                  <BuscadorSugerencias
                    id="tercero"
                    value={busquedaTercero}
                    onChange={setBusquedaTercero}
                    opciones={opcionesTerceros}
                    placeholder={t.placeholder}
                    disabled={cargando}
                    icono={<IconSearch />} />
                </div>
                {onNuevoTercero && (
                  <button type="button" className="btn-agregar" onClick={() => setModal(true)}>{t.botonNuevo}</button>
                )}
              </div>

              {config.datosDocumento && (
                <div className="fila-campos abajo">
                  <div className="campo crece">
                    <label htmlFor="doc-nro">Nro. factura *</label>
                    <div className="campo-caja">
                      <input id="doc-nro" placeholder="001-001-0000000" value={doc.nro}
                             onChange={(e) => setDoc({ ...doc, nro: e.target.value })} />
                    </div>
                  </div>
                  <div className="campo" style={{ width: 130 }}>
                    <label htmlFor="doc-timbrado">Timbrado *</label>
                    <div className="campo-caja">
                      <input id="doc-timbrado" inputMode="numeric" placeholder="12345678" value={doc.timbrado}
                             onChange={(e) => setDoc({ ...doc, timbrado: e.target.value })} />
                    </div>
                  </div>
                  <div className="campo" style={{ width: 150 }}>
                    <label htmlFor="doc-emision">Emisión *</label>
                    <div className="campo-caja">
                      <input id="doc-emision" type="date" value={doc.fechaEmision}
                             onChange={(e) => setDoc({ ...doc, fechaEmision: e.target.value })} />
                    </div>
                  </div>
                  <div className="campo" style={{ width: 120 }}>
                    <label htmlFor="doc-condicion">Condición</label>
                    <div className="campo-caja select-caja">
                      <select id="doc-condicion" value={doc.esCredito ? 'credito' : 'contado'}
                              onChange={(e) => setDoc({ ...doc, esCredito: e.target.value === 'credito' })}>
                        <option value="contado">Contado</option>
                        <option value="credito">Crédito</option>
                      </select>
                      <IconChevronDown />
                    </div>
                  </div>
                  {doc.esCredito && (
                    <div className="campo" style={{ width: 150 }}>
                      <label htmlFor="doc-venc">Vencimiento *</label>
                      <div className="campo-caja">
                        <input id="doc-venc" type="date" min={doc.fechaEmision} value={doc.fechaVencimiento}
                               onChange={(e) => setDoc({ ...doc, fechaVencimiento: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. Agregar producto */}
          <div className="panel-form">
            <div className="panel-titulo">Agregar Producto</div>
            <div className="panel-cuerpo fila-campos abajo">
              <div className="campo crece">
                <label htmlFor="producto">Buscar producto</label>
                <BuscadorSugerencias
                  id="producto"
                  value={busqueda}
                  onChange={(v) => { setBusqueda(v); setPrecioManual(null) }}
                  opciones={opcionesProductos}
                  placeholder="Buscar por nombre o código..."
                  disabled={cargando}
                  icono={<IconSearch />} />
              </div>

              {config.deposito && (
                <div className="campo" style={{ width: 170 }}>
                  <label htmlFor="deposito">{config.deposito.label}</label>
                  <div className="campo-caja select-caja">
                    {/* Con productos cargados el depósito queda fijo: la factura afecta a un solo depósito */}
                    <select id="deposito" value={deposito?.id ?? ''} disabled={items.length > 0 || cargando}
                            onChange={(e) => setDepositoId(Number(e.target.value))}>
                      {depositos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                    <IconChevronDown />
                  </div>
                </div>
              )}

              {config.precioEditable && (
                <div className="campo" style={{ width: 140 }}>
                  <label htmlFor="precio">{config.precioLabel}</label>
                  <div className="campo-caja">
                    <input id="precio" type="number" min="0" step="any" disabled={!producto}
                           value={producto ? precioUnit : ''}
                           onChange={(e) => setPrecioManual(Math.max(0, Number(e.target.value) || 0))} />
                  </div>
                </div>
              )}

              <div className="campo" style={{ width: 130 }}>
                <label htmlFor="cantidad">Cantidad</label>
                <div className="stepper">
                  <button type="button" aria-label="Menos" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
                  <input id="cantidad" type="number" min="1" value={cantidad}
                         onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value, 10) || 1))} />
                  <button type="button" aria-label="Más" className="mas" onClick={() => setCantidad((c) => c + 1)}>+</button>
                </div>
              </div>

              <button type="button" className="btn-agregar" disabled={!producto || sinStock || precioUnit <= 0} onClick={agregar}>
                + Agregar
              </button>
            </div>
            {sinStock && (
              <p className="campo-error">Stock insuficiente en {deposito.nombre} (disponible: {disponible})</p>
            )}
          </div>

          {/* 3. Productos de la factura */}
          <div className="panel-form crece">
            <div className="panel-titulo">{config.itemsPanel}</div>
            <div className="items-cabecera">
              <span>Código</span><span>Producto</span><span>Cant.</span><span>{config.precioLabel}</span><span>Subtotal</span><span />
            </div>
            <div className="panel-cuerpo items-cuerpo">
              {items.length === 0 && <p className="items-vacio">No hay productos seleccionados...</p>}
              {items.map((i) => (
                <div className="items-fila" key={`${i.id_producto}-${i.precio_unitario}`}>
                  <span className="c-nro">{i.codigo}</span>
                  <span>{i.nombre}</span>
                  <span>{i.cantidad}</span>
                  <span>{gs(i.precio_unitario)}</span>
                  <span className="c-total">{gs(i.precio_unitario * i.cantidad)}</span>
                  <button type="button" className="btn-quitar" aria-label={`Quitar ${i.nombre}`} onClick={() => quitar(i)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <aside className="venta-lateral">
          <div className="panel-form">
            <div className="panel-titulo">Resumen</div>
            <div className="panel-cuerpo resumen">
              <div className="resumen-fila"><span>Fecha:</span>
                <strong>{config.datosDocumento && doc.fechaEmision ? doc.fechaEmision.split('-').reverse().join('/') : hoyLargo()}</strong>
              </div>
              <div className="resumen-fila"><span>Subtotal:</span><strong>{gs(subtotal)}</strong></div>
              <div className="resumen-fila"><span>IVA ({pct}%){config.ivaIncluido ? ' incl.' : ''}:</span><strong>{gs(iva)}</strong></div>
              <div className="resumen-fila total"><span>Total:</span><strong>{gs(total)}</strong></div>
            </div>
            <div className="resumen-pie">
              <button type="button" className="btn-agregar btn-confirmar" disabled={!puedeConfirmar} onClick={confirmar}>
                {guardando ? 'Guardando...' : config.confirmar}
              </button>
              {errorDoc && items.length > 0 && !!tercero && <p className="resumen-aviso">{errorDoc}</p>}
            </div>
          </div>

          {config.deposito && (
            <div className="panel-form">
              <div className="panel-titulo">{config.deposito.panel}</div>
              <div className="panel-cuerpo deposito-info">
                <span>{deposito?.nombre ?? (cargando ? 'Cargando...' : '—')}</span>
                <small>{config.deposito.nota}</small>
                {config.validaStock && producto && <small>{producto.codigo}: {disponible} unidades</small>}
              </div>
            </div>
          )}
        </aside>
      </div>

      {modal && (
        <ModalNuevoCliente
          titulo={t.modalTitulo}
          ocultar={t.ocultarCampos}
          onCerrar={() => setModal(false)}
          onGuardar={guardarTercero} />
      )}
    </section>
  )
}
