# 0008 — Decisiones

| ID | Pregunta y opciones | Impacto | Estado | Resolución / fecha |
| --- | --- | --- | --- | --- |
| DEC-01 | Formatos de entrada y normalización de teléfono mexicano. | RF-02/RF-13, DTO registro, datos existentes y URL `wa.me` | Resuelta | 2026-10-01: aceptar diez dígitos nacionales con o sin `+52`, sin limitar lada o región. Persistir `+52` seguido de diez dígitos; `wa.me` usa solo los doce dígitos, sin `+` ni prefijo duplicado. |
| DEC-02 | Contacto directo en `STATIC` o reserva previa. | AC-02 y privacidad | Resuelta | 2026-10-01: directo sin reserva, según README, RF-06 actualizado y flujo estático. |

DEC-01 está incorporada a 0002 y a las reglas de validación/normalización. Implementación y pruebas pendientes.
