# 0010 — Verificación y convergencia

Estado: **Verificado** | Fecha: 2026-10-04 (America/Tijuana; ejecución también registrada en UTC)

## Entorno y comandos

- Windows / PowerShell; Node 24.13.0, TypeScript 6.0.3, NestJS 12.0.1, Prisma CLI/generador 7.8.0, runtime `@prisma/client`/adapter 7.10.0; PostgreSQL 16.15, imagen `postgres:16`, contenedor local `backend-postgres-1`, puerto 6000. No se cambiaron dependencias ni credenciales.
- Base configurada: `tapcampus_db`, desarrollo local según `docker-compose.yml`. Inventario de solo lectura: tres migraciones aplicadas, 7 zonas, 8 categorías, 0 usuarios/publicaciones/reservas/reportes. La migración destructiva ya estaba aplicada desde 2026-09-29; no se reescribió ni volvió a ejecutarse sobre esta base.
- Git inicial en `main`: modificaciones previas de `docs/10_TRACEABILITY.md` y `specs/README.md`, más 0010 sin seguimiento. Se conservaron y ampliaron. No se hizo commit ni reset.
- Resumen automatizado sin datos personales: [infrastructure.json](evidence/infrastructure.json). Incluye diez comprobaciones aprobadas y las cinco bases aisladas de la ejecución final `tapcampus_verify_1791159427968_*`. Dumps y bases se conservaron para inspección; `.local/` queda ignorado por Git.
- Inventarios reales antes/después: [configured-before.json](evidence/configured-before.json), [configured-after.json](evidence/configured-after.json). Contienen solo recuentos, hashes, historial y restricciones.

## Matriz de trazabilidad

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-03, T-07, T-08 | EV-01: build, proceso Nest real con PORT de prueba, validación/CORS y filtro | Aprobado |
| AC-02 | T-01, T-04, T-05, T-07, T-08 | EV-02: validate/status/diff y conexión real de Prisma | Aprobado |
| AC-03 | T-04, T-05, T-08 | EV-03: columnas, CHECK y unicidad en PostgreSQL real | Aprobado |
| AC-04 | T-01, T-02, T-04, T-05, T-08 | EV-04: inventario, respaldo restaurado, copia antigua poblada y recuperación | Aprobado |
| AC-05 | T-01, T-06, T-07, T-08 | EV-05: seed doble, nombres exactos y referencias | Aprobado |

## EV-01 — Backend y dependencia 0002

Desde `Backend/`: `npm run build`, `node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm test -- --runInBand`, `npm run test:e2e -- --runInBand`, `npm run lint`: salida 0. Unitarias: 5 suites / 9 pruebas; E2E contra Prisma/PostgreSQL configurado: 1 suite / 1 prueba. Los scripts Jest usan VM modules por las dependencias ESM de NestJS 12.

`npm run test:infra` inicia `node dist/main.js` con la base aislada vacía migrada, JWT de fixture, PORT libre y `CORS_ORIGINS=http://localhost:8081`. GET raíz 200; entradas con correo externo, teléfono ajeno, campo extra y faltantes reciben 400 con `{statusCode,message:[...],error:'Bad Request'}` y cero usuarios creados. OPTIONS devuelve 204 y el origen autorizado; otro origen no recibe `Access-Control-Allow-Origin`. Ruta inexistente devuelve 404. Las unitarias comprueban también 403 y 500 sin exponer secretos en respuesta/log.

Registro válido 201, hash bcrypt comprobado, teléfono canónico, JWT con `sub` UUID y email; duplicado normalizado 409; login válido 200 y fallos equivalentes 401. Evidencia de la corrección de compilación/contrato en [0002 verification](../0002-autenticacion/verification.md). El alcance móvil y guards de 0002 se verifica en su fase propia.

## EV-02 — Prisma y PostgreSQL

Comandos desde `Backend/`:

```powershell
node node_modules/prisma/build/index.js generate
node node_modules/prisma/build/index.js validate
node node_modules/prisma/build/index.js migrate status
node node_modules/prisma/build/index.js migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

Todos salida 0: cliente generado, esquema válido, cuatro migraciones aplicadas y `No difference detected`. Se comprobaron la ruta desde cero, la copia antigua convertida, el caso moderno con backfill, la copia restaurada real y la base configurada. El generador fija `moduleFormat=cjs` y extensiones internas vacías para que Nest compilado y ts-node resuelvan el mismo cliente; no se editó código generado.

## EV-03 — Integridad

En PostgreSQL del ensayo poblado: `unit_price numeric(10,2) NOT NULL`, `idempotency_key uuid NOT NULL`, índice único `(buyer_id,idempotency_key)` e índice `(status,reserved_at)`. UPDATE stock -1 falla con SQLSTATE 23514; NULL en STATIC es válido. Dos reservas del mismo comprador/publicación con claves distintas se insertan; misma clave del mismo comprador falla con 23505; otro comprador puede usar la misma clave. Precio omitido falla con 23502 y UUID inválido con 22P02. Cada aserción está en `Backend/scripts/verify-infrastructure.mjs`; columnas y resultados se guardan en el resumen adjunto.

## EV-04 — Conservación y recuperación

Antes de cambios al esquema, inventario SQL de solo lectura y `prisma migrate status`. El respaldo real y su restauración se ejecutaron así, desde la raíz:

```powershell
docker exec backend-postgres-1 pg_dump -U tapcampus -d tapcampus_db -Fc -f /tmp/tapcampus-phase1-before.dump
docker exec backend-postgres-1 createdb -U tapcampus tapcampus_phase1_restore
docker exec backend-postgres-1 pg_restore -U tapcampus -d tapcampus_phase1_restore --exit-on-error /tmp/tapcampus-phase1-before.dump
docker exec backend-postgres-1 pg_restore --list /tmp/tapcampus-phase1-before.dump
docker cp backend-postgres-1:/tmp/tapcampus-phase1-before.dump Backend/.local/backups/tapcampus-phase1-before.dump
```

Los comandos finalizaron con salida 0. SHA256 del respaldo local: `68e00a3f8d9f2237bcd2317805fc6c008b6c78fc4088aac86932affa5d44b20c`. Antes de migrar la copia, todas las tablas, incluido `_prisma_migrations`, tuvieron recuentos y SHA256 idénticos al origen. Hash de zonas: `77b0b49a97ae144e51f425dcf76a888858a503281e2f8fb01405e565b293df92`; categorías: `0d99c2036260ad26ec5a24a44391c1f95811d56549af54587f5e0de5f2af13fd`; tablas de negocio vacías: `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`.

Para reproducir toda la comprobación de copia poblada, desde `Backend/`, con servicio disponible y permiso de crear bases:

```powershell
$env:PG_TOOLS_CONTAINER='backend-postgres-1'
npm run test:infra
```

Salida 0 en la ejecución final. El script crea bases nuevas con prefijo exclusivo, aplica los dos esquemas antiguos y carga fixtures sintéticos: 2 usuarios, 2 publicaciones, 2 reservas, 2 zonas, 2 categorías y 1 reporte. Respalda/restaura y compara hashes antes del ensayo. Sin manifiesto o con manifiesto sin precios, ambas rutas rechazan la transición y el inventario permanece idéntico. Con recibos sintéticos demostrables, conserva recuentos, todas las filas antiguas en `tapcampus_legacy`, mapa Int→UUID y relaciones comprador/publicación; las reservas quedan a 12.50/13.50 mientras el precio visible es 25.50. También recupera el respaldo antiguo en otra base y compara hashes. En el modelo moderno, prueba rechazo sin instantánea y backfill documentado de 12.50 frente al precio actual 99, seguido de migración/status/diff correctos.

La transición complementa la migración destructiva: crea únicamente sus objetos nuevos, conserva el origen y después registra esa migración con `migrate resolve --applied`. El SQL aplicado original conserva SHA256 `2977e6881bf2e3195ec331af016432c7a4579b402920520ccca270c6a9398824`, igual al historial real. `.gitattributes` fija LF para las migraciones.

Tras ensayar migración, seed doble y diff sobre `tapcampus_phase1_restore`, se ejecutaron sobre la base local original `node scripts/migrate-safe.mjs --backup-verified`, dos `prisma db seed`, status, diff e inventario: todas las salidas 0. Solo se añadió `20261005000100_reservation_integrity`; no hay usuarios ni operaciones de negocio perdidos. Los registros de comandos quedan en `Backend/.local/verification/configured-*.txt` y los inventarios adjuntos permiten comprobar los cambios.

## EV-05 — Catálogos

Seed ejecutado dos veces en base vacía, copia antigua poblada, restauración real y base configurada: salida 0. Resultado exacto: Facultad de Ingeniería, Facultad de Artes, Biblioteca Central, Cafetería Principal y Gimnasio; LIVE: Comida Fuerte, Snacks, Bebidas, Postres; STATIC: Libros, Material Escolar, Batas/Uniformes, Electrónica.

En la copia poblada, el primer seed sin remapeo se rechaza y revierte íntegramente. El manifiesto sintético documenta la nueva zona de la publicación de Ciencias; con él, ambas publicaciones conservan FK válidas tras remapear zonas y el alias Batas. Inventario completo idéntico entre primera y segunda ejecución. En la base real no había referencias a las zonas retiradas. Después: 5 zonas, 8 categorías, 0 filas de negocio; hashes de catálogos iguales a los de la copia restaurada tras su ensayo.

## Correcciones durante la verificación

- El primer ensayo llegó a conservación/restauración y falló al ejecutar el seed: cliente generado como ESM dentro de código CommonJS. Se fijaron las opciones del generador y se regeneró; las ejecuciones completas posteriores aprobaron.
- Jest inicialmente falló por `rootDir` implícito en TypeScript 6 y luego por dependencias ESM de NestJS. Se explicitó el directorio y VM modules; las nueve pruebas aprobaron.
- En la copia del respaldo real, el seed invocado fuera de npm no encontraba `ts-node` en PATH. `prisma.config.ts` ahora invoca explícitamente el ejecutable local con Node; ensayo y aplicación posteriores aprobaron.
- El primer intento de `git restore` del caché generado falló por permisos de índice; no modificó Git. El caché previo se conserva por escritura exacta del contenido de HEAD al concluir la comprobación.

## Convergencia

- Especificación ↔ plan ↔ código: cinco criterios implementados y comprobados; 0002 registra la corrección backend, 0001 el esquema de reservas y 0005 el seed.
- Criterios ↔ pruebas: EV-01..05 aprobadas con scripts reproducibles y evidencia adjunta. `node scripts/check-sdd.mjs`: salida 0, referencias documentales correctas.
- TASKS 1.1–1.4 cerradas por esta evidencia. No se dan por cerrados endpoints de reservas/catálogos ni sesión móvil de otros expedientes.
- Bloqueos de esta fase: ninguno en el entorno local accesible. Bases compartidas externas requieren su propio inventario/respaldo/ensayo antes de usar los scripts; la evidencia no acredita entornos que no se han inspeccionado.
- Fecha y conclusión: 2026-10-04, **Verificado**.
