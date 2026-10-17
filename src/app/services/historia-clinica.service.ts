import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import {
  Anotacion,
  AnotacionCrear,
  HistoriaCrear,
  HistoriaDetalle,
  HistoriaResumen,
  Pagina,
} from '../models/api.models';
import { construirParams } from '../utils/http.utils';

/**
 * Servicio de consumo de la API de historias clínicas y anotaciones.
 */
@Injectable({ providedIn: 'root' })
export class HistoriaClinicaService {
  /** Cliente HTTP de Angular. */
  private readonly http = inject(HttpClient);

  /** URL base del recurso. */
  private readonly url = `${API_URL}/historias-clinicas`;

  /**
   * Lista historias con filtros, paginación y orden.
   *
   * @param filtros parámetros de consulta.
   * @returns página de historias (resumen).
   */
  listar(filtros: Record<string, unknown>): Observable<Pagina<HistoriaResumen>> {
    return this.http.get<Pagina<HistoriaResumen>>(this.url, { params: construirParams(filtros) });
  }

  /**
   * Consulta el detalle de una historia.
   *
   * @param id identificador de la historia.
   * @returns detalle de la historia.
   */
  consultar(id: number): Observable<HistoriaDetalle> {
    return this.http.get<HistoriaDetalle>(`${this.url}/${id}`);
  }

  /**
   * Crea una historia clínica.
   *
   * @param datos datos de la historia.
   * @returns historia creada.
   */
  crear(datos: HistoriaCrear): Observable<HistoriaDetalle> {
    return this.http.post<HistoriaDetalle>(this.url, datos);
  }

  /**
   * Lista las anotaciones de una historia (o el histórico de la mascota).
   *
   * @param historiaId identificador de la historia.
   * @param filtros parámetros de consulta.
   * @returns página de anotaciones.
   */
  listarAnotaciones(historiaId: number, filtros: Record<string, unknown>): Observable<Pagina<Anotacion>> {
    return this.http.get<Pagina<Anotacion>>(`${this.url}/${historiaId}/anotaciones`, {
      params: construirParams(filtros),
    });
  }

  /**
   * Consulta el detalle de una anotación.
   *
   * @param historiaId identificador de la historia.
   * @param anotacionId identificador de la anotación.
   * @returns anotación.
   */
  consultarAnotacion(historiaId: number, anotacionId: number): Observable<Anotacion> {
    return this.http.get<Anotacion>(`${this.url}/${historiaId}/anotaciones/${anotacionId}`);
  }

  /**
   * Agrega una anotación a una historia.
   *
   * @param historiaId identificador de la historia.
   * @param datos datos de la anotación.
   * @returns anotación creada.
   */
  crearAnotacion(historiaId: number, datos: AnotacionCrear): Observable<Anotacion> {
    return this.http.post<Anotacion>(`${this.url}/${historiaId}/anotaciones`, datos);
  }
}
