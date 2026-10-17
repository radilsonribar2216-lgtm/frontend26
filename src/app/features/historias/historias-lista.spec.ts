import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../../core/api.config';
import { HistoriasLista } from './historias-lista';

describe('HistoriasLista', () => {
  it('muestra las historias devueltas por el backend', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(HistoriasLista);
    fixture.detectChanges();

    http.expectOne(`${API_URL}/veterinarios`).flush([]);
    http.expectOne((r) => r.url === `${API_URL}/historias-clinicas`).flush({
      content: [
        {
          id: 1, fechaHora: '2026-09-10T09:00:00', mascotaNombre: 'Max', clienteNombre: 'Laura Gomez Ruiz',
          veterinarioNombre: 'Andrea Salazar', motivoConsulta: 'Control general', estado: 'ABIERTA',
        },
      ],
      page: 0, size: 10, totalElements: 1, totalPages: 1,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Max');
    expect(texto).toContain('Control general');
    expect(texto).toContain('10/09/2026 09:00');
    expect(texto).toContain('Abierta');
    http.verify();
  });
});
