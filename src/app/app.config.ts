import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { errorInterceptor } from './core/error.interceptor';
import { routes } from './app.routes';

/**
 * Configuración global de la aplicación: enrutamiento y cliente HTTP con el
 * interceptor que traduce los errores del backend a mensajes para el usuario.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
  ],
};
