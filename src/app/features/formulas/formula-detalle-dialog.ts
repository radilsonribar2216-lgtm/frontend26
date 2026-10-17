import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormulaDetalle } from '../../models/api.models';
import { FormulaService } from '../../services/formula.service';

/**
 * Diálogo "Ver" de una fórmula: muestra todos sus campos (a diferencia del
 * listado, que solo presenta información resumida).
 */
@Component({
  selector: 'app-formula-detalle-dialog',
  imports: [DatePipe, MatDialogModule, MatButtonModule, MatProgressBarModule],
  template: `
    <h2 mat-dialog-title>Fórmula médica</h2>
    <mat-dialog-content>
      @if (formula(); as f) {
        <dl class="detalle">
          <div><dt>Mascota</dt><dd>{{ f.mascotaNombre }}</dd></div>
          <div><dt>Cliente</dt><dd>{{ f.clienteNombre }}</dd></div>
          <div><dt>Veterinario</dt><dd>{{ f.veterinarioNombre }}</dd></div>
          <div>
            <dt>Estado</dt>
            <dd>
              <span class="chip" [class]="'chip ' + (f.activo ? 'estado-activo' : 'estado-inactivo')">
                {{ f.activo ? 'Activa' : 'Inactiva' }}
              </span>
            </dd>
          </div>
          <div><dt>Consulta asociada</dt><dd>{{ f.fechaConsulta | date: 'dd/MM/yyyy HH:mm' }} · {{ f.motivoConsulta }}</dd></div>
          <div><dt>Fecha de emisión</dt><dd>{{ f.fechaEmision | date: 'dd/MM/yyyy HH:mm' }}</dd></div>
          <div class="completo"><dt>Medicamento</dt><dd>{{ f.medicamento }}</dd></div>
          <div><dt>Dosis</dt><dd>{{ f.dosisCantidad }} {{ f.dosisUnidad }}</dd></div>
          <div><dt>Frecuencia</dt><dd>{{ f.frecuencia }}</dd></div>
          <div><dt>Duración del tratamiento</dt><dd>{{ f.duracionDias }} días</dd></div>
          <div class="completo"><dt>Indicaciones</dt><dd>{{ f.indicaciones }}</dd></div>
          <div><dt>Creada</dt><dd>{{ f.createdAt | date: 'dd/MM/yyyy HH:mm' }}</dd></div>
          <div><dt>Última modificación</dt><dd>{{ f.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</dd></div>
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
export class FormulaDetalleDialog implements OnInit {
  /** Identificador de la fórmula a consultar. */
  private readonly formulaId = inject<number>(MAT_DIALOG_DATA);

  /** Servicio de fórmulas. */
  private readonly formulaService = inject(FormulaService);

  /** Fórmula cargada (null mientras carga). */
  protected readonly formula = signal<FormulaDetalle | null>(null);

  /**
   * Consulta el detalle de la fórmula al backend.
   */
  ngOnInit(): void {
    this.formulaService.consultar(this.formulaId).subscribe({ next: (f) => this.formula.set(f) });
  }
}
