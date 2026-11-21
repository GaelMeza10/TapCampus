# 0039 — Plan técnico

Estado: Ejecutado técnicamente; aceptación nativa pendiente | Especificación: spec.md

Resultado 2026-11-21: detalle visible LIVE/STATIC con contacto actual y acción LIVE secundaria, sin escrituras ni nueva guarda. Se conservan proyecciones, privacidad del comprador y contacto desde reserva. Errores de apertura separados de errores de carga; volver a pulsar Contactar reintenta abrir, sin recargar ni reservar. 102 pruebas backend/134 frontend, 674 HTTP, 16 capturas auxiliares y exports Android/iOS PASS; evidencia en verification.md.

## Diseño y compatibilidad

AC-01/02: adaptar PublicationsService.detail tras validar visiblePublications para obtener únicamente el phone actual del vendedor en ambos tipos. Mantener proyección pública de 0037 sin configuración de ofertas. No añadir contacto al feed, mine, eventos o relación seller común. Consulta explícita actual del teléfono evita usar una copia obsoleta tras edición de perfil.

AC-01/04: añadir acción secundaria en Frontend/src/app/publication/[id].tsx usando sellerContact del detalle y reserved:false, manteniendo Apartar como principal. Reusar whatsapp.ts; contacto por reserva usa la publicación/título de la proyección autorizada con reserved:true. Usar tipos públicos ya separados en marketplace.ts; bloquear durante reserva pendiente y reconsultar tras retorno según sincronización vigente.

AC-02/03: no cambiar ReservationsService.response ni relajar permisos; añadir regresión observable desde comprador/vendedor/ajeno y tras cancelación/expiración. El plan afecta exposición del teléfono del vendedor, no del comprador. STATIC conserva comportamiento.

AC-04/05: manejar ausencia de campo en backend antiguo ocultando la acción secundaria, sin inventar número ni forzar reserva como consulta ficticia. Desplegar backend primero y luego cliente; cambio aditivo de sellerContact en detalle. Enlace HTTPS wa.me ya existente, sin dependencia ni permiso móvil nuevo.

## Datos, API, riesgos y reversión

Sin migración ni seed. GET detalle conserva 200/404 y visibilidad; teléfonos provienen de User actual y mantienen formato canónico. El feed no necesita teléfono para construir tarjetas. La consulta no garantiza disponibilidad ni una reserva: texto explícito de interés. Revertir la acción/expansión del detalle de este cambio solamente, conservando contacto autorizado de reservas. Documentar que el contrato de lectura previo ha sido sustituido, sin cambiar resultados históricos.

## Constitución

| Principio | Aplicación |
| --- | --- |
| I | Contrato y escenarios antes de implementar el botón/API. |
| II | RF-06/07/13 → US-09/11 → AC-01..05 → T → EV. |
| III | Consulta sin escritura; precio, plazo e idempotencia intactos. |
| IV | Proyección phone explícita y privacidad estricta del comprador. |
| V | HTTP, Linking simulado y apertura nativa diferenciados. |
| VI | Sin chat propio, mensajes automáticos ni rediseño. |

## Orden y verificación

Después de 0037: T-01 → T-02 → T-03 → T-04. HTTP real/Nest: LIVE visible antes de reserva, STATIC, 404 agotada/futura/finalizada, ausencia feed/eventos, cuenta ajena en reservas y teléfono actualizado. Frontend: mensajes reserved false/true, título especial, fallo al abrir y reserva con detalle 404. Dispositivo iOS/Android según disponibilidad; registrar el objetivo probado y dejar el otro pendiente si corresponde. Tipos/suites apropiadas, exports y check-sdd. No enviar mensajes de prueba a terceros: observar destinatario/texto antes de enviarlos basta.
