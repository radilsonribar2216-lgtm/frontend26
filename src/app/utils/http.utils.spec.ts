import { construirParams } from './http.utils';

describe('construirParams', () => {
  it('omite valores nulos, indefinidos y vacíos', () => {
    const params = construirParams({ texto: 'luna', estado: '', page: 0, sortBy: undefined, otro: null });
    expect(params.keys().sort()).toEqual(['page', 'texto']);
    expect(params.get('page')).toBe('0');
    expect(params.get('texto')).toBe('luna');
  });
});
