# 0038 — Verificación y convergencia

Estado: En verificación; servidor/formulario aprobados técnicamente, aceptación nativa pendiente | Fecha: 2026-11-21

## Entorno y comandos ejecutados

Windows/Node v24.13.0; PostgreSQL/Redis Docker con BD y BULLMQ_PREFIX exclusivos por prueba. Ambas integraciones comprueban hashes/recuentos originales antes/después idénticos. No migración/seed ni cambios de productos reales; cambios de texto legado se simulan solo en fixtures. Política v1 local, sin nuevas dependencias ni descargas de vocabulario al móvil.

- Backend: `npm.cmd test -- --runInBand` → 11 suites/102 pruebas PASS. `content-policy.spec.ts` aporta 62 casos (cada entrada, negativos, normalización y cotejo exacto del documento); `content-enforcement.spec.ts` prueba que create/queue/eventos no se llaman al rechazar. Tipos completos, build y lint PASS.
- `npm.cmd run test:phase2`: 283 solicitudes/11 grupos PASS en .local/verification/tapcampus_phase2_1795302718950. Rechazos POST/PATCH de LIVE/STATIC, código/campos/mensaje, permiso/estado previos al filtro, falsos positivos y texto histórico no enviado; cero filas nuevas o mutaciones en rechazos. [phase2.json](evidence/phase2.json).
- `npm.cmd run test:phase3`: 374 solicitudes/19 grupos PASS en .local/verification/tapcampus_phase3_1795302887622. Regresión de última pieza 1×201/49×409, idempotencia, resolución, 0037, reinicio y dos clientes Socket.io. [phase3.json](evidence/phase3.json).
- Frontend: `npm.cmd test -- --watch=false` → 16 suites/124 pruebas PASS; tipos PASS. Parser solo admite campos conocidos; resumen/errores locales, corrección independiente, foto/URL/borrador conservados y envío único. Exportaciones Android/iOS en .local/export-0038 PASS.
- Revisión visual auxiliar y foco a varios tamaños: [0034 EV-02/04/05](../0034-errores-formulario-publicacion/verification.md), 19 capturas; [revisión](../0034-errores-formulario-publicacion/evidence/review.md). No sustituye recorrido móvil físico.
- Raíz: `node scripts/check-sdd.mjs` y `git diff --check` PASS.
- [summary.json](evidence/summary.json) conserva recuentos, límites y SHA-256 del metadata.json de la exportación final.

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02, T-04 | EV-01: POST HTTP real ambos tipos/campos y 400 con código/campos sin lista; SQL sin filas nuevas, servicio sin llamadas create/queue/eventos | Aprobado |
| AC-02 | T-01, T-04 | EV-02: 62 casos de política exacta, acentos/ñ/Unicode/frases y negativos; creación de textos legítimos por HTTP | Aprobado |
| AC-03 | T-02, T-04 | EV-03: PATCH parcial, stock/precio sin texto histórico, ajeno 403 y vendida 409; filas idénticas en rechazo y corrección permitida | Aprobado HTTP/SQL |
| AC-04 | T-03, T-04, T-05 | EV-04: parser, aviso/campos, foto/URL/borrador conservados, corrección y reenvío sin repetir upload; capturas auxiliares | Técnico aprobado; aceptación nativa pendiente |
| AC-05 | T-01, T-04, T-05 | EV-05: cotejo policy.md, tipos/build/lint, 102 backend/124 frontend y 657 HTTP sin regresión | Aprobado técnico |

## Convergencia

T-01..04 completas técnicamente. T-05 y TASKS 5.29 conservan la aceptación nativa: comprobar en teléfono teclado/lector, foco, foto/catálogos y recuperación del rechazo contra esta API. No se inventa evidencia de hardware ni se cierra el MVP. 0034 mantiene sus propios AC/EV y límites. La normalización compara sin censurar/reemplazar el texto persistido y no amplía la lista más allá de v1.
