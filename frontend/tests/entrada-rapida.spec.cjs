const { interpretarEntradaRapida } = require('../src/app/core/entrada-rapida');

describe('entrada rápida', () => {
  it('interpreta el ejemplo de bienvenida', () => {
    expect(interpretarEntradaRapida('hoy 8-17:30 d60')).toEqual({ entrada: '08:00', salida: '17:30', descansoMin: 60 });
  });
  it('usa cero minutos cuando no se indica descanso', () => {
    expect(interpretarEntradaRapida('9:15-18')).toEqual({ entrada: '09:15', salida: '18:00', descansoMin: 0 });
  });
  it('no acepta texto ambiguo', () => expect(interpretarEntradaRapida('trabajé mucho')).toBeNull());
});
