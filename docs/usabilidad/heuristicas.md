# Auditoría de las heurísticas de Nielsen

| # | Requisito | Evidencia en HorasPay | Estado |
|---|---|---|---|
| 1 | Visibilidad del estado | Barra inferior con conexión, moneda y tasa; splash de inicio; tarjetas y vista previa | Implementado |
| 2 | Mundo real | Etiquetas Jornada, cuánto llevas ganado, RD$ y horas legibles | Implementado |
| 3 | Control y libertad | Cancelar en registro, Deshacer 8 s tras eliminar, menú nativo | Implementado |
| 4 | Consistencia | Tokens CSS, colores semánticos y un único botón primario por página | Implementado |
| 5 | Prevención | Controles requeridos, tarifa positiva, pasos de 5 min y detección API de solapamiento | Implementado |
| 6 | Reconocer | Valores iniciales inteligentes, etiquetas visibles y preview antes de guardar | Implementado |
| 7 | Eficiencia | Entrada rápida, Ctrl+N/S/E, F1 y menú de escritorio | Implementado |
| 8 | Minimalismo | Cuatro KPI y un gráfico en Dashboard; detalles económicos plegables | Implementado |
| 9 | Recuperación | `ProblemDetails` con código legible, estado sin conexión y restauración de eliminación | Implementado |
| 10 | Ayuda | Ayuda con preguntas frecuentes, atajos y explicación de predicción | Implementado |

## Pendientes de validación manual

- Probar lector de pantalla y contraste en tema oscuro en la compilación instalada.
- Ejecutar el recorrido de bienvenida y la importación de respaldo al completar esas pantallas.
- Completar prueba de instalación en una máquina Windows limpia.
