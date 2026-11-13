import { useMemo, useState } from "react";
import { IconPlusCircle, IconSearch, IconChevronDown, IconEye } from "../../../components/Icons";
import Paginacion from "../../../components/Paginacion";
import useCargar from "../../../hooks/useCargar";
import {
  crearPedido,
  listarPedidos,
  proveedores,
  actualizarPedido,
} from "../../../services/comprasService";
import ModalNuevoPedido from "./ModalNuevoPedido";
import SeguimientoPedido from "./SeguimientoPedido";
import { fechaCorta, gs } from "../../../components/factura/facturaConfig";
import { productos } from "../../../services/inventarioService";

const ESTADOS = ["En espera", "Recibido"];
const ESTADO_CLASE = {
  "En espera": "estado-espera",
  "En proceso": "estado-proceso",
  Recibido: "estado-recibido",
};
const POR_PAGINA = 10;

const ORDENES = {
  defecto: { label: "Por defecto", fn: null },
  fecha: {
    label: "Emisión (reciente)",
    fn: (a, b) => b.fechaEmision.localeCompare(a.fechaEmision),
  },
  total: { label: "Total (mayor)", fn: (a, b) => b.total - a.total },
  proveedor: {
    label: "Proveedor (A-Z)",
    fn: (a, b) => a.proveedor.localeCompare(b.proveedor, "es"),
  },
};

async function cargarProveedores() {
  return proveedores.listarTodo({ sort: "nombre,asc" });
}

async function cargarProductos() {
  return productos.listarTodo({ sort: "nombre,asc" });
}

export default function Pedidos() {
  const carga = useCargar(listarPedidos);
  const cargaProveedores = useCargar(cargarProveedores);
  const cargaProductos = useCargar(cargarProductos);
  const [pedidosLocales, setPedidosLocales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("defecto");
  const [pagina, setPagina] = useState(1);
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  const pedidos = useMemo(() => {
    const remotos = carga.datos ?? [];
    return [
      ...pedidosLocales,
      ...remotos.filter((p) => !pedidosLocales.some((local) => local.id === p.id)),
    ];
  }, [carga.datos, pedidosLocales]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = pedidos.filter(
      (p) => !q || [p.nro, p.proveedor, p.estado].some((campo) => campo?.toLowerCase().includes(q)),
    );
    const fn = ORDENES[orden].fn;
    return fn ? [...lista].sort(fn) : lista;
  }, [pedidos, busqueda, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const actual = Math.min(pagina, totalPaginas);
  const inicio = (actual - 1) * POR_PAGINA;
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);
  const errorCatalogos = cargaProveedores.error || cargaProductos.error;
  const cargandoCatalogos = cargaProveedores.cargando || cargaProductos.cargando;

  async function cambiarEstado(pedido, estado) {
    const cambios = {
      estado,
      fechaRecepcion:
        estado === "Recibido"
          ? pedido.fechaRecepcion || new Date().toLocaleDateString("en-CA")
          : null,
      pagado: estado === "Recibido" ? true : pedido.pagado,
    };
    setPedidosLocales((prev) => [
      { ...pedido, ...cambios },
      ...prev.filter((p) => p.id !== pedido.id),
    ]);
    setErrorAccion(null);
    try {
      await actualizarPedido(pedido, cambios);
      carga.recargar();
    } catch (error) {
      setPedidosLocales((prev) => prev.filter((p) => p.id !== pedido.id));
      setErrorAccion(error.userMessage || error.message || "No se pudo actualizar el pedido");
    }
  }

  async function guardarPedido(datos) {
    const proveedor = cargaProveedores.datos.find((p) => p.id === datos.proveedorId);
    const creado = await crearPedido(datos, proveedor);
    setPedidosLocales((prev) => [creado, ...prev]);
    setPagina(1);
  }

  async function marcarPagado(pedido) {
    if (pedido.pagado) return;
    const cambios = { pagado: true };
    setPedidosLocales((prev) => [
      { ...pedido, ...cambios },
      ...prev.filter((p) => p.id !== pedido.id),
    ]);
    setErrorAccion(null);
    try {
      await actualizarPedido(pedido, cambios);
      carga.recargar();
    } catch (error) {
      setPedidosLocales((prev) => prev.filter((p) => p.id !== pedido.id));
      setErrorAccion(error.userMessage || error.message || "No se pudo registrar el pago");
    }
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Pedidos</h1>
      <div className="barra-herramientas">
        <button
          className="btn-nuevo"
          type="button"
          disabled={cargandoCatalogos || !!errorCatalogos}
          onClick={() => setNuevoAbierto(true)}
        >
          <IconPlusCircle /> Nuevo Pedido
        </button>
        <form className="caja-busqueda" role="search" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            placeholder="Buscar..."
            aria-label="Buscar pedidos"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
          <button type="submit" aria-label="Buscar">
            <IconSearch />
          </button>
        </form>
        <label className="ordenar">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value);
              setPagina(1);
            }}
          >
            {Object.entries(ORDENES).map(([clave, opcion]) => (
              <option key={clave} value={clave}>
                {opcion.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {errorAccion && (
        <p className="aviso-error" role="alert">
          {errorAccion}
        </p>
      )}
      {errorCatalogos && (
        <p className="aviso-error" role="alert">
          No se pudieron cargar proveedores o productos: {errorCatalogos}{" "}
          <button
            type="button"
            className="link-reintentar"
            onClick={() => {
              cargaProveedores.recargar();
              cargaProductos.recargar();
            }}
          >
            Reintentar
          </button>
        </p>
      )}

      <div className="tabla-ventas tabla-pedidos">
        <div className="fila cabecera">
          <span>#</span>
          <span>Nro. pedido</span>
          <span>Proveedor</span>
          <span>Emisión</span>
          <span>Recepción</span>
          <span>Total</span>
          <span>Pagado</span>
          <span>Estado</span>
          <span />
        </div>
        {visibles.map((pedido, indice) => (
          <div className="fila fila-dato" key={pedido.id ?? pedido.nro}>
            <span className="c-num">{String(inicio + indice + 1).padStart(2, "0")}</span>
            <span className="c-nro">{pedido.nro}</span>
            <span>{pedido.proveedor}</span>
            <span className="c-fecha">{fechaCorta(pedido.fechaEmision)}</span>
            <span className="c-fecha">{fechaCorta(pedido.fechaRecepcion)}</span>
            <span className="c-total">{gs(pedido.total)}</span>
            <span className="c-pagado">
              <button
                type="button"
                className={"badge-pago " + (pedido.pagado ? "pago-si" : "pago-no")}
                disabled={pedido.pagado}
                title={pedido.pagado ? "Pedido pagado" : "Marcar como pagado"}
                onClick={() => marcarPagado(pedido)}
              >
                <i />
                {pedido.pagado ? "Sí" : "No"}
              </button>
            </span>
            <label className={"estado-select " + ESTADO_CLASE[pedido.estado]}>
              <select
                value={pedido.estado}
                aria-label={`Estado de ${pedido.nro}`}
                onChange={(e) => cambiarEstado(pedido, e.target.value)}
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              <IconChevronDown />
            </label>
            <button
              className="btn-ver"
              aria-label={`Ver detalle de ${pedido.nro}`}
              title="Ver detalle y seguimiento"
              onClick={() => setDetalle(pedido)}
            >
              <IconEye />
            </button>
          </div>
        ))}
        {carga.cargando && <p className="sin-resultados">Cargando pedidos...</p>}
        {!carga.cargando && carga.error && (
          <p className="sin-resultados error-lista">
            {carga.error}{" "}
            <button type="button" className="link-reintentar" onClick={carga.recargar}>
              Reintentar
            </button>
          </p>
        )}
        {!carga.cargando && !carga.error && visibles.length === 0 && (
          <p className="sin-resultados">No se encontraron pedidos</p>
        )}
        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>

      {nuevoAbierto && (
        <ModalNuevoPedido
          proveedores={cargaProveedores.datos}
          productos={cargaProductos.datos}
          onCerrar={() => setNuevoAbierto(false)}
          onGuardar={guardarPedido}
        />
      )}
      {detalle && <SeguimientoPedido pedido={detalle} onCerrar={() => setDetalle(null)} />}
    </section>
  );
}
