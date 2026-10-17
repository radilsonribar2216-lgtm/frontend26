import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorApi } from '../models/api.models';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Interceptor global de errores HTTP. Convierte cualquier fallo en un
 * mensaje comprensible para el usuario (sin detalles técnicos) y lo muestra
 * en una notificación. El error se vuelve a lanzar para que cada componente
 * pueda reaccionar (por ejemplo, dejar el formulario abierto).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificaciones = inject(NotificacionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensaje: string;
      if (error.status === 0) {
        mensaje = 'No se pudo comunicar con el servidor. Verifique que el backend esté en ejecución.';
      } else {
        const cuerpo = error.error as Partial<ErrorApi> | null;
        mensaje = cuerpo?.message ?? 'Ocurrió un error inesperado. Intente nuevamente.';
      }
      notificaciones.error(mensaje);
      return throwError(() => error);
    }),
  );
};
