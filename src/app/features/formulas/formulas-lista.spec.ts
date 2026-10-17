import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../../core/api.config';
import { FormulasLista } from './formulas-lista';

describe('FormulasLista', () => {
  it('muestra la información resumida de las fórmulas', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(FormulasLista);
    fixture.detectChanges();

    http.expectOne(`${API_URL}/veterinarios`).flush([]);
    http.expectOne((r) => r.url === `${API_URL}/formulas`).flush({
      content: [
        {
          id: 1, createdAt: '2026-10-15T10:00:00', fechaEmision: '2026-10-15T09:30:00', mascotaNombre: 'Max',
          clienteNombre: 'Laura Gomez Ruiz', veterinarioNombre: 'Andrea Salazar', medicamento: 'Amoxicilina',
          dosis: '250 mg', duracionDias: 7, activo: true,
        },
      ],
      page: 0, size: 10, totalElements: 1, totalPages: 1,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Amoxicilina');
    expect(texto).toContain('250 mg');
    expect(texto).toContain('7 días');
    expect(texto).toContain('Activa');
    expect(texto).toContain('Inactivar');
    http.verify();
  });
});
