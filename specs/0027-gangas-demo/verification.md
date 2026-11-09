# 0027 — Verificación

Estado: Verificado (datos locales y HTTP) | Fecha: 2026-11-09

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-02, T-03 | EV-01 | PASS |
| AC-02 | T-01, T-02, T-03 | EV-02 | PASS |
| AC-03 | T-02, T-03 | EV-03 | PASS técnico; dispositivo separado |

## EV-01 — Ejemplos y API real

`SEED_PUBLIC_BASE_URL=http://10.41.60.121:3000 node scripts/verify-demo-gangas.cjs` crea tres LIVE con UUID 27000000-0000-4000-8000-000000000001..003. Brownie $30→$24, café $35→$27 y torta $62→$49; ocho unidades cada uno, horario siete días, ganga manual ya activa como fixture y fotos ilustrativas existentes. El GET público /publications?type=LIVE en LAN devuelve los tres, precio previo/actual e is_ganga_active=true; tres fotos PNG HTTP 200. [Evidencia HTTP](evidence/feed.json). No modifica la activación real de ganga ni crea funciones nuevas.

## EV-02 — Repetición y conservación

[Seed real en PostgreSQL local](evidence/seed.json): primera ejecución 3, segunda 0. Hashes antes/después idénticos para publicaciones anteriores, usuarios, reservas, zonas y categorías. No se restablecen precios/horarios/stock previos ni se crean cuentas. Vendedor tomado de una fila Demo histórica, sin registrar contacto. Script independiente optativo; seed normal 0012 sigue creando 24 ejemplos históricos. `npm.cmd run db:demo:gangas` ejecuta solo este seed; `npm.cmd run test:demo:gangas` reproduce comprobación de conservación/idempotencia sobre el entorno configurado. No ejecutar esta última como prueba aislada en producción: agrega fixtures.

## EV-03 — Comandos y convergencia

Backend build, tsc --noEmit (incluye scripts), lint y 7 suites/13 pruebas PASS en la revisión compartida 0026/0027. No se añadieron mocks que simulen garantías de base de datos; la evidencia es ejecución doble y comparación real. check-sdd/diff PASS y TASKS/índice/docs09/docs10 sincronizados. Sin migración ni dependencias nuevas. Recorrido en iPhone y UAT de ganga siguen separados; no se cierra fase 5.
