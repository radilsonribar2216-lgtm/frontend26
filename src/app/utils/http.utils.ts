import { HttpParams } from '@angular/common/http';

/**
 * Construye los parámetros de consulta (query string) a partir de un objeto,
 * omitiendo valores nulos, indefinidos o vacíos.
 *
 * @param valores objeto con los filtros.
 * @returns parámetros HTTP listos para enviar.
 */
export function construirParams(valores: Record<string, unknown>): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor !== null && valor !== undefined && valor !== '') {
      params = params.set(clave, String(valor));
    }
  }
  return params;
}
