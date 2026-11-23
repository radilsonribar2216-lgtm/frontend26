import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
  <section class="pagina">
    <header class="encabezado"><h2>Inventario</h2><button type="button" (click)="cargar()">Actualizar</button></header>
    <form class="filtros" (ngSubmit)="crear()">
      <input name="codigo" [(ngModel)]="nuevo.codigo" placeholder="Código" required>
      <input name="nombre" [(ngModel)]="nuevo.nombre" placeholder="Nombre del producto" required>
      <input name="categoria" [(ngModel)]="nuevo.categoria" placeholder="Categoría" required>
      <input name="precioVenta" [(ngModel)]="nuevo.precioVenta" type="number" min="0" step="0.01" placeholder="Precio" required>
      <input name="existenciaMinima" [(ngModel)]="nuevo.existenciaMinima" type="number" min="0" placeholder="Mínimo">
      <button type="submit">Crear producto</button>
    </form>
    <p>{{ mensaje() }}</p>
    <div class="tabla-contenedor"><table><thead><tr><th>ID</th><th>Código</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Existencia</th><th>Mínimo</th><th>Acción</th></tr></thead>
    <tbody>@for (p of productos(); track p.id) {<tr><td>{{p.id}}</td><td>{{p.codigo}}</td><td>{{p.nombre}}</td><td>{{p.categoria}}</td><td>{{p.precio_venta | currency:'COP':'symbol-narrow':'1.0-0'}}</td><td>{{p.existencia}}</td><td>{{p.existencia_minima}}</td><td><button type="button" (click)="seleccionar(p)">Lote / movimiento</button></td></tr>}</tbody></table></div>
    @if (seleccionado()) {
      <h3>{{seleccionado().nombre}} · Registrar lote o movimiento</h3>
      <form class="filtros" (ngSubmit)="registrarLote()">
        <input name="numeroLote" [(ngModel)]="lote.numeroLote" placeholder="Número de lote" required>
        <input name="registroInvima" [(ngModel)]="lote.registroInvima" placeholder="Registro INVIMA">
        <input name="fechaVencimiento" [(ngModel)]="lote.fechaVencimiento" type="date">
        <input name="cantidad" [(ngModel)]="lote.cantidad" type="number" min="1" placeholder="Cantidad" required>
        <input name="costoUnitario" [(ngModel)]="lote.costoUnitario" type="number" min="0" placeholder="Costo unitario">
        <button type="submit">Ingresar lote</button>
      </form>
      <form class="filtros" (ngSubmit)="movimiento()">
        <select name="tipo" [(ngModel)]="mov.tipo"><option value="ENTRADA">Entrada</option><option value="SALIDA">Salida</option></select>
        <input name="loteId" [(ngModel)]="mov.loteId" type="number" min="1" placeholder="ID del lote" required>\n        <input name="cantidad" [(ngModel)]="mov.cantidad" type="number" min="1" placeholder="Cantidad" required>
        <input name="motivo" [(ngModel)]="mov.motivo" placeholder="Motivo" required>
        <button type="submit">Guardar movimiento</button>
      </form>
    }
  </section>`,
})
export class InventarioPage {
  private http = inject(HttpClient);
  productos = signal<any[]>([]);
  mensaje = signal('');
  seleccionado = signal<any>(null);
  nuevo:any = {codigo:'',nombre:'',categoria:'MEDICAMENTO',precioVenta:0,existenciaMinima:0};
  lote:any = {numeroLote:'',registroInvima:'',fechaVencimiento:'',cantidad:1,costoUnitario:0};
  mov:any = {tipo:'SALIDA',loteId:null,cantidad:1,motivo:''};
  private base = 'http://localhost:8080/clinica/v1/inventario';
  constructor(){ this.cargar(); }
  cargar(){this.http.get<any[]>(this.base+'/productos').subscribe({next:x=>this.productos.set(x),error:()=>this.mensaje.set('No se pudo cargar el inventario. Verifique el servidor y la base de datos.')});}
  crear(){this.http.post(this.base+'/productos',this.nuevo).subscribe({next:()=>{this.mensaje.set('Producto creado.');this.nuevo={codigo:'',nombre:'',categoria:'MEDICAMENTO',precioVenta:0,existenciaMinima:0};this.cargar();},error:()=>this.mensaje.set('No se pudo crear el producto. Revise que el código no esté repetido.')});}
  seleccionar(p:any){this.seleccionado.set(p);this.lote={numeroLote:'',registroInvima:'',fechaVencimiento:'',cantidad:1,costoUnitario:0};}
  registrarLote(){this.http.post(this.base+'/lotes',{...this.lote,productoId:this.seleccionado().id}).subscribe({next:()=>{this.mensaje.set('Lote ingresado y existencias actualizadas.');this.cargar();},error:()=>this.mensaje.set('No se pudo registrar el lote.')});}
  movimiento(){this.http.post(this.base+'/movimientos',{...this.mov,productoId:this.seleccionado().id}).subscribe({next:()=>{this.mensaje.set('Movimiento registrado.');this.cargar();},error:()=>this.mensaje.set('Movimiento rechazado. Verifique las existencias disponibles.')});}
}
