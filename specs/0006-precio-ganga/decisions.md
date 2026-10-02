# 0006 — Decisiones

| ID | Pregunta y opciones | Impacto | Estado | Resolución / fecha |
| --- | --- | --- | --- | --- |
| DEC-01 | Precio de reserva existente frente a ganga posterior. Compartida con 0001 DEC-02. | AC-06, esquema `Reservation`, UI y entrega | Resuelta | 2026-10-01: conserva el precio fijado al reservar. La ganga cambia solo el precio de nuevas reservas y el precio visible. |
| DEC-02 | El contrato anterior decía activar/desactivar; RF-11/12 solo define configurar y activar. | Ruta `PATCH /ganga` | Resuelta | 2026-10-01: no ofrecer desactivación después de activar en MVP; editar configuración antes de activar sí está permitido. |

DEC-01 está incorporada a requisitos, contratos, plan y pruebas previstas; ninguna prueba se ha ejecutado.
