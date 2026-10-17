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
import { FormulaDetalle, FormulaResumen, Pagina, Veterinario } from '../../models/api.models';
import { CatalogoService } from '../../services/catalogo.service';
import { FormulaService } from '../../services/formula.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmarDialog } from '../../shared/confirmar-dialog';
import { FormulaDetalleDialog } from './formula-detalle-dialog';
import { FormulaFormulario } from './formula-formulario';

/**
 * Pantalla de gestión de fórmulas médicas: DataTable con información resumida,
 * paginación, filtros y orden en el servidor. Por defecto muestra primero las
 * fórmulas creadas más recientemente. Las fórmulas no se eliminan: se inactivan.
 */
@Component({
  selector: 'app-formulas-lista',
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
  templateUrl: './formulas-lista.html',
})
export class FormulasLista extends ListadoPaginado<FormulaResumen> implements OnInit {
  /** Servicio de fórmulas. */
  private readonly formulaService = inject(FormulaService);

  /** Servicio de catálogos (veterinarios para el filtro). */
  private readonly catalogo = inject(CatalogoService);

  /** Servicio de diálogos. */
  private readonly dialog = inject(MatDialog);

  /** Servicio de notificaciones. */
  private readonly notificaciones = inject(NotificacionService);

  /** Constructor de formularios. */
  private readonly fb = inject(FormBuilder);

  /** Columnas visibles de la tabla (información resumida). */
  protected readonly columnas = [
    'creacion', 'emision', 'mascota', 'cliente', 'veterinario', 'medicamento', 'dosis', 'duracion', 'estado', 'acciones',
  ];

  /** Veterinarios para el filtro. */
  protected readonly veterinarios = signal<Veterinario[]>([]);

  /** Formulario con los filtros del listado. */
  protected readonly formFiltros = this.fb.nonNullable.group({
    texto: '',
    activo: '',
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
  protected override consultar(params: Record<string, unknown>): Observable<Pagina<FormulaResumen>> {
    return this.formulaService.listar(params);
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
   * Abre el formulario para crear una fórmula nueva.
   */
  protected nueva(): void {
    this.abrirFormulario(null);
  }

  /**
   * Carga el detalle de una fórmula y abre el formulario de edición.
   *
   * @param fila fila seleccionada.
   */
  protected editar(fila: FormulaResumen): void {
    this.formulaService.consultar(fila.id).subscribe({ next: (detalle) => this.abrirFormulario(detalle) });
  }

  /**
   * Abre el detalle completo de la fórmula.
   *
   * @param fila fila seleccionada.
   */
  protected ver(fila: FormulaResumen): void {
    this.dialog.open(FormulaDetalleDialog, { width: '720px', maxWidth: '95vw', data: fila.id });
  }

  /**
   * Inactiva una fórmula tras confirmar con el usuario.
   *
   * @param fila fila seleccionada.
   */
  protected inactivar(fila: FormulaResumen): void {
    this.dialog
      .open(ConfirmarDialog, {
        data: {
          titulo: 'Inactivar fórmula',
          mensaje: `La fórmula de ${fila.medicamento} para ${fila.mascotaNombre} no se eliminará, quedará inactiva. ¿Desea continuar?`,
          textoConfirmar: 'Inactivar',
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (confirmado) {
          this.formulaService.inactivar(fila.id).subscribe({
            next: () => {
              this.notificaciones.exito('La fórmula quedó inactiva.');
              this.cargar();
            },
          });
        }
      });
  }

  /**
   * Activa una fórmula inactiva.
   *
   * @param fila fila seleccionada.
   */
  protected activar(fila: FormulaResumen): void {
    this.formulaService.activar(fila.id).subscribe({
      next: () => {
        this.notificaciones.exito('La fórmula quedó activa.');
        this.cargar();
      },
    });
  }

  /**
   * Abre el diálogo de creación/edición y recarga el listado si se guardó.
   *
   * @param formula detalle de la fórmula a editar o null para crear.
   */
  private abrirFormulario(formula: FormulaDetalle | null): void {
    this.dialog
      .open(FormulaFormulario, { width: '760px', maxWidth: '95vw', data: formula })
      .afterClosed()
      .subscribe((guardado) => guardado && this.cargar());
  }
}
