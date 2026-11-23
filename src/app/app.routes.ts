import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

/**
 * Rutas de la aplicación. Cada módulo se carga de forma perezosa (lazy).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'citas' },
  { path: 'login', title: 'Iniciar sesión', loadComponent: () => import('./features/auth/login-page').then(m => m.LoginPage) },
  {
    path: 'citas', canActivate: [authGuard],
    title: 'Citas médicas',
    loadComponent: () => import('./features/citas/citas-lista').then((m) => m.CitasLista),
  },
  {
    path: 'historias', canActivate: [authGuard],
    title: 'Historias clínicas',
    loadComponent: () => import('./features/historias/historias-lista').then((m) => m.HistoriasLista),
  },
  {
    path: 'formulas', canActivate: [authGuard],
    title: 'Fórmulas médicas',
    loadComponent: () => import('./features/formulas/formulas-lista').then((m) => m.FormulasLista),
  },
  { path: 'usuarios', title: 'Usuarios', canActivate: [authGuard], loadComponent: () => import('./features/usuarios/usuarios-page').then(m => m.UsuariosPage) },
  { path: 'inventario', title: 'Inventario', canActivate: [authGuard], loadComponent: () => import('./features/inventario/inventario-page').then(m => m.InventarioPage) },
  { path: 'facturacion', title: 'Facturación', canActivate: [authGuard], loadComponent: () => import('./features/facturacion/facturacion-page').then(m => m.FacturacionPage) },
  { path: 'reportes', title: 'Reportes', canActivate: [authGuard], loadComponent: () => import('./features/reportes/reportes-page').then(m => m.ReportesPage) },
  { path: '**', redirectTo: 'citas' },
];
