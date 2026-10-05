# 0008 — Plan técnico

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

## Diseño

Fase 3 usa proyección explícita de respuesta de reservas según actor y vigencia; prueba aislamiento HTTP y ausencia de contacto tras resolución para vendedor. No devolver relaciones Prisma completas. T-05 distingue evidencia API de URL/Linking pendientes.

- En backend, usar `User.phone` únicamente en las respuestas autorizadas: detalle `STATIC` activo, respuesta de reserva `LIVE` al comprador y detalle de reserva al vendedor propietario. No incluir teléfonos protegidos en `GET /publications` ni eventos Socket.io. Probar lectura desde cuentas ajenas.
- Validar al registrar diez dígitos nacionales con o sin `+52` y persistir `+52XXXXXXXXXX`. Revisar datos históricos antes de transformarlos; rechazar valores ambiguos. Construir `wa.me/52XXXXXXXXXX` desde el valor canónico sin duplicar prefijo.
- En móvil, construir URL con número normalizado y `encodeURIComponent` para texto con título. Para `LIVE`, mostrar botón solo tras respuesta de reserva confirmada; para `STATIC`, desde detalle. Antes de abrir, manejar imposibilidad de `Linking.openURL` con mensaje visible.
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
