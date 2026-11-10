# Conexión de Compras con el backend (ms-compras + Supabase)

## Arquitectura

```
React (esta UI) ──/api──▶ api-gateway ──▶ ms-compras ──JDBC──▶ Supabase (Postgres)
```

- **React nunca habla con Supabase.** Solo llama a `/api/...` (axios, `src/api/cliente.js`). Quien se conecta a
  Supabase es ms-compras por JDBC; ya lo tiene configurado en `application.properties` + `local.properties`
  (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PSWD`: los mismos que ms-inventario). No usar `supabase-js` ni la `anon key`
  en el frontend: se saltaría el JWT, los roles y el gateway.
- El front pide `/api/facturas-compras`, `/api/proveedores`, `/api/detalles-compras` y `/api/productos`.
  Vite reenvía `/api` a `VITE_API_TARGET` (`.env.development`, por defecto el gateway en `:8080`).
  Para probar ms-compras directo: `VITE_API_TARGET=http://localhost:8083`.

## Para probar contra el backend real

1. **Login real:** en `.env.development` poné `VITE_AUTH_MODE=backend`. Con `local` el token es el texto `local`,
   ms-compras responde 401 y la UI vuelve al login. (Confirmar en `src/api/auth.js` la URL y los campos de `/auth/login`.)
2. **Levantar** ms-seguridad, ms-inventario (para `/api/productos`), ms-compras y el gateway (o apuntar directo a `:8083`).
3. `npm install && npm run dev`.

## Contrato que usa el front (todo en `src/api/compras.js` y `src/api/inventario.js`)

JSON en camelCase (DTO de commons). Las listas son `Page` de Spring (`{ content: [...] }`); el front pide `size=100`
(máximo del backend) y pagina en pantalla. **Con más de 100 registros faltaría paginar de verdad** (`?page=`) o usar `/search`.

| Método | Path | Uso |
|---|---|---|
| GET | `/api/facturas-compras?size=100&sort=idFacturaCompra,desc` | lista de facturas (solo activas) |
| POST | `/api/facturas-compras` | paso 1 del alta: `{ idProveedor, nroFactura, timbrado, fechaEmision, fechaVencimiento }` |
| POST | `/api/detalles-compras` | paso 2: una vez por línea `{ idFacturaCompra, idProducto, cantidad, precioUnitario, porcentajeIva }` |
| DELETE | `/api/facturas-compras/{id}` | baja lógica (rol ADMIN); se usa para deshacer si falla una línea |
| GET | `/api/proveedores?size=100&sort=nombre,asc` | lista de proveedores (ProveedorDTO) |
| POST | `/api/proveedores` | `{ nombre, ruc, telefono, correo, direccion }`; 409 si el RUC existe |
| GET | `/api/productos?size=100&sort=nombre,asc` | catálogo (ms-inventario; `precioCompra` es el costo) |

Cómo se arma una compra (`crearFacturaCompra`): la factura se crea con importe 0, luego se envía **cada línea en
orden** (no en paralelo: cada alta recalcula el total). El servidor calcula `montoIva`, `subtotal` e `importeTotal`;
lo que envíe el cliente se ignora. No hay transacción entre los dos pasos: si una línea falla, la UI intenta anular la
factura y, si no puede (no es ADMIN), avisa que quedó incompleta.

Errores: el mensaje de `ApiErrorDTO.message` se muestra en pantalla (409 por proveedor/RUC o factura duplicada,
400 por validaciones, etc.).

## Cosas que el backend NO tiene (y cómo quedó la UI)

| Falta | Qué hace la UI hoy | Para resolverlo |
|---|---|---|
| **Pedidos**: no hay entidad `Pedido` en commons ni controller | `Pedidos.jsx` sigue con datos de prueba | Crear entidad/tabla/endpoints (commons "no se modifica": decidir dónde) |
| **Estado de pago** de las facturas (y endpoint de estados) | La columna muestra **Condición**: con fecha de vencimiento = Crédito, sin ella = Contado | Agregar pagos/estado a la factura |
| **Depósito / stock**: `FacturaCompra` no guarda depósito y ms-compras no llama a ms-inventario | El formulario de compra **no** pide depósito; **registrar una compra no suma stock** | ms-compras llama a ms-inventario al crear los detalles, o el front hace el ingreso |
| **Crédito/contado**: no hay campo `esCredito` | Se deduce de `fechaVencimiento` (null = contado) | — |
| **Ciudad** en proveedor/cliente: `PersonaDTO` no la tiene | El modal de proveedor no muestra Ciudad | — |
| **Nombre del proveedor** en la factura: el DTO trae solo `idProveedor` | La lista cruza con `/api/proveedores` | Agregar el nombre al DTO si se quiere evitar el cruce |

## IVA

ms-compras usa `app.compras.iva.incluido-en-precio=true`: el costo **ya incluye** el IVA, `IVA = total × p / (100 + p)`
(10% por defecto; acepta 0, 5, 10). `FACTURA_COMPRA.ivaIncluido = true` replica eso en pantalla; si cambiás
`COMPRAS_IVA_INCLUIDO` en el backend, cambiá también ese valor. La UI envía siempre 10%; no maneja productos exentos o al 5%.

## Cómo está armada la factura reutilizable

- `components/factura/facturaConfig.js` — `FACTURA_COMPRA` y `FACTURA_VENTA`: textos, si se piden nro/timbrado/condición,
  costo editable o precio fijo, validación de stock, depósito (o ninguno), IVA incluido o aparte, columnas de la lista, rutas.
- `components/factura/FacturaForm.jsx` — el formulario (una sola implementación).
- `components/factura/FacturaLista.jsx` — el listado (una sola implementación).
- Compras: `NuevaFacturaCompra.jsx` y `FacturasCompras.jsx` (conectadas).
- Ventas: `VentaDirecta.jsx` y `Facturas.jsx` usan los mismos componentes con `FACTURA_VENTA` (siguen con datos de prueba).
