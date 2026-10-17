import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Pagina } from '../models/api.models';
import { ListadoPaginado } from './listado-paginado';

/** Implementación mínima para probar la clase base. */
class ListadoDePrueba extends ListadoPaginado<string> {
  /** Últimos parámetros recibidos por la consulta. */
  ultimosParams: Record<string, unknown> = {};

  protected override consultar(params: Record<string, unknown>): Observable<Pagina<string>> {
    this.ultimosParams = params;
    return of({ content: ['a', 'b'], page: 0, size: 10, totalElements: 2, totalPages: 1 });
  }

  protected override filtrosActivos(): Record<string, unknown> {
    return { texto: 'x' };
  }

  protected override reiniciarFiltros(): void {}
}

describe('ListadoPaginado', () => {
  let listado: ListadoDePrueba;

  beforeEach(() => {
    listado = TestBed.runInInjectionContext(() => new ListadoDePrueba());
  });

  it('carga filas y total con paginación y filtros', () => {
    listado.cargar();
    expect(listado.filas()).toEqual(['a', 'b']);
    expect(listado.total()).toBe(2);
    expect(listado.cargando()).toBe(false);
    expect(listado.ultimosParams['texto']).toBe('x');
    expect(listado.ultimosParams['page']).toBe(0);
    expect(listado.ultimosParams['size']).toBe(10);
  });

  it('al ordenar envía sortBy/sortDir y vuelve a la primera página', () => {
    listado.alCambiarPagina({ pageIndex: 3, pageSize: 5, length: 20 });
    listado.alOrdenar({ active: 'fecha', direction: 'asc' });
    expect(listado.pagina()).toBe(0);
    expect(listado.ultimosParams['sortBy']).toBe('fecha');
    expect(listado.ultimosParams['sortDir']).toBe('asc');
  });

  it('al quitar el orden usa el orden por defecto del backend', () => {
    listado.alOrdenar({ active: 'fecha', direction: '' });
    expect(listado.ultimosParams['sortBy']).toBeUndefined();
  });
});
