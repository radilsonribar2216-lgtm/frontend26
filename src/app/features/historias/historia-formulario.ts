import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { catchError, of, switchMap, tap } from 'rxjs';
import { crearCombosClienteMascota } from '../../core/combos-dependientes';
import { Cita, Veterinario } from '../../models/api.models';
import { CatalogoService } from '../../services/catalogo.service';
import { CitaService } from '../../services/cita.service';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { NotificacionService } from '../../services/notificacion.service';
import { aDatetimeLocal, etiquetaEstadoCita, horaCorta } from '../../utils/formato.utils';

/**
 * Formulario (en diálogo) para registrar una historia clínica.
 * Encadena los combos Cliente → Mascota → Cita: solo se pueden elegir
 * mascotas del cliente y citas (no canceladas) de esa mascota.
 */
@Component({
  selector: 'app-historia-formulario',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva historia clínica</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        @if (guardando()) {
          <mat-progress-bar mode="indeterminate" />
        }
        <div class="formulario">
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

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Cita</mat-label>
            <mat-select formControlName="citaId">
              @for (c of citas(); track c.id) {
                <mat-option [value]="c.id">
                  {{ c.fecha | date: 'dd/MM/yyyy' }} {{ hora(c.hora) }} · {{ c.motivo }} ({{ etiqueta(c.estado) }})
                </mat-option>
              }
            </mat-select>
            <mat-hint>Citas de la mascota. Al guardar, la cita queda como atendida.</mat-hint>
            <mat-error>Seleccione una cita.</mat-error>
          </mat-form-field>

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
            <mat-label>Fecha y hora de la consulta</mat-label>
            <input matInput type="datetime-local" formControlName="fechaHora" />
            <mat-error>La fecha y hora son obligatorias.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Motivo de la consulta</mat-label>
            <input matInput formControlName="motivoConsulta" maxlength="255" />
            <mat-error>El motivo es obligatorio.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Diagnóstico</mat-label>
            <textarea matInput rows="3" formControlName="diagnostico"></textarea>
            <mat-error>El diagnóstico es obligatorio.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Observaciones</mat-label>
            <textarea matInput rows="2" formControlName="observaciones"></textarea>
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
export class HistoriaFormulario implements OnInit {
  /** Referencia al diálogo para cerrarlo. */
  private readonly dialogRef = inject(MatDialogRef<HistoriaFormulario>);

  /** Constructor de formularios. */
  private readonly fb = inject(FormBuilder);

  /** Servicio de catálogos. */
  private readonly catalogo = inject(CatalogoService);

  /** Servicio de citas. */
  private readonly citaService = inject(CitaService);

  /** Servicio de historias clínicas. */
  private readonly historiaService = inject(HistoriaClinicaService);

  /** Servicio de notificaciones. */
  private readonly notificaciones = inject(NotificacionService);

  /** Referencia para cancelar suscripciones. */
  private readonly destroyRef = inject(DestroyRef);

  /** Etiqueta legible de un estado de cita (expuesta a la plantilla). */
  protected readonly etiqueta = etiquetaEstadoCita;

  /** Hora sin segundos (expuesta a la plantilla). */
  protected readonly hora = horaCorta;

  /** Indica si se está enviando el formulario. */
  protected readonly guardando = signal(false);

  /** Veterinarios para el combo. */
  protected readonly veterinarios = signal<Veterinario[]>([]);

  /** Citas de la mascota seleccionada (excluye las canceladas). */
  protected readonly citas = signal<Cita[]>([]);

  /** Formulario reactivo de la historia clínica. */
  protected readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    mascotaId: this.fb.control<number | null>(null, Validators.required),
    citaId: this.fb.control<number | null>(null, Validators.required),
    veterinarioId: this.fb.control<number | null>(null, Validators.required),
    fechaHora: this.fb.nonNullable.control('', Validators.required),
    motivoConsulta: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    diagnostico: this.fb.nonNullable.control('', Validators.required),
    observaciones: this.fb.nonNullable.control(''),
  });

  /** Combos dependientes Cliente → Mascota. */
  protected readonly combos = crearCombosClienteMascota(this.form, this.catalogo, this.destroyRef);

  /**
   * Carga veterinarios y conecta los combos dependientes Mascota → Cita y
   * la precarga de datos al elegir una cita.
   */
  ngOnInit(): void {
    this.catalogo.listarVeterinarios().subscribe({ next: (lista) => this.veterinarios.set(lista) });

    this.form.controls.mascotaId.valueChanges
      .pipe(
        tap(() => {
          this.form.controls.citaId.reset(null);
          this.citas.set([]);
        }),
        switchMap((id) =>
          id
            ? this.citaService
                .listar({ mascotaId: id, size: 100, sortBy: 'fecha', sortDir: 'desc' })
                .pipe(catchError(() => of(null)))
            : of(null),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((pagina) => this.citas.set(pagina ? pagina.content.filter((c) => c.estado !== 'CANCELADA') : []));

    this.form.controls.citaId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((id) => {
      const cita = this.citas().find((c) => c.id === id);
      if (cita) {
        this.form.patchValue({
          veterinarioId: cita.veterinarioId,
          fechaHora: aDatetimeLocal(cita.fechaHora),
          motivoConsulta: cita.motivo,
        });
      }
    });
  }

  /**
   * Valida el formulario y envía la creación al backend.
   */
  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.historiaService
      .crear({
        clienteId: v.clienteId!,
        mascotaId: v.mascotaId!,
        citaId: v.citaId!,
        veterinarioId: v.veterinarioId!,
        fechaHora: v.fechaHora,
        motivoConsulta: v.motivoConsulta.trim(),
        diagnostico: v.diagnostico.trim(),
        observaciones: v.observaciones.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.notificaciones.exito('Historia clínica registrada correctamente.');
          this.dialogRef.close(true);
        },
        error: () => this.guardando.set(false),
      });
  }
}
