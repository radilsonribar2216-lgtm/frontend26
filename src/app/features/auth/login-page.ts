import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
 selector:'app-login',standalone:true,imports:[FormsModule],
 template:`
 <section class="pagina login"><h2>Ingreso a Clínica Veterinaria</h2>
 <form (ngSubmit)="entrar()">
  <label>Correo electrónico<input type="email" name="email" [(ngModel)]="email" required></label>
  <label>Contraseña<input type="password" name="password" [(ngModel)]="password" required></label>
  <button type="submit" [disabled]="cargando()">Ingresar</button>
 </form><p role="alert">{{mensaje()}}</p></section>`
})
export class LoginPage{
 private auth=inject(AuthService);private router=inject(Router);
 email='';password='';mensaje=signal('');cargando=signal(false);
 entrar(){this.cargando.set(true);this.auth.login(this.email,this.password).subscribe({
  next:()=>{this.cargando.set(false);this.router.navigate(['/citas']);},
  error:()=>{this.cargando.set(false);this.mensaje.set('No fue posible iniciar sesión. Verifica correo y contraseña.');}
 });}
}
