# 0041 — Explorar campus

Estado: Implementado y verificado técnicamente | Fecha: 2026-11-21

## Contexto y alcance
RF-04, RF-05c, RF-06, RF-07, RF-12; US-05c, US-06, US-11. Implementar Explorar según DESIGN.md y docs/design/refs. Conservar búsqueda, filtros AND, API, Socket.io y confirmación de reserva. La composición anterior 0031 queda como evidencia histórica. No cambia backend ni detalle/formulario.

### AC-01 — Composición e identidad
Encabezado desplazable con marca y silueta de campus, crema, navegación sólida, Vender con elección LIVE/STATIC, fuentes locales Inter/Bricolage y cuadrícula adaptable de una a tres columnas.

### AC-02 — Tipos y tarjetas
Ahora en el campus muestra cierre, stock, zona, hora y vendedor; Anuncios muestra foto cuadrada, título, precio y zona sin stock/reloj. Solo una Ganga real ocupa el destacado y no se duplica en cuadrícula. Reservar abre detalle y conserva confirmación.

### AC-03 — Encontrar y recuperar
Chips de zonas/categorías del servidor, búsqueda y hoja combinan filtros; respuestas obsoletas no sustituyen consulta vigente. Carga con esqueleto, vacío LIVE permite ir a Anuncios y errores permiten reintentar.

### AC-04 — Reserva y revisión
Banner para la reserva ACTIVE no vencida más próxima, con producto, reloj y Ver hacia Reservas. Desaparece al vencer. Revisión Impeccable y evidencia técnica/visual auxiliar sin atribuir aceptación nativa.
