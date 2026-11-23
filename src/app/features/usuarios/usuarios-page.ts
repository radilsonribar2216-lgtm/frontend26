import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../core/api.config';
@Component({
 selector:'app-usuarios',standalone:true,imports:[FormsModule],
 template:`
 <section class="pagina"><h2>Administración de usuarios</h2>
 <form class="filtros" (ngSubmit)="crear()">
  <input name="nombre" [(ngModel)]="nuevo.nombre" placeholder="Nombre completo" required>
  <input name="email" [(ngModel)]="nuevo.email" type="email" placeholder="Correo" required>
  <input name="password" [(ngModel)]="nuevo.password" type="password" placeholder="Contraseña (mínimo 10 caracteres)" required>
  <select name="rol" [(ngModel)]="nuevo.rol"><option value="RECEPCION">Recepción</option><option value="MEDICO">Médico</option><option value="ADMINISTRADOR">Administrador</option></select>
  <input name="veterinarioId" [(ngModel)]="nuevo.veterinarioId" type="number" placeholder="ID veterinario (solo médico)">
  <button type="submit">Crear usuario</button>
 </form><p role="status">{{mensaje()}}</p>
 <table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead>
 <tbody>@for(u of usuarios();track u.id){<tr><td>{{u.nombre}}</td><td>{{u.email}}</td><td>{{u.rol}}</td><td>{{u.activo?'Activo':'Inactivo'}}</td><td><button type="button" (click)="estado(u,!u.activo)">{{u.activo?'Desactivar':'Activar'}}</button></td></tr>}</tbody></table>
 </section>`
})
export class UsuariosPage{
 private http=inject(HttpClient);usuarios=signal<any[]>([]);mensaje=signal('');
 nuevo:any={nombre:'',email:'',password:'',rol:'RECEPCION',veterinarioId:null};
 constructor(){this.cargar();}
 cargar(){this.http.get<any[]>(API_URL+'/auth/usuarios').subscribe({next:x=>this.usuarios.set(x),error:()=>this.mensaje.set('No se pudo cargar la lista de usuarios.')});}
 crear(){this.http.post(API_URL+'/auth/usuarios',this.nuevo).subscribe({next:()=>{this.mensaje.set('Usuario creado.');this.nuevo={nombre:'',email:'',password:'',rol:'RECEPCION',veterinarioId:null};this.cargar();},error:()=>this.mensaje.set('No se pudo crear. Revisa correo, contraseña y veterinario.')});}
 estado(u:any,activo:boolean){this.http.patch(API_URL+'/auth/usuarios/'+u.id+'/estado',{activo}).subscribe({next:()=>this.cargar(),error:()=>this.mensaje.set('No se pudo actualizar el usuario.')});}
}
