import { useMemo, useState } from 'react'
import { IconSearch } from '../../../components/Icons'
import Paginacion from '../../../components/Paginacion'
import FormModal from '../../../components/FormModal'
import { proveedorModalConfig, campoUnico, vaciosANull } from '../../../components/formModalConfigs'

// TODO: reemplazar por los datos del backend (ms-compras)
const PROVEEDORES = [
  { codigo: 'PROV-001', nombreEmpresa: 'Distribuidora Acero Total', contacto: 'Marcos Giménez', telefono: '021-555-0101', email: 'ventas@aceretotal.com.py', ruc: '80011122-3', direccion: null },
  { codigo: 'PROV-002', nombreEmpresa: 'Ferrecon S.A.',             contacto: 'Laura Benítez',  telefono: '021-555-0102', email: 'contacto@ferrecon.com.py', ruc: '80022233-4', direccion: null },
  { codigo: 'PROV-003', nombreEmpresa: 'Pinturas del Sur',          contacto: 'Raúl Ortiz',     telefono: '021-555-0103', email: 'pedidos@pinturassur.com.py', ruc: '80033344-5', direccion: null },
  { codigo: 'PROV-004', nombreEmpresa: 'ElectroPro SRL',            contacto: 'Ana Duarte',     telefono: '021-555-0104', email: 'info@electropro.com.py', ruc: '80044455-6', direccion: null },
]
const POR_PAGINA = 10

export default function Proveedores() {
  const [proveedores, setProveedores] = useState(PROVEEDORES)   // TODO: cargar desde el backend
  const [modalAbierto, setModalAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return proveedores.filter((p) =>
      !q || [p.codigo, p.nombreEmpresa, p.contacto, p.ruc].some((c) => (c ?? '').toLowerCase().includes(q)))
  }, [proveedores, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  const siguienteCodigo = 'PROV-' + String(proveedores.length + 1).padStart(3, '0')
  // el código y el RUC no pueden repetirse
  const cfg = campoUnico(
    campoUnico(proveedorModalConfig, 'codigo', proveedores, (p) => p.codigo, 'Ya existe un proveedor con ese código'),
    'ruc', proveedores, (p) => p.ruc, 'Ya existe un proveedor con ese RUC')

  async function guardarProveedor(form) {
    // TODO: POST a ms-compras
    const nuevo = vaciosANull(form)
    setProveedores((prev) => [nuevo, ...prev])
    setPagina(1)
    setModalAbierto(false)
  }

  return (
    <section className="ventas-page">
      <h1 className="ventas-titulo">Proveedores</h1>

      <div className="filtros">
        <button type="button" className="btn-agregar" onClick={() => setModalAbierto(true)}>+ Nuevo Proveedor</button>
        <label className="campo-caja buscador">
          <IconSearch />
          <input type="search" placeholder="Buscar por código, empresa o RUC..." aria-label="Buscar proveedores"
                 value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }} />
        </label>
      </div>

      <div className="tabla-ventas tabla-proveedores">
        <div className="fila cabecera">
          <span>#</span><span>Código</span><span>Empresa</span><span>Contacto</span>
          <span>Teléfono</span><span>RUC</span>
        </div>

        {visibles.map((p, i) => (
          <div className="fila fila-dato" key={p.codigo}>
            <span className="c-num">{String(inicio + i + 1).padStart(2, '0')}</span>
            <span className="c-nro">{p.codigo}</span>
            <span>{p.nombreEmpresa}</span>
            <span>{p.contacto ?? '—'}</span>
            <span className="c-fecha">{p.telefono ?? '—'}</span>
            <span className="c-fecha">{p.ruc}</span>
          </div>
        ))}
        {visibles.length === 0 && <p className="sin-resultados">No se encontraron proveedores</p>}

        <div className="espacio" />
        <Paginacion pagina={actual} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>

      <FormModal
        open={modalAbierto}
        {...cfg}
        initialValues={{ codigo: siguienteCodigo }}
        onClose={() => setModalAbierto(false)}
        onSubmit={guardarProveedor} />
    </section>
  )
}
