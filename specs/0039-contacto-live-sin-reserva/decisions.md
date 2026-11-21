# 0039 — Decisiones

| ID | Pregunta | Impacto | Estado | Resolución / fundamento |
| --- | --- | --- | --- | --- |
| DEC-01 | ¿Puede consultarse al vendedor LIVE sin reservar? | AC-01/02/04 | Resuelta | 2026-11-21: sí, desde detalle visible según plan integral y autorización de solucionar las diferencias. Sustituye la restricción anterior de RF-07/RF-13/0008; la evidencia anterior conserva su fecha/contrato. |
| DEC-02 | ¿Esto expone a quienes solo ven publicaciones? | AC-02/03 | Resuelta | 2026-11-21: no; solo teléfono del vendedor del detalle visible. Feed/eventos sin teléfonos; buyerContact únicamente para vendedor de reserva ACTIVE no vencida. |

Se conserva formato mexicano de 0008 DEC-01 y contacto STATIC directo de DEC-02 histórico.

DEC-03 (técnica, 2026-11-21): fallo de apertura usa mensaje local sin el reintento de carga del producto; el botón Contactar disponible repite la apertura expresamente. Los errores de red conservan su propio reintento de carga. Sin navegación nueva ni envío automático. API anterior sin sellerContact oculta la consulta previa y conserva Apartar.
