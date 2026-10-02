# 0003 — Decisiones

| ID | Pregunta / fundamento | Impacto | Estado | Resolución / fecha |
| --- | --- | --- | --- | --- |
| DEC-01 | Una `LIVE` agotada por reservas vuelve a tener stock antes de `end_time`: ¿reaparece automáticamente en feed? Corresponde a 0001 DEC-01. | AC-03, RF-04/RF-09 y eventos | Resuelta | 2026-10-01: sí si sigue activa y dentro de horario; README y RF-04/RF-09, ahora sincronizados. |
| DEC-02 | Continuidad de reservas previas tras `end_time`. | AC-04, 0001 AC-04/06 y política de entrega | Resuelta | 2026-10-01: el fin natural impide nuevas reservas, pero el vendedor puede confirmar una reserva previa dentro de sus propios 20 minutos. Si vence sin confirmar, expira y libera stock sin reactivar la publicación. |
| DEC-03 | `start_time` y `end_time` delimitan la disponibilidad, según RF-03 y README. | AC-03, consulta de feed | Resuelta | 2026-10-01: no mostrar antes del inicio ni después del fin. Es una lectura directa del lapso de venta documentado. |

Las decisiones de producto están cerradas; la implementación y las pruebas siguen pendientes.
