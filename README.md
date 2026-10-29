# Ferretería Lujan – UI

React + Vite. Rutas: `/login` → `/` (Main) → `/compras`, `/ventas`, `/inventario`, `/reportes` (vacías por ahora).

```
npm install
npm run dev     # http://localhost:5173
```

Login: sin sesión iniciada solo se puede entrar a `/login`. En `.env.development`, `VITE_AUTH_MODE=local` valida contra `VITE_DEV_USER` / `VITE_DEV_PASS` (por defecto `admin` / `1234`). Cuando ms-seguridad esté listo, cambialo a `backend`.
