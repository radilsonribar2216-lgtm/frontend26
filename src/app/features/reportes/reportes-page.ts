import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
 selector:'app-reportes',standalone:true,imports:[FormsModule],
 template:`
 <section class="pagina">
  <h2>Reportes administrativos y financieros</h2>
  <p>Selecciona el tipo de informe y, para facturación, el rango de fechas.</p>
  <div class="panel">
   <h3>Inventario</h3>
   <label><input type="checkbox" name="bajoMinimo" [(ngModel)]="bajoMinimo"> Solo productos con existencias bajas</label>
   <div class="acciones">
    <button type="button" (click)="descargar('inventario','pdf')">Descargar PDF</button>
    <button type="button" (click)="descargar('inventario','xlsx')">Descargar Excel</button>
   </div>
  </div>
  <div class="panel">
   <h3>Facturación</h3>
   <div class="filtros">
    <label>Desde <input type="date" name="desde" [(ngModel)]="desde" required></label>
    <label>Hasta <input type="date" name="hasta" [(ngModel)]="hasta" required></label>
   </div>
   <div class="acciones">
    <button type="button" [disabled]="!rangoValido()" (click)="descargar('facturacion','pdf')">Descargar PDF</button>
    <button type="button" [disabled]="!rangoValido()" (click)="descargar('facturacion','xlsx')">Descargar Excel</button>
   </div>
  </div>
  <p role="status">{{mensaje()}}</p>
 </section>`
})
export class ReportesPage {
 private http=inject(HttpClient);
 private base='http://localhost:8080/clinica/v1/reportes';
 bajoMinimo=false; desde=''; hasta=''; mensaje=signal('');
 rangoValido(){return !!this.desde && !!this.hasta && this.desde<=this.hasta;}
 descargar(tipo:'inventario'|'facturacion',formato:'pdf'|'xlsx'){
  if(tipo==='facturacion'&&!this.rangoValido())return;
  const params:any={};
  if(tipo==='inventario')params.bajoMinimo=String(this.bajoMinimo);
  else {params.desde=this.desde;params.hasta=this.hasta;}
  this.http.get(this.base+'/'+tipo+'.'+formato,{params,responseType:'blob'}).subscribe({
   next:blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=tipo+'.'+formato;a.click();URL.revokeObjectURL(url);this.mensaje.set('Reporte descargado.');},
   error:()=>this.mensaje.set('No se pudo generar el reporte. Verifica que el servidor esté disponible.')
  });
 }
}
