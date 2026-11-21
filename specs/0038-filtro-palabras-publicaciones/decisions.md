# 0038 — Decisiones

| ID | Pregunta | Impacto | Estado | Resolución / fundamento |
| --- | --- | --- | --- | --- |
| DEC-01 | ¿Qué contenido bloquear inicialmente? | AC-01/02/05 | Resuelta | 2026-11-21: usuario pide groserías/términos despectivos y delega el análisis. Selección conservadora exacta en policy.md v1; incluir lista acotada de sustancias/objetos del plan original. No se atribuye al campus. |
| DEC-02 | ¿Coincidencias parciales o palabras/frases completas? | AC-02 | Resuelta | 2026-11-21: tokens completos, equivalencia de mayúsculas/acentos vocálicos y ñ preservada; homónimos ambiguos fuera de lista. Sin fuzzy matching ni IA. |
| DEC-03 | ¿Puede evadirse publicando primero y editando después? | AC-03/04 | Resuelta | 2026-11-21: aplicar política también a los campos de texto enviados en PATCH. No barrido histórico ni bloqueo de ventas/stock por texto no enviado; borrador conservado en rechazo. |

No quedan decisiones de producto abiertas para v1. La respuesta del usuario define el criterio y delega la lista exacta; no implica que haya revisado palabra por palabra la selección técnica documentada.
