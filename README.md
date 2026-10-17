# Frontend - Clínica veterinaria (Angular 22 + Angular Material)

## Ejecutar
```bash
npm install     # solo la primera vez
npm start       # abre http://localhost:4200
```
El backend debe estar corriendo en `http://localhost:8080/clinica/v1`
(si usa otro host o puerto, cambie `src/app/core/api.config.ts`).

## Otros comandos
```bash
npm run build               # compilación de producción (carpeta dist/)
npx ng test --watch=false   # pruebas unitarias (19)
```

## Estructura (`src/app`)
| Carpeta | Contenido |
|---|---|
| `features/citas`, `features/historias`, `features/formulas` | Pantallas: listados (DataTable), formularios y detalles |
| `services` | Consumo de la API REST y notificaciones |
| `models` | Interfaces TypeScript de los DTOs |
| `core` | Configuración de la API, interceptor de errores, clase base de listados, combos dependientes |
| `shared` | Componentes reutilizables (diálogo de confirmación) |
| `utils` | Funciones auxiliares de formato y HTTP |
