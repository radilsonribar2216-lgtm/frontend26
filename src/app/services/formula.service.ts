import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { FormulaCrear, FormulaDetalle, FormulaEditar, FormulaResumen, Pagina } from '../models/api.models';
import { construirParams } from '../utils/http.utils';

/**
 * Servicio de consumo de la API de fórmulas médicas.
 */
@Injectable({ providedIn: 'root' })
export class FormulaService {
  /** Cliente HTTP de Angular. */
  private readonly http = inject(HttpClient);

  /** URL base del recurso. */
  private readonly url = `${API_URL}/formulas`;

  /**
   * Lista fórmulas con filtros, paginación y orden.
   *
   * @param filtros parámetros de consulta.
   * @returns página de fórmulas (resumen).
   */
  listar(filtros: Record<string, unknown>): Observable<Pagina<FormulaResumen>> {
    return this.http.get<Pagina<FormulaResumen>>(this.url, { params: construirParams(filtros) });
  }

  /**
   * Consulta el detalle completo de una fórmula.
   *
   * @param id identificador de la fórmula.
   * @returns detalle de la fórmula.
   */
  consultar(id: number): Observable<FormulaDetalle> {
    return this.http.get<FormulaDetalle>(`${this.url}/${id}`);
  }

  /**
   * Crea una fórmula.
   *
   * @param datos datos de la fórmula.
   * @returns fórmula creada.
   */
  crear(datos: FormulaCrear): Observable<FormulaDetalle> {
    return this.http.post<FormulaDetalle>(this.url, datos);
  }

  /**
   * Edita los datos permitidos de una fórmula activa.
   *
   * @param id identificador de la fórmula.
   * @param datos nuevos datos.
   * @returns fórmula actualizada.
   */
  editar(id: number, datos: FormulaEditar): Observable<FormulaDetalle> {
    return this.http.put<FormulaDetalle>(`${this.url}/${id}`, datos);
  }

  /**
   * Inactiva una fórmula (no se elimina físicamente).
   *
   * @param id identificador de la fórmula.
   * @returns fórmula inactivada.
   */
  inactivar(id: number): Observable<FormulaDetalle> {
    return this.http.patch<FormulaDetalle>(`${this.url}/${id}/inactivar`, {});
  }

  /**
   * Activa una fórmula inactiva.
   *
   * @param id identificador de la fórmula.
   * @returns fórmula activada.
   */
  activar(id: number): Observable<FormulaDetalle> {
    return this.http.patch<FormulaDetalle>(`${this.url}/${id}/activar`, {});
  }
}
