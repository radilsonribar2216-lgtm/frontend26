import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ListadoPaginado } from '../../core/listado-paginado';
import { Cita, EstadoCita, Pagina, Veterinario } from '../../models/api.models';
import { CatalogoService } from '../../services/catalogo.service';
import { CitaService } from '../../services/cita.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmarDialog } from '../../shared/confirmar-dialog';
import { ESTADOS_CITA, etiquetaEstadoCita, horaCorta } from '../../utils/formato.utils';
import { CitaFormulario } from './cita-formulario';

/**
 * Pantalla de gestión de citas médicas: DataTable con paginación, filtros y
 * ordenamiento en el servidor, creación, edición y cambio de estado.
 * Por defecto muestra primero las citas con fecha y hora más recientes.
 */
@Component({
  selector: 'app-citas-lista',
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
    MatMenuModule,
    MatProgressBarModule,
  ],
  templateUrl: './citas-lista.html',
})
export class CitasLista extends ListadoPaginado<Cita> implements OnInit {
  /** Servicio de citas. */
  private readonly citaService = inject(CitaService);

  /** Servicio de catálogos (veterinarios para el filtro). */
  private readonly catalogo = inject(CatalogoService);

  /** Servicio de diálogos. */
  private readonly dialog = inject(MatDialog);

  /** Servicio de notificaciones. */
  private readonly notificaciones = inject(NotificacionService);

  /** Constructor de formularios. */
  private readonly fb = inject(FormBuilder);

  /** Columnas visibles de la tabla. */
  protected readonly columnas = ['fecha', 'hora', 'cliente', 'mascota', 'veterinario', 'estado', 'acciones'];

  /** Estados disponibles para el filtro. */
  protected readonly estados = ESTADOS_CITA;

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

  /** Etiqueta legible de un estado (expuesta a la plantilla). */
  protected readonly etiqueta = etiquetaEstadoCita;

  /** Hora sin segundos (expuesta a la plantilla). */
  protected readonly hora = horaCorta;

  /**
   * Carga los veterinarios del filtro y la primera página de citas.
   */
  ngOnInit(): void {
    this.catalogo.listarVeterinarios().subscribe({ next: (lista) => this.veterinarios.set(lista) });
    this.cargar();
  }

  /** {@inheritDoc} */
  protected override consultar(params: Record<string, unknown>): Observable<Pagina<Cita>> {
    return this.citaService.listar(params);
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
   * Indica si una cita admite edición (pendiente, confirmada o programada).
   *
   * @param cita cita a evaluar.
   * @returns true si puede editarse.
   */
  protected puedeEditar(cita: Cita): boolean {
    return cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA' || cita.estado === 'PROGRAMADA';
  }

  /**
   * Estados a los que puede pasar una cita (refleja las reglas del backend).
   *
   * @param cita cita a evaluar.
   * @returns estados destino permitidos.
   */
  protected transiciones(cita: Cita): EstadoCita[] {
    switch (cita.estado) {
      case 'PENDIENTE':
        return ['CONFIRMADA', 'PROGRAMADA', 'ATENDIDA', 'CANCELADA'];
      case 'CONFIRMADA':
        return ['PROGRAMADA', 'ATENDIDA', 'CANCELADA'];
      case 'PROGRAMADA':
        return ['CONFIRMADA', 'ATENDIDA', 'CANCELADA'];
      default:
        return [];
    }
  }

  /**
   * Abre el formulario para crear una cita nueva.
   */
  protected nueva(): void {
    this.abrirFormulario(null);
  }

  /**
   * Abre el formulario para editar una cita existente.
   *
   * @param cita cita a editar.
   */
  protected editar(cita: Cita): void {
    this.abrirFormulario(cita);
  }

  /**
   * Cambia el estado de una cita; la cancelación pide confirmación.
   *
   * @param cita cita a modificar.
   * @param estado nuevo estado.
   */
  protected cambiarEstado(cita: Cita, estado: EstadoCita): void {
    if (estado === 'CANCELADA') {
      this.dialog
        .open(ConfirmarDialog, {
          data: {
            titulo: 'Cancelar cita',
            mensaje: `¿Desea cancelar la cita de ${cita.mascotaNombre}? Para retomarla deberá reactivarla.`,
            textoConfirmar: 'Cancelar cita',
          },
        })
        .afterClosed()
        .subscribe((confirmado) => confirmado && this.ejecutarCambio(this.citaService.cambiarEstado(cita.id, estado)));
      return;
    }
    this.ejecutarCambio(this.citaService.cambiarEstado(cita.id, estado));
  }

  /**
   * Reactiva una cita cancelada.
   *
   * @param cita cita cancelada.
   */
  protected reactivar(cita: Cita): void {
    this.ejecutarCambio(this.citaService.reactivar(cita.id));
  }

  /**
   * Ejecuta una operación sobre una cita y recarga el listado si tiene éxito.
   *
   * @param peticion operación HTTP a ejecutar.
   */
  private ejecutarCambio(peticion: Observable<Cita>): void {
    peticion.subscribe({
      next: () => {
        this.notificaciones.exito('La cita se actualizó correctamente.');
        this.cargar();
      },
    });
  }

  /**
   * Abre el diálogo de creación/edición y recarga el listado si se guardó.
   *
   * @param cita cita a editar o null para crear.
   */
  private abrirFormulario(cita: Cita | null): void {
    this.dialog
      .open(CitaFormulario, { width: '680px', maxWidth: '95vw', data: cita })
      .afterClosed()
      .subscribe((guardado) => guardado && this.cargar());
  }
}
