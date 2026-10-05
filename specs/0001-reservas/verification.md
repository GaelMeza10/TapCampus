# 0001 — Verificación y convergencia

Estado: **Backend fase 3 verificado; móvil pendiente** | Fecha: 2026-10-05

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-02, T-03, T-06, T-07, T-08 | EV-01: alta, stock, fecha, precio/contacto | Aprobado backend; móvil pendiente |
| AC-02 | T-03, T-07, T-08 | EV-02: 50 compradores/claves, bloqueo SQL | Aprobado: 1×201/49×409 |
| AC-03 | T-03, T-06, T-07, T-08 | EV-03: rechazos sin mutación | Aprobado backend |
| AC-04 | T-04, T-07, T-08 | EV-04: vendedor, plazo, terminales/carreras | Aprobado backend |
| AC-05 | T-04, T-06, T-07, T-08 | EV-05: comprador, devolución única | Aprobado backend; móvil pendiente |
| AC-06 | T-02, T-05, T-07, T-08 | EV-06: worker, duplicado, reinicio, job perdido | Aprobado backend |
| AC-07 | T-04, T-05, T-06, T-07, T-08 | EV-07: cierre/fin, continuidad/eventos | Aprobado backend; móvil pendiente |
| AC-08 | T-05, T-06, T-07, T-08 | EV-08: devolución/feed ACTIVE/FINISHED | Aprobado backend; móvil pendiente |
| AC-09 | T-01, T-02, T-03, T-06, T-07, T-08 | EV-09: varias reservas, misma clave/cruzada | Aprobado backend; móvil pendiente |

## Entorno y reproducción

Windows/PowerShell, Node 24.13.0, PostgreSQL 16.15 (backend-postgres-1, puerto 6000), Redis 7.4.11 (backend-redis-1, puerto 6379, volumen/AOF/noeviction). Nest common/core 12.1.0, websockets/platform-socket.io 12.0.1, Prisma 7.10.0, BullMQ 6.3.11, ioredis 6.0.0 y Socket.io/client 4.8.4; lock fija las versiones. DATABASE_URL/JWT_SECRET locales, REDIS_URL default redis://localhost:6379. Cuenta SQL con permiso de crear bases de ensayo.

Desde Backend:

```powershell
docker compose up -d redis
node node_modules/prisma/build/index.js migrate status
node node_modules/prisma/build/index.js migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
npm run build
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run test:phase2
npm run test:phase3
```

Desde raíz: `node scripts/check-sdd.mjs`. Aprobados build/tsc/lint, 5 suites/9 unitarias, 1 E2E smoke, cuatro migraciones al día/diff vacío y suites fases 2/3. [phase3.json](evidence/phase3.json): dieciséis grupos PASS, 311 peticiones, inventarios/hash originales idénticos. [phase2-recheck.json](evidence/phase2-recheck.json) revalida fases 1/2. [verify-phase3.mjs](../../Backend/scripts/verify-phase3.mjs) crea BD tapcampus_phase3_<timestamp> y namespace Redis exclusivos, migra/siembra solo allí, conserva fixtures/logs en Backend/.local/verification. No escribe datos/esquema originales ni usa FLUSHDB; resumen sin credenciales/teléfonos.

Aceleración: únicamente reserved_at de fixtures se adelanta por SQL; el plazo de producción sigue fijo en 1 200 000 ms, comprobado junto al delay/fecha del job original. Reinicio real del proceso Node que contiene los workers, conservando Redis y jobs pendientes. Ganga/fin también se prueban con delays reales cortos. pg interpreta timestamp como UTC, igual que Prisma.

## Registro AC → T → EV

- **EV-01**, T-01/T-03/T-08: JWT ausente/inválido/expirado →401; cuerpo/UUID/clave inválidos/extras →400, inexistente →404. Alta 201 ACTIVE, precio 12.50, contacto canónico correcto, plazo exacto, stock 3→2 y job delayed hasta expiresAt. Consultas propias/vendedor/detalle separan reservas; ajeno 403. Fases 1/2 revalidadas con migraciones/seed doble, auth/hash/JWT, uploads, catálogos, CRUD/visibilidad/permisos/stock. Dependencia mínima añadida: Redis y paquetes; sin migraciones.
- **EV-02**, T-03/T-08: 50 compradores con UUID distintos simultáneos por stock 1 →**1×201/49×409**, una reserva SQL/stock cero/un evento por cliente. Bloqueo SQL externo retiene HTTP sin evento; tras confirmar stock cero, HTTP relee y rechaza 409 sin mutación.
- **EV-03**, T-03/T-08: STATIC, FINISHED, futura, vencida y agotada →409; comparación de fila completa antes/después demuestra ausencia de mutación.
- **EV-04**, T-04/T-08: solo vendedor completa, comprador/ajeno 403. Tras end_time/FINISHED aún completa antes de sus 20 min. COMPLETED conserva precio/stock, complete/cancel repetidas 409, job atrasado sin cambio. Bloqueo retenido hasta después del plazo hace que ambas acciones relean el tiempo y rechacen 409.
- **EV-05**, T-04/T-08: comprador cancela y devuelve una pieza, vendedor/ajeno 403, segunda cancel/complete 409; job repetido no devuelve más. Diez carreras complete/cancel/worker (cinco vigentes/cinco vencidas) conservan una transición y stock correcto.
- **EV-06**, T-05/T-08: job temprano no actúa; vencido EXPIRED/stock uno; duplicado sin otra devolución/evento; ACTIVE ya vencida rechaza acciones 409. Proceso detenido conserva jobs en Redis y otro proceso los consume; job eliminado se recupera al arrancar y otro job perdido se concilia periódicamente (250 ms ensayo, 30 s default). Reejecución tras recuperación conserva stock uno.
- **EV-07**, T-04/T-05/T-08: finish propio 200 FINISHED, ajeno 403, sin JWT 401, repetido 409; nuevas reservas 409, reserva previa intacta/confirmable. Fin natural/job repetido produce una transición/evento publication_expired. Cambios efectivos emiten stock_updated exacto tras commit a dos clientes.
- **EV-08**, T-05/T-08: reserva 1→0 oculta; cancelación/expiración 0→1 reaparece si ACTIVE/en horario. Expiración después del fin devuelve stock sin reactivar FINISHED.
- **EV-09**, T-03/T-08: dos claves del mismo comprador crean reservas independientes visibles a ambos actores. Edición posterior conserva unit_price. **50 reintentos misma clave: 1×201/49×200, un ID/descuento/evento**. Mayúsculas UUID devuelven mismo ID; reintento terminal devuelve estado actual 200. Clave cruzada 409 incluso simultáneamente (201/409 y una pieza); clave ausente/inválida 400.

### EV-10 — Dependencia de datos, histórica

2026-10-04, T-02: [0010 EV-02/03/04](../0010-infraestructura-y-base-de-datos/verification.md) acredita Decimal obligatorio, UUID/unicidad comprador-clave, varias reservas por comprador/publicación, índice status/fecha, respaldo restaurado/migración segura y rechazo del backfill sin evidencia. Se conserva separada de la nueva evidencia HTTP/worker.

## Convergencia y límites

T-01/T-03/T-04/T-05/T-08 completas, T-02 histórica conservada. Fase 3 cubierta; T-06/T-07 conservan integración/convergencia móvil. Backend usa transacciones interactivas/bloqueos en orden, productores tras commit y conciliación independiente de jobs. Sin bloqueo backend local.

Ensayos fallidos corregidos antes de la ejecución final: BullMQ 6 no tiene Queue.client (sondeo con ioredis); pg interpretaba fechas en zona local (UTC explícito); puerto distinto tras reinicio invalidaba imagen absoluta de fixture (path local conservado); inferencia circular en paginación (tipos explícitos). No se utilizan fallos como aprobación. Advertencias engines Angular/CLI en Node 24.13 sin fallo de checks finales.
