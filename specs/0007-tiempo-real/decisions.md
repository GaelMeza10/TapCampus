# 0007 — Decisiones

| ID | Opciones y fundamento | Impacto | Estado | Resolución / fecha |
| --- | --- | --- | --- | --- |
| DEC-01 | `docs/03_ARCHITECTURE.md` permite room global o por zona. | Suscripción Socket.io | Resuelta | 2026-10-01: room global para el MVP; el cliente aplica IDs visibles y reconsulta al reconectar. No cambia la API de eventos. |
| DEC-02 | Transmitir un evento por cada cambio efectivo o por cada intento, incluido retry. | Coherencia de feed | Resuelta | 2026-10-01: emitir después de confirmar la transacción, solo si el estado cambió. |

No hay decisión de producto abierta en este feature. El contenido exacto de las operaciones depende de 0001/0003/0006.
