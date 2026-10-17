import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Servicio para mostrar mensajes de éxito y error al usuario.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  /** Barra de notificaciones de Angular Material. */
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Muestra un mensaje de éxito.
   *
   * @param mensaje texto a mostrar.
   */
  exito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000, panelClass: 'snack-exito' });
  }

  /**
   * Muestra un mensaje de error (permanece más tiempo en pantalla).
   *
   * @param mensaje texto a mostrar.
   */
  error(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 8000, panelClass: 'snack-error' });
  }
}
