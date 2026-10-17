import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../core/api.config';
import { CitaService } from './cita.service';

describe('CitaService', () => {
  let servicio: CitaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(CitaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista citas con los filtros como query params', () => {
    servicio.listar({ estado: 'PENDIENTE', page: 0, texto: '' }).subscribe();
    const req = http.expectOne((r) => r.url === `${API_URL}/citas`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('estado')).toBe('PENDIENTE');
    expect(req.request.params.has('texto')).toBe(false);
    req.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('cambia el estado con PATCH', () => {
    servicio.cambiarEstado(5, 'CANCELADA').subscribe();
    const req = http.expectOne(`${API_URL}/citas/5/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ estado: 'CANCELADA' });
    req.flush({});
  });

  it('crea una cita con POST', () => {
    servicio
      .crear({ clienteId: 1, mascotaId: 1, veterinarioId: 1, fecha: '2026-12-01', hora: '09:00', motivo: 'x' })
      .subscribe();
    const req = http.expectOne(`${API_URL}/citas`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
