import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { catchError, of, switchMap, tap } from 'rxjs';
import { crearCombosClienteMascota } from '../../core/combos-dependientes';
import { FormulaDetalle, HistoriaResumen, Veterinario } from '../../models/api.models';
import { CatalogoService } from '../../services/catalogo.service';
import { FormulaService } from '../../services/formula.service';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { NotificacionService } from '../../services/notificacion.service';
import { aDatetimeLocal, ahoraDatetimeLocal } from '../../utils/formato.utils';

/**
 * Formulario (en diálogo) para crear o editar una fórmula médica.
 * En creación encadena Cliente → Mascota → Historia clínica (consulta) de esa
 * mascota. En edición solo se pueden modificar los datos del tratamiento.
 * Valida en el frontend los campos obligatorios, la dosis, la duración y que
 * la emisión no sea anterior a la consulta; el backend vuelve a validarlo todo.
 */
@Component({
  selector: 'app-formula-formulario',
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
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar fórmula' : 'Nueva fórmula' }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        @if (guardando()) {
          <mat-progress-bar mode="indeterminate" />
        }

        @if (esEdicion) {
          <div class="resumen-fijo">
            <strong>{{ datos!.mascotaNombre }}</strong> · {{ datos!.clienteNombre }}<br />
            Consulta: {{ datos!.fechaConsulta | date: 'dd/MM/yyyy HH:mm' }} · {{ datos!.motivoConsulta }}<br />
            Veterinario emisor: {{ datos!.veterinarioNombre }}
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

            <mat-form-field appearance="outline" class="completo">
              <mat-label>Historia clínica (consulta)</mat-label>
              <mat-select formControlName="historiaClinicaId">
                @for (h of historias(); track h.id) {
                  <mat-option [value]="h.id">{{ h.fechaHora | date: 'dd/MM/yyyy HH:mm' }} · {{ h.motivoConsulta }}</mat-option>
                }
              </mat-select>
              <mat-hint>Solo se listan las consultas de la mascota.</mat-hint>
              <mat-error>Seleccione una historia clínica.</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="completo">
              <mat-label>Veterinario</mat-label>
              <mat-select formControlName="veterinarioId">
                @for (v of veterinarios(); track v.id) {
                  <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
                }
              </mat-select>
              <mat-error>Seleccione un veterinario.</mat-error>
            </mat-form-field>
          }

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Fecha y hora de emisión</mat-label>
            <input matInput type="datetime-local" formControlName="fechaEmision" />
            @if (form.controls.fechaEmision.hasError('anteriorConsulta')) {
              <mat-error>La emisión no puede ser anterior a la fecha de la consulta.</mat-error>
            } @else {
              <mat-error>La fecha de emisión es obligatoria.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Medicamento</mat-label>
            <input matInput formControlName="medicamento" maxlength="150" />
            <mat-error>El medicamento es obligatorio.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Dosis (cantidad)</mat-label>
            <input matInput type="number" step="0.01" min="0" formControlName="dosisCantidad" />
            <mat-error>La dosis debe ser un número mayor que cero.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Unidad</mat-label>
            <input matInput formControlName="dosisUnidad" list="unidades-dosis" maxlength="20" />
            <datalist id="unidades-dosis">
              @for (u of unidades; track u) {
                <option [value]="u"></option>
              }
            </datalist>
            <mat-error>La unidad es obligatoria.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Frecuencia</mat-label>
            <input matInput formControlName="frecuencia" maxlength="100" placeholder="Ej.: Cada 8 horas" />
            <mat-error>La frecuencia es obligatoria.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Duración del tratamiento (días)</mat-label>
            <input matInput type="number" min="1" max="365" step="1" formControlName="duracionDias" />
            <mat-error>Ingrese un número entero de días entre 1 y 365.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="completo">
            <mat-label>Indicaciones</mat-label>
            <textarea matInput rows="3" formControlName="indicaciones"></textarea>
            <mat-error>Las indicaciones son obligatorias.</mat-error>
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
export class FormulaFormulario implements OnInit {
  /** Fórmula a editar, o null cuando se está creando. */
  protected readonly datos = inject<FormulaDetalle | null>(MAT_DIALOG_DATA);

  /** Indica si el formulario está en modo edición. */
  protected readonly esEdicion = this.datos !== null;

  /** Referencia al diálogo para cerrarlo. */
  private readonly dialogRef = inject(MatDialogRef<FormulaFormulario>);

  /** Constructor de formularios. */
  private readonly fb = inject(FormBuilder);

  /** Servicio de catálogos. */
  private readonly catalogo = inject(CatalogoService);

  /** Servicio de historias clínicas. */
  private readonly historiaService = inject(HistoriaClinicaService);

  /** Servicio de fórmulas. */
  private readonly formulaService = inject(FormulaService);

  /** Servicio de notificaciones. */
  private readonly notificaciones = inject(NotificacionService);

  /** Referencia para cancelar suscripciones. */
  private readonly destroyRef = inject(DestroyRef);

  /** Unidades de dosis sugeridas. */
  protected readonly unidades = ['mg', 'ml', 'g', 'gotas', 'tabletas', 'cápsulas', 'mg/kg', 'UI'];

  /** Indica si se está enviando el formulario. */
  protected readonly guardando = signal(false);

  /** Veterinarios para el combo. */
  protected readonly veterinarios = signal<Veterinario[]>([]);

  /** Historias clínicas de la mascota seleccionada. */
  protected readonly historias = signal<HistoriaResumen[]>([]);

  /** Fecha-hora de la consulta asociada (límite inferior de la emisión). */
  private readonly fechaConsulta = signal<string | null>(null);

  /**
   * Validador: la fecha de emisión no puede ser anterior a la de la consulta.
   *
   * @param control control de la fecha de emisión.
   * @returns error `anteriorConsulta` o null si es válida.
   */
  private readonly validarEmision = (control: AbstractControl): ValidationErrors | null => {
    const minimo = this.fechaConsulta();
    const valor = control.value as string;
    return minimo && valor && valor < minimo ? { anteriorConsulta: true } : null;
  };

  /** Formulario reactivo de la fórmula. */
  protected readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    mascotaId: this.fb.control<number | null>(null, Validators.required),
    historiaClinicaId: this.fb.control<number | null>(null, Validators.required),
    veterinarioId: this.fb.control<number | null>(null, Validators.required),
    fechaEmision: this.fb.nonNullable.control(ahoraDatetimeLocal(), [Validators.required, this.validarEmision]),
    medicamento: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    dosisCantidad: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    dosisUnidad: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    frecuencia: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    duracionDias: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(365),
      Validators.pattern(/^\d+$/),
    ]),
    indicaciones: this.fb.nonNullable.control('', Validators.required),
  });

  /** Combos dependientes Cliente → Mascota. */
  protected readonly combos = crearCombosClienteMascota(this.form, this.catalogo, this.destroyRef);

  /**
   * Configura el formulario: en edición precarga los datos y deshabilita las
   * relaciones; en creación conecta Mascota → Historia clínica.
   */
  ngOnInit(): void {
    if (this.datos) {
      this.fechaConsulta.set(aDatetimeLocal(this.datos.fechaConsulta));
      this.form.patchValue(
        {
          clienteId: this.datos.clienteId,
          mascotaId: this.datos.mascotaId,
          historiaClinicaId: this.datos.historiaClinicaId,
          veterinarioId: this.datos.veterinarioId,
          fechaEmision: aDatetimeLocal(this.datos.fechaEmision),
          medicamento: this.datos.medicamento,
          dosisCantidad: this.datos.dosisCantidad,
          dosisUnidad: this.datos.dosisUnidad,
          frecuencia: this.datos.frecuencia,
          duracionDias: this.datos.duracionDias,
          indicaciones: this.datos.indicaciones,
        },
        { emitEvent: false },
      );
      return;
    }

    this.catalogo.listarVeterinarios().subscribe({ next: (lista) => this.veterinarios.set(lista) });

    this.form.controls.mascotaId.valueChanges
      .pipe(
        tap(() => {
          this.form.controls.historiaClinicaId.reset(null);
          this.historias.set([]);
        }),
        switchMap((id) =>
          id
            ? this.historiaService.listar({ mascotaId: id, size: 100 }).pipe(catchError(() => of(null)))
            : of(null),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((pagina) => this.historias.set(pagina ? pagina.content : []));

    this.form.controls.historiaClinicaId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((id) => {
      const historia = this.historias().find((h) => h.id === id);
      this.fechaConsulta.set(historia ? aDatetimeLocal(historia.fechaHora) : null);
      this.form.controls.fechaEmision.updateValueAndValidity();
    });
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

    const tratamiento = {
      fechaEmision: v.fechaEmision,
      medicamento: v.medicamento.trim(),
      dosisCantidad: Number(v.dosisCantidad),
      dosisUnidad: v.dosisUnidad.trim(),
      frecuencia: v.frecuencia.trim(),
      duracionDias: Number(v.duracionDias),
      indicaciones: v.indicaciones.trim(),
    };

    const peticion = this.datos
      ? this.formulaService.editar(this.datos.id, tratamiento)
      : this.formulaService.crear({
          mascotaId: v.mascotaId!,
          historiaClinicaId: v.historiaClinicaId!,
          veterinarioId: v.veterinarioId!,
          ...tratamiento,
        });

    peticion.subscribe({
      next: () => {
        this.notificaciones.exito(this.datos ? 'Fórmula actualizada correctamente.' : 'Fórmula registrada correctamente.');
        this.dialogRef.close(true);
      },
      error: () => this.guardando.set(false),
    });
  }
}
