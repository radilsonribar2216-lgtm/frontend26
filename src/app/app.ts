import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
 selector:'app-root',
 imports:[RouterOutlet,RouterLink,RouterLinkActive,MatToolbarModule,MatButtonModule],
 templateUrl:'./app.html',
 styleUrl:'./app.scss',
})
export class App {
 private auth=inject(AuthService);private router=inject(Router);
 usuario=this.auth.usuario;
 enlaces=computed(()=>{
  const rol=this.usuario()?.rol;
  const base=[{ruta:'/citas',texto:'Citas'}];
  if(rol==='ADMINISTRADOR'||rol==='MEDICO')base.push({ruta:'/historias',texto:'Historias clínicas'},{ruta:'/formulas',texto:'Fórmulas médicas'});
  if(rol==='ADMINISTRADOR'||rol==='RECEPCION')base.push({ruta:'/inventario',texto:'Inventario'},{ruta:'/facturacion',texto:'Facturación'},{ruta:'/reportes',texto:'Reportes'});
  if(rol==='ADMINISTRADOR')base.push({ruta:'/usuarios',texto:'Usuarios'});
  return base;
 });
 salir(){this.auth.logout().subscribe({next:()=>{this.auth.clear();this.router.navigate(['/login']);},error:()=>{this.auth.clear();this.router.navigate(['/login']);}});}
}
