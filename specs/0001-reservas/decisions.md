# 0001 — Decisiones de producto pendientes

| ID | Pregunta y opciones | Impacto | Estado | Resolución / fecha |
| --- | --- | --- | --- | --- |
| DEC-01 | Si stock llega a cero por una reserva y luego se libera antes de `end_time`, ¿la publicación vuelve automáticamente al feed? | RF-04/RF-09, consulta del feed, AC-05/06/07 | Resuelta | 2026-10-01: sí, si sigue `ACTIVE` y dentro de horario; README dice que el producto liberado vuelve al feed. Si ya está `FINISHED`, no se reactiva. |
| DEC-02 | Precio al reservar frente a precio vigente al entregar. El esquema actual no guarda precio. | RF-07/RF-12, respuesta y migración | Resuelta | 2026-10-01: el precio unitario queda fijado al confirmar la reserva. Se guarda una instantánea decimal en `Reservation`; ganga o edición posteriores no modifican reservas previas. |
| DEC-03 | Varias reservas del mismo comprador y distinción entre nueva acción y reintento. | RF-07, unicidad/idempotencia, respuesta | Resuelta | 2026-10-01: se permiten varias reservas activas independientes del mismo comprador y publicación. Cada nueva acción usa una clave de idempotencia distinta; reintentar con la misma clave devuelve la misma reserva y no descuenta stock otra vez. |

La regla explícita de RF-05 conserva las reservas previas tras cierre manual. DEC-02/03 están incorporadas a requisitos, contratos y esquema verificado por 0010; las pruebas de negocio del módulo de reservas todavía no se han ejecutado.
