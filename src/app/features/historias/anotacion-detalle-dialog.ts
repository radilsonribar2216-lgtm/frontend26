import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Anotacion } from '../../models/api.models';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';

/** Datos que recibe el diálogo de detalle de una anotación. */
export interface AnotacionDetalleDatos {
  /** Historia desde la que se consulta. */
  historiaId: number;
  /** Anotación a consultar. */
  anotacionId: number;
}

/**
 * Diálogo que muestra el detalle completo de una anotación, consultándola
 * al backend por su identificador.
 */
@Component({
  selector: 'app-anotacion-detalle-dialog',
  imports: [DatePipe, MatDialogModule, MatButtonModule, MatProgressBarModule],
  template: `
    <h2 mat-dialog-title>Detalle de la anotación</h2>
    <mat-dialog-content>
      @if (anotacion(); as a) {
        <dl class="detalle">
          <div><dt>Fecha y hora</dt><dd>{{ a.fechaHora | date: 'dd/MM/yyyy HH:mm' }}</dd></div>
          <div><dt>Veterinario</dt><dd>{{ a.veterinarioNombre }}</dd></div>
          <div class="completo"><dt>Descripción</dt><dd>{{ a.descripcion }}</dd></div>
          <div class="completo"><dt>Observación</dt><dd>{{ a.observacion || '—' }}</dd></div>
          <div class="completo"><dt>Diagnóstico o evolución</dt><dd>{{ a.diagnosticoEvolucion }}</dd></div>
        </dl>
      } @else {
        <mat-progress-bar mode="indeterminate" />
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class AnotacionDetalleDialog implements OnInit {
  /** Identificadores recibidos al abrir el diálogo. */
  private readonly datos = inject<AnotacionDetalleDatos>(MAT_DIALOG_DATA);

  /** Servicio de historias clínicas. */
  private readonly historiaService = inject(HistoriaClinicaService);

  /** Anotación cargada (null mientras carga). */
  protected readonly anotacion = signal<Anotacion | null>(null);

  /**
   * Consulta la anotación al backend.
   */
  ngOnInit(): void {
    this.historiaService
      .consultarAnotacion(this.datos.historiaId, this.datos.anotacionId)
      .subscribe({ next: (a) => this.anotacion.set(a) });
  }
}
