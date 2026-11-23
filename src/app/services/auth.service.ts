import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_URL } from '../core/api.config';

export interface UsuarioSesion { id:number; nombre:string; email:string; rol:'ADMINISTRADOR'|'RECEPCION'|'MEDICO'; }
@Injectable({providedIn:'root'})
export class AuthService {
 private key='clinica_token';
 usuario=signal<UsuarioSesion|null>(this.readUser());
 token(){return sessionStorage.getItem(this.key);}
 login(email:string,password:string){
  return this.http.post<any>(API_URL+'/auth/login',{email,password}).pipe(tap(r=>{
   sessionStorage.setItem(this.key,r.token);sessionStorage.setItem('clinica_user',JSON.stringify(r.usuario));this.usuario.set(r.usuario);
  }));
 }
 logout(){return this.http.post(API_URL+'/auth/logout',{}).pipe(tap(()=>this.clear()),);}
 clear(){sessionStorage.removeItem(this.key);sessionStorage.removeItem('clinica_user');this.usuario.set(null);}
 private readUser():UsuarioSesion|null {try{return JSON.parse(sessionStorage.getItem('clinica_user')||'null');}catch{return null;}}
 constructor(private http:HttpClient){}
}
