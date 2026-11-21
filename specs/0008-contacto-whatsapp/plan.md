# 0008 — Plan técnico

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

## Diseño

Actualización normativa 2026-11-21: aplicar [0039](../0039-contacto-live-sin-reserva/plan.md) para ampliar consulta previa LIVE. Sus EV nuevas sustituyen la expectativa histórica de ausencia de teléfono en detalle; no cambian acceso a teléfonos de compradores.

Fase 3 usa proyección explícita de respuesta de reservas según actor y vigencia; prueba aislamiento HTTP y ausencia de contacto tras resolución para vendedor. No devolver relaciones Prisma completas. T-05 distingue evidencia API de URL/Linking pendientes.

- En backend, usar `User.phone` únicamente en detalle visible LIVE/STATIC conforme a 0039 y en reservas autorizadas según actor/plazo. Feed/eventos sin teléfonos; compradores/espectadores no se exponen. Probar lectura desde cuentas ajenas.
- El móvil toma el título `LIVE` de `reservation.publicationTitle` (0001 AC-10) para funcionar tras agotarse el stock; para `STATIC` usa el detalle. No consulta un detalle público oculto para construir el enlace.
- Validar al registrar diez dígitos nacionales con o sin `+52` y persistir `+52XXXXXXXXXX`. Revisar datos históricos antes de transformarlos; rechazar valores ambiguos. Construir `wa.me/52XXXXXXXXXX` desde el valor canónico sin duplicar prefijo.
- En móvil, construir URL con número normalizado y `encodeURIComponent`: consulta previa desde detalle visible LIVE/STATIC con texto de interés; desde reserva confirmada con texto de coordinación. Manejar fallo de `Linking.openURL` sin perder pantalla ni estado.
- El enlace no envía mensaje automáticamente ni prueba que la venta ocurrió; la entrega de `LIVE` sigue confirmada por vendedor en 0001.

## Constitución

| Principio | Cumplimiento |
| --- | --- |
| I–II | RF-13/RF-06/RF-07 → AC-01..05 → T → EV; decisión de formato resuelta. |
| III | No cambia inventario ni reserva; usa respuesta confirmada. |
| IV | Teléfonos expuestos solo a actores autorizados y enlace definido. |
| V | Pruebas de privacidad, número, codificación y fallo de apertura. |
| VI | Sin chat ni pago integrado. |

## Verificación y orden

Depende de 0002 usuario/teléfono, del detalle estático preparado en 0004 y de la respuesta de reserva en vivo de 0001; no exige que el contacto de 0004 esté ya verificado. Probar API con compradores/vendedores distintos y UI con enlace interceptado; comprobar que ningún teléfono protegido sale en feed ni Socket.io.
