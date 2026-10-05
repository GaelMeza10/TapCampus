# 0010 — Plan técnico de la fase 1

Estado: **Implementado y verificado** | Especificación: `spec.md` | Revisión: 2026-10-04

## Contexto y dependencias de la línea base (2026-10-01)

- `Backend/src/main.ts` ya instala `ValidationPipe` y CORS; no aparece un filtro global. `Backend/src/prisma/prisma.service.ts` conecta al iniciar el módulo.
- `Backend/prisma/migrations/20260929232323_sdd_architecture/migration.sql` contiene `DROP TABLE` sobre el modelo anterior. `Backend/prisma/seed.ts` contiene siete zonas y «Batas y Uniformes»; arquitectura exige cinco y «Batas/Uniformes».
- La auditoría documenta que el backend no compila por `prisma.usuario` (0002) y por el seed. Primero se inspeccionan esquema, historial y datos sin aplicar cambios; después se corrige 0002 para disponer de una compilación verificable; luego se ejecuta el trabajo de 1.1–1.4.
- No se han inspeccionado los datos de una base real ni probado una recuperación en esta planificación. La presencia de `.env` o de migraciones no demuestra conexión funcional.

## Diseño y secuencia

1. **Inventario sin escritura (AC-02/04/05):** identificar entorno y versión PostgreSQL, registrar `prisma migrate status`, tablas, cantidad de filas y referencias, especialmente reservas previas, precios e identificadores antiguos. Confirmar si la base es vacía, de desarrollo descartable o compartida. Guardar un respaldo verificable y probar restauración sobre una base aislada antes de modificar datos compartidos. No registrar secretos ni datos personales en `verification.md`.
2. **Desbloqueo de compilación (AC-01):** ejecutar las tareas pertinentes de 0002 para alinear `prisma.user`, DTO y servicio con el esquema. Mantener esa implementación y sus EV en 0002. Añadir el filtro global en `Backend/src/` y registrarlo en `main.ts`; conservar `statusCode`, `message` y `error` del contrato de arquitectura. Configurar CORS explícitamente para los orígenes esperados por entorno y documentar su prueba. Validar build y arranque.
3. **Migraciones y datos (AC-02/03/04):** para base vacía, aplicar el historial en base aislada y una migración aditiva para `CHECK (current_stock IS NULL OR current_stock >= 0)`, `unit_price DECIMAL(10,2)` y `idempotency_key UUID` con índice único `(buyer_id, idempotency_key)`. Para base con tablas anteriores, sustituir o acompañar la migración destructiva con una transición probada que preserve registros, claves y relaciones. Resolver valores históricos de precio solo con fuente fiable; si no existe, registrar decisión de tratamiento antes de imponer `NOT NULL`. Resolver duplicados o claves faltantes antes de crear la unicidad. Evitar reescribir una migración ya aplicada sin plan de compatibilidad para esos entornos. Repetir `prisma migrate status`, introspección y pruebas de restricciones en PostgreSQL real.
4. **Seed (AC-05):** actualizar `Backend/prisma/seed.ts` a las cinco zonas y ocho categorías exactas. Corregir su ejecución y tipos según la configuración efectiva de Prisma 7 (`prisma.config.ts` frente al script antiguo de `package.json`). Usar `upsert` transaccional o pasos recuperables; remapear referencias antes de retirar nombres obsoletos. Ejecutar dos veces en base de prueba y comparar recuentos y referencias.
5. **Convergencia (AC-01..05):** registrar comandos, versión de servicios, datos de prueba, recuentos antes/después y resultado de restauración en `verification.md`. Enlazar EV por AC, actualizar GAP-05/12/13/15/17 que procedan, expediente 0001/0002/0005 si cambia un contrato, trazabilidad y casillas 1.1–1.4 solo según evidencia completa.

## Contratos, seguridad y recuperación

La implementación comprobada usa `scripts/migrate-safe.mjs`: inventario previo, declaración de respaldo restaurado, transición antigua transaccional con archivo completo en `tapcampus_legacy` y mapa Int→UUID, `migrate resolve --applied` sin modificar el SQL aplicado, y migración aditiva. Exige las dos migraciones antiguas confirmadas; si tablas modernas quedan sin historial confirmado tras una interrupción, se detiene hasta verificar y resolver el historial. `scripts/backfill-reservation-prices.mjs` exige precio y procedencia por reserva moderna. `unit_price` no se obtiene del precio actual; las claves históricas sintéticas no representan nuevas acciones del comprador. El archivo conserva datos antiguos sin equivalente moderno; no se inventa `resolved_at`. Casos no convertibles detienen la transacción.

El seed bloquea catálogos/publicaciones en una transacción, remapea alias equivalentes y exige manifiesto para otras zonas referenciadas; categorías desconocidas referenciadas se detienen. Prisma fija generación CommonJS con imports internos sin extensión y `prisma.config.ts` invoca ts-node local mediante Node. Nest comparte su configuración con E2E mediante `configureApp`; CORS usa `CORS_ORIGINS` y el filtro mantiene mensajes HTTP y oculta detalles internos. Procedimiento operativo en `Backend/scripts/README.md`; ejecución y resultados en `verification.md`.

- No se añaden rutas ni eventos de negocio en 0010. El filtro conserva la forma de error de `docs/03_ARCHITECTURE.md`; los endpoints de 0002 siguen siendo suyos. No exponer trazas, `DATABASE_URL`, hash o datos personales en respuestas y evidencias.
- Para bases compartidas, separar respaldo, ensayo de restauración, aplicación y validación posterior. Si falla la validación, recuperar desde respaldo probado y documentar el estado; no confiar en `migrate reset` como reversión de datos.
- La restricción SQL complementa las validaciones de aplicación. `NULL` para publicaciones `STATIC` se conserva. El índice de idempotencia afecta reservas, pero la semántica de reintentos y stock se implementa y prueba en 0001.
- Riesgos: historial destructivo, cambio de PK `Int` a UUID, referencias de catálogos, precio histórico no demostrable y divergencia entre `package.json` y `prisma.config.ts`. Las alternativas de descartar datos o inventar precios quedan descartadas para entornos con datos.

## Constitución

| Principio | Aplicación |
| --- | --- |
| I | `spec.md` fija cinco resultados observables antes de modificar código. |
| II | RF/RNF/US habilitados → AC → T → EV; 0010 se indexa y se vincula a expedientes de negocio. |
| III | `CHECK`, precio fijado e índice único preparan la integridad de inventario y reservas; la lógica transaccional queda en 0001. |
| IV | Se conserva el formato HTTP, se explicita CORS y no se exponen secretos ni contactos. |
| V | PostgreSQL real, migración de copia poblada, restauración y seed repetido producen EV por AC. |
| VI | Se limita a infraestructura de fase 1; cambios de producto se devuelven a sus expedientes antes de implementarlos. |

## Verificación prevista

| Criterio | Comprobación | Entorno / datos |
| --- | --- | --- |
| AC-01 | `npm run build`, arranque y petición inválida/CORS | Backend con configuración de prueba; auth 0002 corregida. |
| AC-02 | `prisma validate`, `prisma migrate status`, arranque Prisma | PostgreSQL aislado y credenciales de prueba. |
| AC-03 | Inspección de columnas/índices, inserciones válidas e inválidas | PostgreSQL migrado; usuarios/publicaciones de prueba. |
| AC-04 | Migración sobre copia poblada, comparación de recuentos/relaciones y restauración | Copia anonimizada o fixture representativo del esquema anterior. |
| AC-05 | Seed dos veces y consultas de catálogos/FK | PostgreSQL migrado con y sin publicaciones referenciadas. |
