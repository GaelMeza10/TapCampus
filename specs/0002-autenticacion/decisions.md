# 0002 — Decisiones

| ID | Opciones y fundamento | Impacto | Estado | Resolución / fecha |
| --- | --- | --- | --- | --- |
| DEC-01 | Mantener el contrato inglés de `docs/03_ARCHITECTURE.md` y `Backend/prisma/schema.prisma`, o volver a campos españoles del código antiguo. | DTO, frontend, Prisma y JWT | Resuelta | 2026-10-01: usar `name/email/password/phone` en API y `User` en Prisma. El código español es deuda de migración, no una fuente de producto. |
| DEC-02 | Persistir JWT en `AsyncStorage` mencionado históricamente, o en `expo-secure-store` ya instalado. | Sesión móvil | Resuelta | 2026-10-01: `expo-secure-store`, ya documentado en US-02 y presente en cliente móvil. |
| DEC-03 | Formato de teléfono mexicano para registro y enlace. | RF-02/RF-13, DTO, datos históricos | Resuelta | 2026-10-01: aceptar diez dígitos nacionales con o sin prefijo `+52`, de cualquier región de México. Normalizar y almacenar como `+52` seguido de diez dígitos; rechazar otros países y entradas ambiguas. |

El contrato de campos/Prisma y teléfono está resuelto. El backend de registro/login y compilación quedó comprobado en EV-07 (0010); guards e integración móvil conservan sus verificaciones pendientes.
