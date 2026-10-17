import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

/** Datos que recibe el diálogo de confirmación. */
export interface ConfirmarDatos {
  /** Título del diálogo. */
  titulo: string;
  /** Mensaje explicativo. */
  mensaje: string;
  /** Texto del botón de confirmación. */
  textoConfirmar?: string;
}

/**
 * Diálogo genérico de confirmación (Sí/No) reutilizable en toda la aplicación.
 * Cierra devolviendo `true` si el usuario confirma.
 */
@Component({
  selector: 'app-confirmar-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ datos.titulo }}</h2>
    <mat-dialog-content>{{ datos.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button [mat-dialog-close]="true">{{ datos.textoConfirmar ?? 'Confirmar' }}</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmarDialog {
  /** Datos recibidos al abrir el diálogo. */
  protected readonly datos = inject<ConfirmarDatos>(MAT_DIALOG_DATA);
}
