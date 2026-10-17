import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * Componente raíz: barra superior con la navegación entre los tres módulos
 * (citas, historias clínicas y fórmulas médicas) y la zona de contenido.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Opciones del menú de navegación. */
  protected readonly enlaces = [
    { ruta: '/citas', texto: 'Citas' },
    { ruta: '/historias', texto: 'Historias clínicas' },
    { ruta: '/formulas', texto: 'Fórmulas médicas' },
  ];
}
