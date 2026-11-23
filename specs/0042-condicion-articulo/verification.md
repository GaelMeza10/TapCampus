# Verificación
| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 T-05 | EV-01 | PASS técnico |
| AC-02 | T-02 T-05 | EV-02 | PASS técnico |
| AC-03 | T-03 T-05 | EV-03 | PASS técnico/composición auxiliar |
| AC-04 | T-04 T-05 | EV-04 | PASS técnico/composición auxiliar |

## EV-01 — Migración y conservación
Desde Backend: `node scripts/verify-product-condition.mjs --apply-local`. Respaldo PostgreSQL restaurado en base aislada `tapcampus_condition_1795327410139`; hashes/recuentos idénticos antes/después del ensayo y aplicación local. Históricos conservan NULL, enum y CHECK impiden condición en LIVE. Respaldo preservado en contenedor PostgreSQL: `/tmp/tapcampus_condition_1795327410139.dump`. Resultado reproducible en `evidence/migration-http.json`. `prisma validate` PASS. El script sin `--apply-local` solo ensaya en una copia.

## EV-02 — Contrato y regresión
El mismo script ejecuta 20 solicitudes HTTP con Nest/DTO/JWT/servicio y PostgreSQL reales en copia aislada: POST NEW/USED persistidos, faltante/null/valor ajeno rechazados; PATCH cambia/conserva, histórico admite actualización ajena al campo y elección posterior; ajeno 403/anónimo 401; feed/detalle devuelven condición sin contacto público/configuración privada; LIVE rechaza y CHECK protege escritura SQL directa. `npm.cmd run test:phase2`: PASS, base original conservada y evidencia en `evidence/phase2.json`. Fixtures válidos STATIC de fases 2/3/casos límite incorporan condición explícita; no se modifica regla de negocio para conservar fixtures antiguos.

Backend: `npm.cmd run build`, `npm.cmd run lint`, `npm.cmd test -- --runInBand`: 11 suites/102 pruebas PASS.

## EV-03 — Formulario
Frontend: `npm.cmd test -- --watch=false`: 19 suites/144 pruebas PASS. Formulario comprueba elección inicialmente vacía, error obligatorio, precarga USED, cambio NEW enviado solo como PATCH, y conservación tras error junto con foto/borrador. Validación STATIC omite horario/stock y exige condición. Foco incluye condición después de descripción. `node node_modules/typescript/bin/tsc --noEmit` PASS. Exports Android/iOS en `.local/condition-export` PASS.

## EV-04 — Lectura y composición
Desde Frontend: `node scripts/verify-redesign-ui.cjs --condition-only`: 16 capturas PASS (15 de condición y una de pestañas), sin excepciones/recursos ausentes/desbordamiento. NEW/USED en Explorar, detalle, selector y formulario a 320/390/430; etiqueta neutral coherente con DESIGN.md y refs. `condition-label.test.tsx` comprueba NEW/USED y ausencia para null/LIVE. Datos de fixture explícitos, sin atribuir condición a anuncios reales antiguos. Capturas y `visual.json` en `evidence/`.

Revisión visual: sin desbordamientos ni texto truncado observados; selección y cancelación usan Sheet/OptionGrid existentes, controles de mínimo 48/52. Evidencia auxiliar web; lector, foco y gestos nativos conservan aceptación separada. El arreglo de áreas seguras no tiene plan nuevo ni pertenece al alcance de este plan: se registra como corrección directa en 0041 EV-04.

Convergencia: requisitos/arquitectura/UX/flujos/US, TASKS 5.32 e índice/trazabilidad sincronizados; ejecutar `node scripts/check-sdd.mjs`.
