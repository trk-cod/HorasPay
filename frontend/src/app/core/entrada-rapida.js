/** Convierte “hoy 8-17:30 d60” a valores del formulario de jornada. */
function interpretarEntradaRapida(texto) {
  const resultado = texto.trim().match(/(?:hoy\s+)?(\d{1,2}(?::\d{2})?)\s*-\s*(\d{1,2}(?::\d{2})?)(?:\s+d(\d+))?/i);
  if (!resultado) return null;
  const hora = (valor) => valor.includes(':') ? valor.padStart(5, '0') : `${valor.padStart(2, '0')}:00`;
  return { entrada: hora(resultado[1]), salida: hora(resultado[2]), descansoMin: resultado[3] ? Number(resultado[3]) : 0 };
}
module.exports = { interpretarEntradaRapida };
