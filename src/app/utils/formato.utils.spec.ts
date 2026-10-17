import { aDatetimeLocal, etiquetaEstadoCita, horaCorta, hoyISO } from './formato.utils';

describe('formato.utils', () => {
  it('recorta la hora a HH:mm', () => {
    expect(horaCorta('09:30:00')).toBe('09:30');
    expect(horaCorta(null)).toBe('');
  });

  it('convierte fecha-hora ISO a datetime-local', () => {
    expect(aDatetimeLocal('2026-10-20T08:00:00')).toBe('2026-10-20T08:00');
    expect(aDatetimeLocal(undefined)).toBe('');
  });

  it('devuelve etiquetas legibles de estado', () => {
    expect(etiquetaEstadoCita('CANCELADA')).toBe('Cancelada');
    expect(etiquetaEstadoCita('PROGRAMADA')).toBe('Programada');
  });

  it('hoyISO devuelve una fecha yyyy-MM-dd', () => {
    expect(hoyISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
