import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { crearCombosClienteMascota } from '../../core/combos-dependientes';
import { Cita, EstadoCita, Veterinario } from '../../models/api.models';
import { CatalogoService } from '../../services/catalogo.service';
import { CitaService } from '../../services/cita.service';
import { NotificacionService } from '../../services/notificacion.service';
import { etiquetaEstadoCita, horaCorta, hoyISO } from '../../utils/formato.utils';

/**
 * Formulario (en diálogo) para crear o editar una cita.
 * En creación usa los combos dependientes Cliente → Mascota del cliente.
 * En edición el cliente y la mascota no se pueden cambiar.
 * Las reglas críticas (cruces de horario, fechas pasadas) las valida el backend.
 */
@Component({
  selector: 'app-cita-formulario',
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
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar cita' : 'Nueva cita' }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        @if (guardando()) {
          <mat-progress-bar mode="indeterminate" />
        }

        @if (esEdicion) {
          <div class="resumen-fijo">
            <strong>{{ datos!.clienteNombre }}</strong> · Mascota: {{ datos!.mascotaNombre }}
          </div>
        }

        <div class="formulario">
          @if (!esEdicion) {
            <mat-form-field appearance="outline">
              <mat-label>Cliente</mat-label>
              <mat-select formControlName="clienteId">
                @for (c of combos.clientes(); track c.id) {
                  <mat-option [value]="c.id">{{ c.nombreCompleto }}</mat-option>
                }
              </mat-select>
              <mat-error>Seleccione un cliente.</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mascota</mat-label>
              <mat-select formControlName="mascotaId">
                @for (m of combos.mascotas(); track m.id) {
                  <mat-option [value]="m.id">{{ m.nombre }} ({{ m.especie }})</mat-option>
                }
              </mat-select>
              <mat-hint>Solo se listan las mascotas del cliente.</mat-hint>
              <mat-error>Seleccione una mascota.</mat-error>
            </mat-form-field>
          }

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Veterinario</mat-label>
            <mat-select formControlName="veterinarioId">
              @for (v of veterinarios(); track v.id) {
                <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
              }
            </mat-select>
            <mat-error>Seleccione un veterinario.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha</mat-label>
            <input matInput type="date" formControlName="fecha" [min]="hoy" />
            <mat-error>La fecha es obligatoria.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora</mat-label>
            <input matInput type="time" formControlName="hora" />
            <mat-error>La hora es obligatoria.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Motivo de la consulta</mat-label>
            <textarea matInput rows="2" formControlName="motivo" maxlength="255"></textarea>
            <mat-error>El motivo es obligatorio.</mat-error>
          </mat-form-field>

          @if (!esEdicion) {
            <mat-form-field appearance="outline" class="completo">
              <mat-label>Estado inicial</mat-label>
              <mat-select formControlName="estado">
                @for (e of estadosIniciales; track e) {
                  <mat-option [value]="e">{{ etiqueta(e) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="false">Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="guardando()">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class CitaFormulario implements OnInit {
  /** Cita a editar, o null cuando se está creando. */
  protected readonly datos = inject<Cita | null>(MAT_DIALOG_DATA);

  /** Indica si el formulario está en modo edición. */
  protected readonly esEdicion = this.datos !== null;

  /** Referencia al diálogo para cerrarlo. */
  private readonly dialogRef = inject(MatDialogRef<CitaFormulario>);

  /** Constructor de formularios. */
  private readonly fb = inject(FormBuilder);

  /** Servicio de catálogos. */
  private readonly catalogo = inject(CatalogoService);

  /** Servicio de citas. */
  private readonly citaService = inject(CitaService);

  /** Servicio de notificaciones. */
  private readonly notificaciones = inject(NotificacionService);

  /** Referencia para cancelar suscripciones. */
  private readonly destroyRef = inject(DestroyRef);

  /** Fecha mínima seleccionable (hoy). */
  protected readonly hoy = hoyISO();

  /** Estados con los que se permite crear una cita. */
  protected readonly estadosIniciales: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'PROGRAMADA'];

  /** Etiqueta legible de un estado (expuesta a la plantilla). */
  protected readonly etiqueta = etiquetaEstadoCita;

  /** Indica si se está enviando el formulario. */
  protected readonly guardando = signal(false);

  /** Veterinarios para el combo. */
  protected readonly veterinarios = signal<Veterinario[]>([]);

  /** Formulario reactivo de la cita. */
  protected readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    mascotaId: this.fb.control<number | null>(null, Validators.required),
    veterinarioId: this.fb.control<number | null>(null, Validators.required),
    fecha: this.fb.nonNullable.control('', Validators.required),
    hora: this.fb.nonNullable.control('', Validators.required),
    motivo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    estado: this.fb.nonNullable.control<EstadoCita>('PENDIENTE'),
  });

  /** Combos dependientes Cliente → Mascota. */
  protected readonly combos = crearCombosClienteMascota(this.form, this.catalogo, this.destroyRef);

  /**
   * Carga los veterinarios y, en edición, precarga los datos de la cita.
   */
  ngOnInit(): void {
    this.catalogo.listarVeterinarios().subscribe({ next: (lista) => this.veterinarios.set(lista) });
    if (this.datos) {
      this.form.patchValue(
        {
          clienteId: this.datos.clienteId,
          mascotaId: this.datos.mascotaId,
          veterinarioId: this.datos.veterinarioId,
          fecha: this.datos.fecha,
          hora: horaCorta(this.datos.hora),
          motivo: this.datos.motivo,
        },
        { emitEvent: false },
      );
    }
  }

  /**
   * Valida el formulario y envía la creación o edición al backend.
   */
  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);

    const peticion = this.datos
      ? this.citaService.editar(this.datos.id, {
          veterinarioId: v.veterinarioId!,
          fecha: v.fecha,
          hora: v.hora,
          motivo: v.motivo.trim(),
        })
      : this.citaService.crear({
          clienteId: v.clienteId!,
          mascotaId: v.mascotaId!,
          veterinarioId: v.veterinarioId!,
          fecha: v.fecha,
          hora: v.hora,
          motivo: v.motivo.trim(),
          estado: v.estado,
        });

    peticion.subscribe({
      next: () => {
        this.notificaciones.exito(this.datos ? 'Cita actualizada correctamente.' : 'Cita registrada correctamente.');
        this.dialogRef.close(true);
      },
      error: () => this.guardando.set(false),
    });
  }
}
