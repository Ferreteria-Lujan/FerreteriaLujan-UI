import { IconChevronLeft, IconChevronRight } from "./Icons";

// Barra de paginación (usa las clases .paginacion / .pag-btn de theme.css)
export default function Paginacion({ pagina, totalPaginas, onCambiar }) {
  const todas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const visibles =
    totalPaginas <= 7
      ? todas
      : todas.filter((n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1);
  const elementos = [];
  visibles.forEach((n, indice) => {
    if (indice > 0 && n - visibles[indice - 1] > 1) elementos.push(`ellipsis-${n}`);
    elementos.push(n);
  });

  return (
    <nav className="paginacion" aria-label="Paginación">
      <button
        className="pag-btn flecha"
        disabled={pagina === 1}
        onClick={() => onCambiar(pagina - 1)}
        aria-label="Anterior"
      >
        <IconChevronLeft />
      </button>
      {elementos.map((elemento) =>
        typeof elemento === "number" ? (
          <button
            key={elemento}
            className={"pag-btn" + (elemento === pagina ? " activa" : "")}
            aria-current={elemento === pagina ? "page" : undefined}
            onClick={() => onCambiar(elemento)}
          >
            {elemento}
          </button>
        ) : (
          <span className="pag-ellipsis" key={elemento}>
            …
          </span>
        ),
      )}
      <button
        className="pag-btn flecha"
        disabled={pagina === totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
        aria-label="Siguiente"
      >
        <IconChevronRight />
      </button>
    </nav>
  );
}
