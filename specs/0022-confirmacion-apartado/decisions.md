# 0022 — Decisiones de planificación

DEC-01 — Alcance solicitado: crear el plan de un modal antes de apartar, a partir de observación del usuario en iPhone. No implementar en este turno. Se mantiene su preferencia de cambios en código, sin Figma.

DEC-02 — Propuesta: aplicar al primer apartado y a «Apartar otra unidad», usando ConfirmationDialog existente, texto «¿Quieres apartar una unidad?», «Sí, apartar» y «Volver». Mostrar producto, una unidad, precio actual y 20 minutos. Evita que una entrada secundaria eluda la confirmación.

DEC-03 — Restricción vigente: abrir/cerrar no reserva, no genera claves ni inicia plazos; solo el servidor crea el apartado. Un envío incierto conserva clave incluso al cerrar y reabrir; una nueva unidad confirmada genera otra después de resolver la anterior.

DEC-04 — Propuesta de recuperación: error dentro del modal, reintento explícito con misma clave; bloqueo de cierre mientras se envía. Cambios de disponibilidad bloquean solicitudes nuevas y cambios de precio conocidos requieren revisar nuevamente. La cotización no queda bloqueada por el cliente.

El usuario aprobó el plan al indicar «aplica el plan» (2026-11-06). DEC-02/04 quedan resueltas con la propuesta descrita. No hay nueva decisión de backend; no se sustituye la autoridad de RF-07 ni la evidencia de 0001.
