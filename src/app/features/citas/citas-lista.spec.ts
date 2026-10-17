import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../../core/api.config';
import { CitasLista } from './citas-lista';

describe('CitasLista', () => {
  it('muestra las citas devueltas por el backend y pide el listado paginado', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CitasLista);
    fixture.detectChanges();

    http.expectOne(`${API_URL}/veterinarios`).flush([{ id: 1, documento: '9', nombreCompleto: 'Andrea Salazar' }]);
    const req = http.expectOne((r) => r.url === `${API_URL}/citas`);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush({
      content: [
        {
          id: 1, fecha: '2026-10-20', hora: '08:00:00', fechaHora: '2026-10-20T08:00:00',
          clienteId: 1, clienteNombre: 'Laura Gomez Ruiz', mascotaId: 2, mascotaNombre: 'Luna',
          veterinarioId: 1, veterinarioNombre: 'Andrea Salazar', motivo: 'Vacunacion', estado: 'PENDIENTE',
        },
      ],
      page: 0, size: 10, totalElements: 1, totalPages: 1,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Luna');
    expect(texto).toContain('Laura Gomez Ruiz');
    expect(texto).toContain('20/10/2026');
    expect(texto).toContain('08:00');
    expect(texto).toContain('Pendiente');
    http.verify();
  });
});
