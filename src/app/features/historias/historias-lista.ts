import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ListadoPaginado } from '../../core/listado-paginado';
import { HistoriaResumen, Pagina, Veterinario } from '../../models/api.models';
import { CatalogoService } from '../../services/catalogo.service';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { HistoriaDetalleDialog } from './historia-detalle-dialog';
import { HistoriaFormulario } from './historia-formulario';

/**
 * Pantalla de historias clínicas: DataTable con paginación, filtros y orden
 * en el servidor. Por defecto muestra primero las consultas más recientes.
 * Desde aquí se crea una historia y se abre su detalle con las anotaciones.
 */
@Component({
  selector: 'app-historias-lista',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './historias-lista.html',
})
export class HistoriasLista extends ListadoPaginado<HistoriaResumen> implements OnInit {
  /** Servicio de historias clínicas. */
  private readonly historiaService = inject(HistoriaClinicaService);

  /** Servicio de catálogos (veterinarios para el filtro). */
  private readonly catalogo = inject(CatalogoService);

  /** Servicio de diálogos. */
  private readonly dialog = inject(MatDialog);

  /** Constructor de formularios. */
  private readonly fb = inject(FormBuilder);

  /** Columnas visibles de la tabla. */
  protected readonly columnas = ['fecha', 'mascota', 'cliente', 'veterinario', 'motivo', 'estado', 'acciones'];

  /** Veterinarios para el filtro. */
  protected readonly veterinarios = signal<Veterinario[]>([]);

  /** Formulario con los filtros del listado. */
  protected readonly formFiltros = this.fb.nonNullable.group({
    texto: '',
    estado: '',
    veterinarioId: '' as number | '',
    fechaDesde: '',
    fechaHasta: '',
  });

  /**
   * Carga los veterinarios del filtro y la primera página.
   */
  ngOnInit(): void {
    this.catalogo.listarVeterinarios().subscribe({ next: (lista) => this.veterinarios.set(lista) });
    this.cargar();
  }

  /** {@inheritDoc} */
  protected override consultar(params: Record<string, unknown>): Observable<Pagina<HistoriaResumen>> {
    return this.historiaService.listar(params);
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
   * Abre el formulario de nueva historia y recarga si se guardó.
   */
  protected nueva(): void {
    this.dialog
      .open(HistoriaFormulario, { width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((guardado) => guardado && this.cargar());
  }

  /**
   * Abre el detalle de una historia (datos completos + anotaciones).
   *
   * @param historia fila seleccionada.
   */
  protected ver(historia: HistoriaResumen): void {
    this.dialog.open(HistoriaDetalleDialog, { width: '980px', maxWidth: '96vw', data: historia.id });
  }
}
