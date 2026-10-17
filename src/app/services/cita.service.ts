import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { Cita, CitaCrear, CitaEditar, EstadoCita, Pagina } from '../models/api.models';
import { construirParams } from '../utils/http.utils';

/**
 * Servicio de consumo de la API de citas médicas.
 */
@Injectable({ providedIn: 'root' })
export class CitaService {
  /** Cliente HTTP de Angular. */
  private readonly http = inject(HttpClient);

  /** URL base del recurso. */
  private readonly url = `${API_URL}/citas`;

  /**
   * Lista citas con filtros, paginación y orden.
   *
   * @param filtros parámetros de consulta.
   * @returns página de citas.
   */
  listar(filtros: Record<string, unknown>): Observable<Pagina<Cita>> {
    return this.http.get<Pagina<Cita>>(this.url, { params: construirParams(filtros) });
  }

  /**
   * Consulta una cita.
   *
   * @param id identificador de la cita.
   * @returns cita.
   */
  consultar(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.url}/${id}`);
  }

  /**
   * Crea una cita.
   *
   * @param datos datos de la cita.
   * @returns cita creada.
   */
  crear(datos: CitaCrear): Observable<Cita> {
    return this.http.post<Cita>(this.url, datos);
  }

  /**
   * Edita fecha, hora, veterinario y motivo de una cita.
   *
   * @param id identificador de la cita.
   * @param datos nuevos datos.
   * @returns cita actualizada.
   */
  editar(id: number, datos: CitaEditar): Observable<Cita> {
    return this.http.put<Cita>(`${this.url}/${id}`, datos);
  }

  /**
   * Cambia el estado de una cita.
   *
   * @param id identificador de la cita.
   * @param estado nuevo estado.
   * @returns cita actualizada.
   */
  cambiarEstado(id: number, estado: EstadoCita): Observable<Cita> {
    return this.http.patch<Cita>(`${this.url}/${id}/estado`, { estado });
  }

  /**
   * Reactiva una cita cancelada (operación explícita).
   *
   * @param id identificador de la cita.
   * @returns cita reactivada.
   */
  reactivar(id: number): Observable<Cita> {
    return this.http.patch<Cita>(`${this.url}/${id}/reactivar`, {});
  }
}
