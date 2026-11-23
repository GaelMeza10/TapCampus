# 0043 — Filtros, detalles y Mi cuenta

Estado: Verificado (técnico y composición auxiliar) | Fecha: 2026-11-21

RF-02/04/05c/06/07/12/13, US-02/05c/06/09/11, TASKS 5.33. Solicitud del usuario: implementar estas superficies según DESIGN.md y refs, terminar con revisión Impeccable. Conserva 0041/0042, áreas seguras estables, edición 0033 y confirmación/idempotencia 0022. Sin cambios de backend ni migración.

### AC-01 — Filtros fieles y reales
Hoja con asa, cerrar, chips envolventes por zona/categoría y botones fijos Aplicar/Restablecer. Consulta real del tipo/búsqueda sin filtros para calcular facetas: cada dimensión cuenta con la otra dimensión seleccionada; total es intersección. Conteos son publicaciones, no vendedores. Carga/fallo no inventan ceros y permiten reintentar/aplicar sin conteo. Cerrar descarta borrador; aplicar combina filtros. Ceros conocidos no seleccionables salvo opción ya seleccionada; respuestas anteriores ignoradas.

### AC-02 — Detalle de anuncio
Foto grande, ANUNCIO/condición/categoría reales, título y precio adaptables, ubicación blanca con pin, descripción y vendedor con iniciales. Pie con explicación sin reserva y contacto WhatsApp. No stock/reloj/reserva ni ubicación exacta inventada; sin Reportar mientras 0009 permanezca fuera del alcance.

### AC-03 — Detalle en vivo
Mismo lenguaje: foto, cierre en minutos y stock con texto/semántica de urgencia, precio vigente/anterior válidos, zona/hora/vendedor visibles y pie Reservar/contacto. Conservar confirmación antes de enviar, clave idempotente/reintentos, múltiples reservas y reservas vigentes tras fin/404. El CTA visible Apartar una unidad se conserva por contrato de confirmación.

### AC-04 — Mi cuenta
Encabezado de campus desplazable, identidad real con avatar contorneado, Editar datos con borde, contacto agrupado y correo Solo lectura, ayuda WhatsApp y salida con contorno rojo. Conservar edición, errores/carga/éxito, bloqueo durante guardado/salida, navegación y correo no editable.

### AC-05 — Calidad
Tokens/design/ref prevalecen; controles flexibles, texto largo/ampliado, safe areas sin duplicado, estados recuperables. Pruebas, tipos, exports y capturas auxiliares revisadas con Impeccable polish; hardware separado.
