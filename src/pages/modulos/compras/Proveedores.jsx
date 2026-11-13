import { useMemo, useState } from "react";
import { IconSearch } from "../../../components/Icons";
import Paginacion from "../../../components/Paginacion";
import FormModal from "../../../components/FormModal";
import { campoUnico } from "../../../components/formModalConfigs";
import useCargar from "../../../hooks/useCargar";
import { proveedores as servicio } from "../../../services/comprasService";

const POR_PAGINA = 10;

// Campos que existen en PersonaDTO / ProveedorDTO del backend
const configNuevo = {
  title: "Nuevo Proveedor",
  cancelLabel: "Cancelar",
  fields: [
    {
      name: "nombre",
      label: "Nombre / Razón social",
      placeholder: "Nombre del proveedor",
      required: true,
    },
    { name: "ruc", label: "RUC", placeholder: "80000000-0", required: true, half: true },
    { name: "telefono", label: "Teléfono", type: "tel", placeholder: "021-000-0000", half: true },
    {
      name: "correo",
      label: "Email",
      type: "email",
      placeholder: "correo@empresa.com",
      half: true,
    },
    {
      name: "direccion",
      label: "Dirección",
      type: "textarea",
      rows: 2,
      placeholder: "Dirección completa",
    },
  ],
};

const codigo = (id) => "PROV-" + String(id).padStart(3, "0");

export default function Proveedores() {
  const { datos, cargando, error, recargar } = useCargar(() =>
    servicio.listarTodo({ sort: "nombre,asc" }),
  );
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return datos.filter(
      (p) => !q || [p.nombreCompleto, p.ruc].some((c) => (c ?? "").toLowerCase().includes(q)),
    );
  }, [datos, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const actual = Math.min(pagina, totalPaginas);
  const inicio = (actual - 1) * POR_PAGINA;
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);

  const cfg = campoUnico(
    configNuevo,
    "ruc",
    datos,
    (p) => p.ruc,
    "Ya existe un proveedor con ese RUC",
  );

  async function guardar(form) {
    await servicio.crear(form); // lanza con userMessage (409 si el servidor detecta duplicado)
    setModalAbierto(false);
    recargar();
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Proveedores</h1>

      <div className="filtros">
        <button type="button" className="btn-agregar" onClick={() => setModalAbierto(true)}>
          + Nuevo Proveedor
        </button>
        <label className="campo-caja buscador">
          <IconSearch />
          <input
            type="search"
            placeholder="Buscar por empresa o RUC..."
            aria-label="Buscar proveedores"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
        </label>
      </div>

      <div className="tabla-ventas tabla-proveedores">
        <div className="fila cabecera">
          <span>#</span>
          <span>Código</span>
          <span>Empresa</span>
          <span>Teléfono</span>
          <span>Correo</span>
          <span>RUC</span>
        </div>

        {!cargando &&
          !error &&
          visibles.map((p, i) => (
            <div className="fila fila-dato" key={p.id}>
              <span className="c-num">{String(inicio + i + 1).padStart(2, "0")}</span>
              <span className="c-nro">{codigo(p.id)}</span>
              <span>{p.nombreCompleto}</span>
              <span className="c-fecha">{p.telefono ?? "—"}</span>
              <span>{p.correo ?? "—"}</span>
              <span className="c-fecha">{p.ruc ?? "—"}</span>
            </div>
          ))}

        {cargando && <p className="sin-resultados">Cargando proveedores...</p>}
        {!cargando && error && (
          <p className="sin-resultados error-lista">
            {error}{" "}
            <button type="button" className="link-reintentar" onClick={recargar}>
              Reintentar
            </button>
          </p>
        )}
        {!cargando && !error && visibles.length === 0 && (
          <p className="sin-resultados">No se encontraron proveedores</p>
        )}

        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>

      <FormModal
        open={modalAbierto}
        {...cfg}
        onClose={() => setModalAbierto(false)}
        onSubmit={guardar}
      />
    </section>
  );
}
