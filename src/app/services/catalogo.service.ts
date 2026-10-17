import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { Cliente, Mascota, Veterinario } from '../models/api.models';

/**
 * Servicio de catálogos de apoyo: clientes, mascotas y veterinarios.
 * Alimenta los combos (selects) de los formularios.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  /** Cliente HTTP de Angular. */
  private readonly http = inject(HttpClient);

  /**
   * Lista los clientes activos.
   *
   * @returns clientes.
   */
  listarClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${API_URL}/clientes`);
  }

  /**
   * Lista las mascotas de un cliente (combo dependiente).
   *
   * @param clienteId identificador del cliente.
   * @returns mascotas del cliente.
   */
  listarMascotasDeCliente(clienteId: number): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(`${API_URL}/clientes/${clienteId}/mascotas`);
  }

  /**
   * Lista los veterinarios activos.
   *
   * @returns veterinarios.
   */
  listarVeterinarios(): Observable<Veterinario[]> {
    return this.http.get<Veterinario[]>(`${API_URL}/veterinarios`);
  }
}
