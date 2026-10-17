import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ListadoPaginado } from '../../core/listado-paginado';
import { Anotacion, HistoriaDetalle, Pagina } from '../../models/api.models';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { AnotacionDetalleDialog } from './anotacion-detalle-dialog';
import { AnotacionFormulario } from './anotacion-formulario';

/**
 * Diálogo "Ver" de una historia clínica: muestra el detalle completo y el
 * histórico de anotaciones de la mascota en un DataTable (filtros, orden por
 * fecha, paginación y detalle de cada anotación). Muestra primero las más recientes.
 */
@Component({
  selector: 'app-historia-detalle-dialog',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './historia-detalle-dialog.html',
})
export class HistoriaDetalleDialog extends ListadoPaginado<Anotacion> implements OnInit {
  /** Identificador de la historia que se está viendo. */
  protected readonly historiaId = inject<number>(MAT_DIALOG_DATA);

  /** Servicio de historias clínicas. */
  private readonly historiaService = inject(HistoriaClinicaService);

  /** Servicio de diálogos. */
  private readonly dialog = inject(MatDialog);

  /** Constructor de formularios. */
  private readonly fb = inject(FormBuilder);

  /** Detalle de la historia (null mientras carga). */
  protected readonly historia = signal<HistoriaDetalle | null>(null);

  /** Columnas de la tabla de anotaciones. */
  protected readonly columnas = ['fecha', 'veterinario', 'descripcion', 'diagnostico', 'acciones'];

  /** Filtros del histórico de anotaciones. */
  protected readonly formFiltros = this.fb.nonNullable.group({
    texto: '',
    fechaDesde: '',
    fechaHasta: '',
    soloHistoria: 'false',
  });

  /**
   * Carga el detalle de la historia y la primera página de anotaciones.
   */
  ngOnInit(): void {
    this.historiaService.consultar(this.historiaId).subscribe({ next: (h) => this.historia.set(h) });
    this.cargar();
  }

  /** {@inheritDoc} */
  protected override consultar(params: Record<string, unknown>): Observable<Pagina<Anotacion>> {
    return this.historiaService.listarAnotaciones(this.historiaId, params);
  }

  /** {@inheritDoc} */
  protected override filtrosActivos(): Record<string, unknown> {
    return this.formFiltros.getRawValue();
  }

  /** {@inheritDoc} */
  protected override reiniciarFiltros(): void {
    this.formFiltros.reset();
  }

  /**
   * Abre el formulario para agregar una anotación a esta historia.
   */
  protected agregarAnotacion(): void {
    this.dialog
      .open(AnotacionFormulario, { width: '640px', maxWidth: '95vw', data: this.historiaId })
      .afterClosed()
      .subscribe((guardado) => guardado && this.aplicarFiltros());
  }

  /**
   * Abre el detalle de una anotación.
   *
   * @param anotacion fila seleccionada.
   */
  protected verAnotacion(anotacion: Anotacion): void {
    this.dialog.open(AnotacionDetalleDialog, {
      width: '620px',
      maxWidth: '95vw',
      data: { historiaId: this.historiaId, anotacionId: anotacion.id },
    });
  }
}
