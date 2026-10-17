import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { API_URL } from '../../core/api.config';
import { FormulaFormulario } from './formula-formulario';

describe('FormulaFormulario', () => {
  it('rechaza una emisión anterior a la consulta y una dosis en cero', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(FormulaFormulario);
    fixture.detectChanges();
    http.expectOne(`${API_URL}/veterinarios`).flush([]);
    http.expectOne(`${API_URL}/clientes`).flush([]);

    const form = (fixture.componentInstance as any).form;
    form.controls.mascotaId.setValue(1);
    http.expectOne((r: any) => r.url === `${API_URL}/historias-clinicas`).flush({
      content: [
        { id: 7, fechaHora: '2026-10-10T09:00:00', motivoConsulta: 'Control', mascotaNombre: 'Max',
          clienteNombre: 'x', veterinarioNombre: 'y', estado: 'ABIERTA' },
      ],
      page: 0, size: 100, totalElements: 1, totalPages: 1,
    });

    form.controls.historiaClinicaId.setValue(7);
    form.controls.fechaEmision.setValue('2026-10-01T08:00');
    expect(form.controls.fechaEmision.hasError('anteriorConsulta')).toBe(true);
    form.controls.fechaEmision.setValue('2026-10-10T09:30');
    expect(form.controls.fechaEmision.hasError('anteriorConsulta')).toBe(false);

    form.controls.dosisCantidad.setValue(0);
    expect(form.controls.dosisCantidad.invalid).toBe(true);
    form.controls.duracionDias.setValue(400);
    expect(form.controls.duracionDias.invalid).toBe(true);
    form.controls.duracionDias.setValue(7);
    expect(form.controls.duracionDias.valid).toBe(true);
  });
});
