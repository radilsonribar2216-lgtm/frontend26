import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { Pagina } from '../models/api.models';

/**
 * Clase base reutilizable para los listados (DataTable) con paginación,
 * filtros y ordenamiento en el servidor. Cada listado solo define cómo
 * consultar los datos y qué filtros usa.
 *
 * @typeParam T tipo de cada fila de la tabla.
 */
export abstract class ListadoPaginado<T> {
  /** Filas de la página actual. */
  readonly filas = signal<T[]>([]);

  /** Total de registros que cumplen el filtro. */
  readonly total = signal(0);

  /** Indica si hay una consulta en curso (estado de carga). */
  readonly cargando = signal(false);

  /** Índice de la página actual (base 0). */
  readonly pagina = signal(0);

  /** Cantidad de filas por página. */
  readonly tamano = signal(10);

  /** Opciones del selector de tamaño de página. */
  readonly opcionesTamano = [5, 10, 25, 50];

  /** Columna por la que se ordena (undefined = orden por defecto del backend). */
  protected ordenarPor: string | undefined;

  /** Dirección del orden. */
  protected direccion: 'asc' | 'desc' | undefined;

  /** Referencia para cancelar suscripciones al destruir el componente. */
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Consulta una página de datos al backend.
   *
   * @param params parámetros ya combinados (paginación, orden y filtros).
   * @returns observable con la página de resultados.
   */
  protected abstract consultar(params: Record<string, unknown>): Observable<Pagina<T>>;

  /**
   * Devuelve los filtros que el usuario tiene activos.
   *
   * @returns objeto con los filtros no vacíos.
   */
  protected abstract filtrosActivos(): Record<string, unknown>;

  /**
   * Restablece los controles de filtro a su valor inicial.
   */
  protected abstract reiniciarFiltros(): void;

  /**
   * Carga la página actual con los filtros y el orden vigentes.
   */
  cargar(): void {
    this.cargando.set(true);
    const params: Record<string, unknown> = {
      ...this.filtrosActivos(),
      page: this.pagina(),
      size: this.tamano(),
      sortBy: this.ordenarPor,
      sortDir: this.direccion,
    };
    this.consultar(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.filas.set(respuesta.content);
          this.total.set(respuesta.totalElements);
          this.cargando.set(false);
        },
        error: () => {
          this.filas.set([]);
          this.total.set(0);
          this.cargando.set(false);
        },
      });
  }

  /**
   * Maneja el cambio de página o de tamaño de página.
   *
   * @param evento evento del paginador.
   */
  alCambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamano.set(evento.pageSize);
    this.cargar();
  }

  /**
   * Maneja el clic en el encabezado de una columna ordenable.
   *
   * @param orden estado de ordenamiento del MatSort.
   */
  alOrdenar(orden: Sort): void {
    this.ordenarPor = orden.direction ? orden.active : undefined;
    this.direccion = orden.direction ? orden.direction : undefined;
    this.pagina.set(0);
    this.cargar();
  }

  /**
   * Aplica los filtros volviendo a la primera página.
   */
  aplicarFiltros(): void {
    this.pagina.set(0);
    this.cargar();
  }

  /**
   * Limpia todos los filtros y recarga el listado.
   */
  limpiarFiltros(): void {
    this.reiniciarFiltros();
    this.aplicarFiltros();
  }
}
