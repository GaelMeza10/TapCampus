# 0003 — Verificación

Estado: **Backend fases 2/3 verificado; UI pendiente** | Fecha: 2026-10-05

| AC | Tarea(s) | Evidencia requerida | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02, T-03, T-06, T-07, T-08 | EV-01 plan integrado; EV-08/09 upload y creación 201 | Aprobado backend; UI pendiente |
| AC-02 | T-02, T-03, T-07, T-08 | EV-02 plan; EV-08/09 matriz 400 sin filas parciales | Aprobado backend |
| AC-03 | T-01, T-04, T-06, T-07, T-08 | EV-03 plan; EV-09 visibilidad HTTP y end_time ISO | Aprobado backend; temporizador móvil pendiente |
| AC-04 | T-01, T-04, T-07, T-09 | EV-04: fin persistente, evento único, reserva previa confirmable | Aprobado backend fase 3 |
| AC-05 | T-05, T-07, T-08, T-09 | EV-05 carrera HTTP reserva/venta; EV-10 ventas concurrentes y bloqueo SQL | Aprobado backend fases 2/3 |
| AC-06 | T-03, T-05, T-06, T-07, T-08 | EV-06 plan; EV-09/10 edición, 403 ajeno, reservas intactas | Aprobado backend fases 2/3; UI pendiente |
| AC-07 | T-06, T-07, T-09 | EV-07: cierre con reserva previa y permisos | Aprobado backend; UI pendiente |

## Convergencia

### Evidencia adicional fase 3 — T-01/T-04/T-05/T-09

Desde Backend: npm run build, npm run test:phase2 y npm run test:phase3. [0001 verification](../0001-reservas/verification.md) registra entorno/comandos; [phase3.json](../0001-reservas/evidence/phase3.json) contiene dieciséis grupos PASS/311 HTTP, PostgreSQL 16.15/Redis 7.4.11 y hashes originales idénticos. La evidencia de fase 2 siguiente se conserva histórica.

- EV-04, AC-03/04, T-01/T-04/T-09: job fin creado por API y conciliación persisten FINISHED/publication_expired una vez en dos clientes; duplicado no muta/emite. Nuevas reservas 409, vendedor completa previa tras end_time antes de sus 20 min. Expiración posterior libera sin reactivar el feed.
- EV-05, AC-05/06, T-05/T-09: diez carreras HTTP reservations/physical-sale por stock uno, un ganador por carrera, stock cero/un evento. Edición efectiva emite stock_updated, reservas/precio intactos. Bloqueo externo retiene reserva hasta commit y relee stock/plazo.
- EV-07, AC-07, T-09: finish propio LIVE ACTIVE 200 FINISHED, ajeno 403, sin JWT 401, repetido 409, nuevas reservas 409; reserva previa intacta/confirmable, evento único.

T-01/T-04/T-05/T-09 completas; T-06/T-07 conservan UI/convergencia completa. Lo descrito como pendiente en la evidencia histórica de fase 2 respecto a reservas/jobs/eventos ya se verificó aquí. Sin bloqueo backend.

### Entorno y comandos de fase 2

2026-10-05, Windows/PowerShell, Node 24.13.0, NestJS 12.1.0, Prisma CLI/runtime 7.10.0, TypeScript 6.0.3, PostgreSQL 16.15 en `backend-postgres-1`, puerto 6000. Git inicial limpio. Se inició el contenedor existente; no se migró/sembró la BD original. Inventario, migrate status y diff confirmaron fase 1: cuatro migraciones, CHECK, 5 zonas/8 categorías y tablas de negocio vacías. Únicas dependencias añadidas: tipos Multer/Passport JWT y sus tipos transitivos; lock conserva todas las versiones existentes. npm mostró advertencias de engines de herramientas Angular del CLI bajo Node 24.13; todas las comprobaciones siguientes aprobaron.

Desde `Backend/`:

```powershell
npm run db:inventory
node node_modules/prisma/build/index.js migrate status
node node_modules/prisma/build/index.js migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
npm run build
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint
npm run test:phase2
```

Salidas 0: 5 suites/9 unitarias, 1 suite/1 E2E existente y diez grupos HTTP/SQL de fase 2. Desde raíz: `node scripts/check-sdd.mjs`, salida 0 tras convergencia. Script reproducible: [verify-phase2.mjs](../../Backend/scripts/verify-phase2.mjs). [phase2.json](evidence/phase2.json) registra BD aislada, entorno, grupos y hashes idénticos de la BD original antes/después. Datos sintéticos; JWT/contraseñas no aparecen en resumen. BD y archivos del ensayo se conservan en `.local/verification/` (ignorados), sin borrar datos preexistentes.

### EV-08 — Upload autenticado y almacenamiento

T-02/T-08, AC-01/02: PNG multipart con `file` →201 image_url absoluto UUID, GET imagen →200 image/png, bytes idénticos y nosniff. Token ausente/inválido →401 antes de escribir. Archivo ausente/vacío, contenido falso etiquetado PNG, SVG, campo incorrecto/extra y dos archivos →400; >5 MiB →413. Directorio sin archivos residuales tras rechazos. MIME del contenido prevalece sobre etiqueta del cliente. PUBLIC_BASE_URL produce origen externo utilizable como image_url; GET local del path funciona. Fallo real de mkdir/escritura usando archivo en lugar del directorio →500 estándar sin detalles internos.

### EV-09 — Creación, edición, lectura y permisos

T-03/T-08, AC-01/02/03/06: LIVE completa →201, vendedor desde CurrentUser, stock inicial/disponible 3, precio `12.50`, horario ISO persistido. Matriz de faltantes, null, extras/inmutables, stock cero/negativo/fraccional, precios fuera de rango/con tres decimales, categoría cruzada/ausente, zona ausente, imagen ausente/externa/traversal y horario sin zona/invertido/pasado →400 sin filas parciales. Configuración opcional manual/programada se guarda sin activar; mínimo/mode/fecha incompatibles →400. PATCH propio →200, título/descripción/precio/zona guardados; PATCH ajeno →403, sin JWT →401, UUID inválido →400, inexistente →404. PATCH vacío/null/inmutables/estado incompatible y datos combinados inválidos rechazan sin cambio parcial.

Feed y detalle aplican ACTIVE + inicio <= ahora < fin + stock >0. Futura, vencida, stock cero, FINISHED y HIDDEN_BY_REPORTS excluidos; detalle no disponible →404. Feed y detalle LIVE no contienen phone/email/hash/sellerContact, solo vendedor id/name. STATIC entrega contacto únicamente en detalle ACTIVE. Filtros comprobados en 0005 EV-06.

### EV-10 — Stock atómico

T-08 (parte backend T-05), AC-05/06: venta física propia →200 y decremento uno; STATIC, LIVE futura/vencida/oculta/agotada →409, ajeno →403, ausente →404, sin JWT →401, cuerpo extra →400. 25 requests simultáneos por current_stock=1 →**1×200 / 24×409**, stock final cero. CHECK rechaza UPDATE -1 con SQLSTATE 23514. Fixture de reserva previa mantiene estado, unit_price e inventario reservado intactos tras venta y edición disponible; current_stock=0 oculta y reposición válida vuelve al feed si horario/estado permiten.

Transacción SQL separada mantiene SELECT FOR UPDATE: venta física HTTP espera, relee stock cero después de commit y responde 409. Edición HTTP también espera al mismo bloqueo; edición de título conserva stock confirmado por la transacción anterior. Esto demuestra compatibilidad del bloqueo, **no** sustituye la carrera HTTP con POST /reservations de AC-05; no se implementó el endpoint de fase 3.

### Convergencia y límites

2.3–2.6 backend implementadas y verificadas; T-02/T-03/T-08 completas. T-04/T-05 conservan expiración persistente, evento publication_expired/stock_updated y reservas pendientes; T-01/T-06/T-07 conservan integración de fases posteriores y SHOULD de cierre. AC-04/07 no se cierran. Expediente En implementación. No se añadió DELETE, finish, reservas, gateway, worker ni UI.

Primer ensayo: motor Prisma requirió descarga tras instalar tipos; migrate status/diff posteriores aprobaron. El timeout inicial de 10 segundos no alcanzó para importación en frío del proceso compilado; se amplió a 60. Un segundo ensayo completó aserciones pero esperó un segundo cierre del proceso ya terminado por señal; se hizo stop idempotente y la ejecución final terminó con salida 0. No se presenta un ensayo fallido como aprobado.
