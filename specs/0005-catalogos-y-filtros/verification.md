# 0005 — Verificación

Estado: **Seed y backend fase 2 verificados; móvil pendiente** | Fecha: 2026-10-05

| AC | Tarea(s) | Evidencia requerida | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-02, T-05, T-06 | EV-01 plan; EV-05 seed; EV-06 seed repetido/catálogos HTTP exactos | Aprobado backend |
| AC-02 | T-03, T-04, T-05, T-06 | EV-02 plan móvil; EV-06 matriz HTTP zona/categoría/tipo AND | Aprobado backend; UI pendiente |
| AC-03 | T-02, T-03, T-05, T-06 | EV-03 plan; EV-06 queries inválidas 400 y vacío 200 | Aprobado backend |
| AC-04 | T-04, T-05 | EV-04: filtrado móvil sin permiso GPS | Pendiente |

## Convergencia

### EV-05 — Seed y referencias (T-01)

`npm run test:infra` en Backend con PostgreSQL 16.15/Node 24.13 y `PG_TOOLS_CONTAINER=backend-postgres-1`: salida 0. [0010 EV-05](../0010-infraestructura-y-base-de-datos/verification.md) acredita dos ejecuciones sobre base vacía y copia poblada, catálogo exacto 5/8, hashes idénticos al repetir y publicaciones con FK válidas. Sin remapeo para zona referenciada, transacción íntegramente revertida. En la base local configurada, respaldo/restore y ensayo precedieron al seed doble, también aprobado. T-01 completa; EV-01 conserva la parte HTTP y AC-01 sigue sin aceptación completa.

### EV-06 — Catálogos y filtros HTTP fase 2

T-02/T-03/T-06, AC-01/02/03, 2026-10-05. [Entorno/comandos y resultados compartidos con 0003](../0003-publicaciones-en-vivo/verification.md); [resumen](../0003-publicaciones-en-vivo/evidence/phase2.json). `npm run test:phase2` en Backend, salida 0, PostgreSQL 16.15 aislado con seed de fase 1 ejecutado dos veces: inventario idéntico al repetir. build/tsc, 9 unitarias, 1 E2E existente y lint aprobaron; `node scripts/check-sdd.mjs` desde raíz salida 0.

GET zones →200 con cinco nombres exactos; categories por LIVE/STATIC →200 con cuatro nombres exactos cada uno y type correcto; sin type devuelve los ocho. Feed sin filtros, con type, zona, categoría y combinaciones de tres filtros compara IDs contra intersección esperada; orden estable, visibilidad servidor y proyección privada. Combinación válida sin coincidencias →200 []. Tipo desconocido, IDs cero/negativos/fraccionarios/exponenciales/repetidos/ausentes/fuera de rango, type repetido, categoría cruzada y query extra →400. Queries extra en catálogos →400. Base original sin cambios.

T-01/T-02/T-03/T-06 completas; T-04/T-05 y AC-04 móvil sin GPS pendientes. No se declara expediente Verificado completo.
