import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const lineaVacia = () => ({ codigo: "", descripcion: "", cantidad: 1, precioUnitario: 0 });

export default function ModalNuevoPedido({
  proveedores = [],
  productos = [],
  onCerrar,
  onGuardar,
}) {
  const [proveedorId, setProveedorId] = useState(proveedores[0]?.id ?? "");
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState([lineaVacia()]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cerrar = (event) => event.key === "Escape" && onCerrar();
    document.addEventListener("keydown", cerrar);
    return () => document.removeEventListener("keydown", cerrar);
  }, [onCerrar]);

  const total = items.reduce(
    (suma, item) => suma + Number(item.cantidad || 0) * Number(item.precioUnitario || 0),
    0,
  );
  const valido =
    proveedorId &&
    items.length > 0 &&
    items.every(
      (item) =>
        item.idProducto &&
        item.codigo.trim() &&
        item.descripcion.trim() &&
        Number(item.cantidad) > 0 &&
        Number(item.precioUnitario) >= 0,
    );

  function cambiarItem(indice, campo, valor) {
    setItems((actuales) =>
      actuales.map((item, i) => {
        if (i !== indice) return item;
        if (campo !== "codigo") return { ...item, [campo]: valor };
        const producto = productos.find(
          (p) => p.codigo.toLowerCase() === valor.trim().toLowerCase(),
        );
        return producto
          ? {
              ...item,
              idProducto: producto.id,
              codigo: producto.codigo,
              descripcion: producto.nombre,
              precioUnitario: producto.precioCompra ?? 0,
            }
          : { ...item, idProducto: null, codigo: valor };
      }),
    );
  }

  async function guardar() {
    if (!valido || guardando) return;
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        proveedorId: Number(proveedorId),
        observaciones: observaciones.trim(),
        items: items.map((item) => ({
          ...item,
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precioUnitario),
        })),
        total,
      });
      onCerrar();
    } catch (err) {
      setError(err.userMessage || err.message || "No se pudo guardar el pedido");
      setGuardando(false);
    }
  }

  return createPortal(
    <div
      className="fm-overlay pedido-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        className="fm-modal pedido-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nuevo-pedido-titulo"
      >
        <div className="fm-header">
          <h2 id="nuevo-pedido-titulo" className="fm-title">
            Nuevo Pedido
          </h2>
          <button type="button" className="fm-close" aria-label="Cerrar" onClick={onCerrar}>
            ✕
          </button>
        </div>
        <div className="fm-body">
          <label className="pedido-campo">
            <span>Proveedor</span>
            <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombreCompleto}
                </option>
              ))}
            </select>
          </label>
          <label className="pedido-campo">
            <span>Observaciones</span>
            <input
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas opcionales..."
            />
          </label>

          <div className="pedido-items">
            <div className="pedido-items-titulo">
              <span>Ítems del Pedido</span>
              <button
                type="button"
                onClick={() => setItems((actuales) => [...actuales, lineaVacia()])}
              >
                + Agregar ítem
              </button>
            </div>
            <div className="pedido-item-cabecera">
              <span>Código</span>
              <span>Descripción</span>
              <span>Cant.</span>
              <span>Precio Gs.</span>
              <span />
            </div>
            {items.map((item, indice) => (
              <div className="pedido-item-fila" key={indice}>
                <input
                  aria-label={`Código del ítem ${indice + 1}`}
                  value={item.codigo}
                  list="productos-pedido"
                  onChange={(e) => cambiarItem(indice, "codigo", e.target.value)}
                  placeholder="Código"
                />
                <input
                  aria-label={`Descripción del ítem ${indice + 1}`}
                  value={item.descripcion}
                  onChange={(e) => cambiarItem(indice, "descripcion", e.target.value)}
                  placeholder="Descripción"
                />
                <input
                  aria-label={`Cantidad del ítem ${indice + 1}`}
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => cambiarItem(indice, "cantidad", e.target.value)}
                />
                <input
                  aria-label={`Precio del ítem ${indice + 1}`}
                  type="number"
                  min="0"
                  value={item.precioUnitario}
                  onChange={(e) => cambiarItem(indice, "precioUnitario", e.target.value)}
                />
                <button
                  type="button"
                  className="pedido-quitar"
                  aria-label={`Quitar ítem ${indice + 1}`}
                  disabled={items.length === 1}
                  onClick={() => setItems((actuales) => actuales.filter((_, i) => i !== indice))}
                >
                  ✕
                </button>
              </div>
            ))}
            <datalist id="productos-pedido">
              {productos.map((producto) => (
                <option key={producto.id} value={producto.codigo}>
                  {producto.nombre}
                </option>
              ))}
            </datalist>
            <div className="pedido-total">
              Total: <strong>{total.toLocaleString("es-PY")} Gs.</strong>
            </div>
          </div>

          {error && (
            <p className="fm-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="fm-actions">
            <button type="button" className="fm-btn fm-btn--secondary" onClick={onCerrar}>
              Cancelar
            </button>
            <button
              type="button"
              className="fm-btn fm-btn--primary"
              disabled={!valido || guardando}
              onClick={guardar}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
