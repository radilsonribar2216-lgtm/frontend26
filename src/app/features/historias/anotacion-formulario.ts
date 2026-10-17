import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Veterinario } from '../../models/api.models';
import { CatalogoService } from '../../services/catalogo.service';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { NotificacionService } from '../../services/notificacion.service';

/**
 * Formulario (en diálogo) para agregar una anotación a una historia clínica
 * existente. Si no se indica fecha y hora, el backend usa el momento actual.
 */
@Component({
  selector: 'app-anotacion-formulario',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva anotación</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        @if (guardando()) {
          <mat-progress-bar mode="indeterminate" />
        }
        <div class="formulario">
          <mat-form-field appearance="outline">
            <mat-label>Veterinario</mat-label>
            <mat-select formControlName="veterinarioId">
              @for (v of veterinarios(); track v.id) {
                <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
              }
            </mat-select>
            <mat-error>Seleccione un veterinario.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha y hora</mat-label>
            <input matInput type="datetime-local" formControlName="fechaHora" />
            <mat-hint>Opcional: si se deja vacío se usa la actual.</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Descripción</mat-label>
            <textarea matInput rows="3" formControlName="descripcion"></textarea>
            <mat-error>La descripción es obligatoria.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Observación</mat-label>
            <textarea matInput rows="2" formControlName="observacion"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Diagnóstico o evolución</mat-label>
            <textarea matInput rows="3" formControlName="diagnosticoEvolucion"></textarea>
            <mat-error>El diagnóstico o evolución es obligatorio.</mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="false">Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="guardando()">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class AnotacionFormulario implements OnInit {
  /** Identificador de la historia a la que se agrega la anotación. */
  private readonly historiaId = inject<number>(MAT_DIALOG_DATA);

  /** Referencia al diálogo para cerrarlo. */
  private readonly dialogRef = inject(MatDialogRef<AnotacionFormulario>);

  /** Constructor de formularios. */
  private readonly fb = inject(FormBuilder);

  /** Servicio de catálogos. */
  private readonly catalogo = inject(CatalogoService);

  /** Servicio de historias clínicas. */
  private readonly historiaService = inject(HistoriaClinicaService);

  /** Servicio de notificaciones. */
  private readonly notificaciones = inject(NotificacionService);

  /** Indica si se está enviando el formulario. */
  protected readonly guardando = signal(false);

  /** Veterinarios para el combo. */
  protected readonly veterinarios = signal<Veterinario[]>([]);

  /** Formulario reactivo de la anotación. */
  protected readonly form = this.fb.group({
    veterinarioId: this.fb.control<number | null>(null, Validators.required),
    fechaHora: this.fb.nonNullable.control(''),
    descripcion: this.fb.nonNullable.control('', Validators.required),
    observacion: this.fb.nonNullable.control(''),
    diagnosticoEvolucion: this.fb.nonNullable.control('', Validators.required),
  });

  /**
   * Carga los veterinarios del combo.
   */
  ngOnInit(): void {
    this.catalogo.listarVeterinarios().subscribe({ next: (lista) => this.veterinarios.set(lista) });
  }

  /**
   * Valida el formulario y envía la anotación al backend.
   */
  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.historiaService
      .crearAnotacion(this.historiaId, {
        veterinarioId: v.veterinarioId!,
        fechaHora: v.fechaHora || undefined,
        descripcion: v.descripcion.trim(),
        observacion: v.observacion.trim() || undefined,
        diagnosticoEvolucion: v.diagnosticoEvolucion.trim(),
      })
      .subscribe({
        next: () => {
          this.notificaciones.exito('Anotación agregada correctamente.');
          this.dialogRef.close(true);
        },
        error: () => this.guardando.set(false),
      });
  }
}
