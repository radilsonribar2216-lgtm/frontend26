import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
 selector:'app-facturacion', standalone:true, imports:[FormsModule,CurrencyPipe,DatePipe],
 template:`
 <section class="pagina">
  <header class="encabezado"><h2>Facturación</h2><button type="button" (click)="cargar()">Actualizar</button></header>
  <form class="filtros" (ngSubmit)="crear()">
   <input name="clienteId" [(ngModel)]="nueva.clienteId" type="number" min="1" placeholder="ID del cliente" required>
   <input name="mascotaId" [(ngModel)]="nueva.mascotaId" type="number" min="1" placeholder="ID mascota (opcional)">
   <input name="concepto" [(ngModel)]="linea.concepto" placeholder="Concepto del servicio/producto" required>\n   <input name="productoId" [(ngModel)]="linea.productoId" type="number" min="1" placeholder="ID producto (opcional; descuenta stock)">
   <input name="cantidad" [(ngModel)]="linea.cantidad" type="number" min="0.01" step="0.01" placeholder="Cantidad" required>
   <input name="precio" [(ngModel)]="linea.precioUnitario" type="number" min="0" step="0.01" placeholder="Precio unitario" required>
   <input name="descuento" [(ngModel)]="nueva.descuento" type="number" min="0" placeholder="Descuento total">
   <input name="impuesto" [(ngModel)]="nueva.impuesto" type="number" min="0" placeholder="Impuesto">
   <button type="submit">Crear prefactura</button>
  </form>
  <p>{{mensaje()}}</p>
  <div class="tabla-contenedor"><table><thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
   <tbody>@for(f of facturas();track f.id){<tr><td>{{f.numero}}</td><td>{{f.clienteNombre}}</td><td>{{f.fecha_emision | date:'short'}}</td><td>{{f.total | currency:'COP':'symbol-narrow':'1.0-0'}}</td><td>{{f.estado}}</td><td>
   @if(f.estado==='PREFactura'){<button type="button" (click)="emitir(f.id)">Emitir</button>}
   @if(f.estado==='EMITIDA'){<button type="button" (click)="seleccionar(f)">Registrar pago</button>}
   <button type="button" (click)="ver(f.id)">Detalle</button></td></tr>}</tbody></table></div>
  @if(pagoFactura()){<h3>Registrar pago para {{pagoFactura().numero}}</h3><form class="filtros" (ngSubmit)="pagar()">
   <input name="valor" [(ngModel)]="pago.valor" type="number" min="1" step="0.01" placeholder="Valor" required>
   <select name="medioPago" [(ngModel)]="pago.medioPago"><option>EFECTIVO</option><option>TRANSFERENCIA</option><option>TARJETA</option><option>OTRO</option></select>
   <input name="referencia" [(ngModel)]="pago.referencia" placeholder="Referencia">
   <button type="submit">Guardar pago</button></form>}
  @if(detalle()){<h3>Detalle {{detalle().numero}}</h3><p>Cliente: {{detalle().clienteNombre}} · Total: {{detalle().total | currency:'COP':'symbol-narrow':'1.0-0'}} · Pagado: {{detalle().totalPagado | currency:'COP':'symbol-narrow':'1.0-0'}}</p>
   <ul>@for(d of detalle().detalles;track d.id){<li>{{d.concepto}} — {{d.cantidad}} × {{d.precio_unitario | currency:'COP':'symbol-narrow':'1.0-0'}} = {{d.total_linea | currency:'COP':'symbol-narrow':'1.0-0'}}</li>}</ul>}
 </section>`
})
export class FacturacionPage {
 private http=inject(HttpClient); private base='http://localhost:8080/clinica/v1/facturacion';
 facturas=signal<any[]>([]); mensaje=signal(''); detalle=signal<any>(null); pagoFactura=signal<any>(null);
 nueva:any={clienteId:null,mascotaId:null,descuento:0,impuesto:0}; linea:any={concepto:'',cantidad:1,precioUnitario:0};
 pago:any={valor:0,medioPago:'EFECTIVO',referencia:''};
 constructor(){this.cargar();}
 cargar(){this.http.get<any[]>(this.base+'/facturas').subscribe({next:x=>this.facturas.set(x),error:()=>this.mensaje.set('No se pudieron cargar las facturas.')});}
 crear(){this.http.post(this.base+'/facturas',{...this.nueva,detalles:[this.linea]}).subscribe({next:()=>{this.mensaje.set('Prefactura creada.');this.cargar();this.nueva={clienteId:null,mascotaId:null,descuento:0,impuesto:0};this.linea={concepto:'',cantidad:1,precioUnitario:0};},error:()=>this.mensaje.set('No se pudo crear la prefactura. Verifique el cliente y los valores.')});}
 emitir(id:number){this.http.post(this.base+'/facturas/'+id+'/emitir',{}).subscribe({next:()=>{this.mensaje.set('Factura emitida.');this.cargar();},error:()=>this.mensaje.set('No se pudo emitir la factura.')});}
 seleccionar(f:any){this.pagoFactura.set(f);this.pago={valor:0,medioPago:'EFECTIVO',referencia:''};}
 pagar(){const f=this.pagoFactura();this.http.post(this.base+'/facturas/'+f.id+'/pagos',this.pago).subscribe({next:()=>{this.mensaje.set('Pago registrado.');this.pagoFactura.set(null);this.cargar();this.ver(f.id);},error:()=>this.mensaje.set('Pago rechazado. Revise el saldo pendiente.')});}
 ver(id:number){this.http.get<any>(this.base+'/facturas/'+id).subscribe({next:x=>this.detalle.set(x),error:()=>this.mensaje.set('No se pudo consultar el detalle.')});}
}
