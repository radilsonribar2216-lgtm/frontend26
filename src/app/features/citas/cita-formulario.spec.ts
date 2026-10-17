import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { API_URL } from '../../core/api.config';
import { CitaFormulario } from './cita-formulario';

describe('CitaFormulario', () => {
  function crear() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CitaFormulario);
    fixture.detectChanges();
    return { http, fixture };
  }

  it('carga solo las mascotas del cliente elegido (combo dependiente)', async () => {
    const { http, fixture } = crear();
    http.expectOne(`${API_URL}/veterinarios`).flush([]);
    http.expectOne(`${API_URL}/clientes`).flush([{ id: 1, nombreCompleto: 'Laura Gomez Ruiz' }]);

    const form = (fixture.componentInstance as any).form;
    form.controls.clienteId.setValue(1);
    http.expectOne(`${API_URL}/clientes/1/mascotas`).flush([{ id: 1, nombre: 'Max', especie: 'Perro' }]);

    expect((fixture.componentInstance as any).combos.mascotas().length).toBe(1);
    http.verify();
  });

  it('no envía nada si faltan campos obligatorios', () => {
    const { http, fixture } = crear();
    http.expectOne(`${API_URL}/veterinarios`).flush([]);
    http.expectOne(`${API_URL}/clientes`).flush([]);

    (fixture.componentInstance as any).guardar();
    expect((fixture.componentInstance as any).form.invalid).toBe(true);
    http.expectNone(`${API_URL}/citas`);
    http.verify();
  });
});
