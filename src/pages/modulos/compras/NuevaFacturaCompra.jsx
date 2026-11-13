import { useNavigate } from "react-router-dom";
import FacturaForm from "../../../components/factura/FacturaForm";
import { FACTURA_COMPRA } from "../../../components/factura/facturaConfig";
import useCargar from "../../../hooks/useCargar";
import { proveedores, registrarFacturaCompra } from "../../../services/comprasService";
import { productos } from "../../../services/inventarioService";

// Los catálogos llegan del gateway ya convertidos a la forma que usa FacturaForm.
async function cargarTerceros() {
  const lista = await proveedores.listarTodo({ sort: "nombre,asc" });
  return lista.map((p) => ({ id: p.id, etiqueta: p.etiqueta, claves: [p.ruc].filter(Boolean) }));
}

async function cargarProductosCompra() {
  const lista = await productos.listarTodo({ sort: "nombre,asc" });
  // En una compra el precio de lista es el costo
  return lista.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    precio: p.precioCompra,
  }));
}

export default function NuevaFacturaCompra() {
  const navigate = useNavigate();
  const terceros = useCargar(cargarTerceros);
  const catalogo = useCargar(cargarProductosCompra);

  async function nuevoProveedor(datos) {
    const creado = await proveedores.crear(datos); // lanza con userMessage si el RUC ya existe
    terceros.recargar();
    return { id: creado.id, etiqueta: creado.etiqueta };
  }

  async function confirmar(datos) {
    await registrarFacturaCompra(datos);
    navigate(FACTURA_COMPRA.rutaAlGuardar);
  }

  return (
    <FacturaForm
      config={FACTURA_COMPRA}
      terceros={terceros.datos}
      productos={catalogo.datos}
      cargando={terceros.cargando || catalogo.cargando}
      error={terceros.error || catalogo.error}
      onNuevoTercero={nuevoProveedor}
      onConfirmar={confirmar}
    />
  );
}
