import { Routes } from '@angular/router';

/**
 * Rutas de la aplicación. Cada módulo se carga de forma perezosa (lazy).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'citas' },
  {
    path: 'citas',
    title: 'Citas médicas',
    loadComponent: () => import('./features/citas/citas-lista').then((m) => m.CitasLista),
  },
  {
    path: 'historias',
    title: 'Historias clínicas',
    loadComponent: () => import('./features/historias/historias-lista').then((m) => m.HistoriasLista),
  },
  {
    path: 'formulas',
    title: 'Fórmulas médicas',
    loadComponent: () => import('./features/formulas/formulas-lista').then((m) => m.FormulasLista),
  },
  { path: 'inventario', title: 'Inventario', loadComponent: () => import('./features/inventario/inventario-page').then(m => m.InventarioPage) },
  { path: 'facturacion', title: 'Facturación', loadComponent: () => import('./features/facturacion/facturacion-page').then(m => m.FacturacionPage) },
  { path: '**', redirectTo: 'citas' },
];
