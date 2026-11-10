# Ferretería Lujan – UI

React + Vite. Rutas: `/login` → `/` (Main) → `/compras`, `/ventas`, `/inventario`, `/reportes` (vacías por ahora).

```
npm install
npm run dev     # http://localhost:5173
```

Login: sin sesión iniciada solo se puede entrar a `/login`. En `.env.development`, `VITE_AUTH_MODE=local` valida contra `VITE_DEV_USER` / `VITE_DEV_PASS` (por defecto `admin` / `1234`). Cuando ms-seguridad esté listo, cambialo a `backend`.

## Backend (Compras)

Facturas de compra y proveedores ya leen y escriben en ms-compras a través del gateway (`/api/facturas-compras`, `/api/proveedores`, ...); la UI nunca se conecta a Supabase directamente. Pedidos sigue con datos de prueba (el backend no tiene pedidos).
Contrato esperado, configuración de Supabase en el backend y cómo está armada la factura reutilizable: [`docs/CONEXION_BACKEND.md`](docs/CONEXION_BACKEND.md).
