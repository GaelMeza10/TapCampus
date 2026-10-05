# 0010 — Infraestructura backend y base de datos

Estado: **Verificado** | Fecha: 2026-10-04

## Contexto y fuentes

`TASKS.md` 1.1–1.4 habilitan RF-01/RF-02 (US-01), RF-03 (US-03), RF-05c (US-05c), RF-07/RF-09 (US-06/US-08) y RNF-01. Fuentes: `docs/02_REQUIREMENTS.md`, `docs/03_ARCHITECTURE.md`, `docs/08_DEVELOPMENT_WORKFLOW.md`, `docs/09_PROJECT_AUDIT.md`, `docs/10_TRACEABILITY.md` y expedientes 0001, 0002 y 0005.

La línea base del 2026-10-01 tenía compilación rota, filtro ausente, esquema incompleto y seed discrepante (GAP-05/12/13/15/17). El 2026-10-04 se corrigieron y verificaron según `verification.md`. La migración `20260929232323_sdd_architecture` permanece intacta por estar aplicada; la ruta segura la acompaña conservando datos antiguos. El entorno local ya dispone del esquema aditivo y los catálogos exactos.

## Alcance

- Incluye verificar el arranque y el filtro global, la conexión Prisma/PostgreSQL, la integridad del esquema, una ruta de migración que preserve datos y un seed repetible con los catálogos exactos.
- Excluye endpoints de autenticación, publicaciones, reservas y catálogos: su comportamiento pertenece a 0002, 0003/0004, 0001 y 0005. El cierre de 1.1 depende de corregir la compilación de 0002.
- No se ejecuta una migración ni un seed sobre una base con datos sin inventario, respaldo comprobado y ensayo de recuperación.

## Reglas y contratos observables

- El backend compila, arranca con `PORT` configurado, usa `ValidationPipe` estricto, CORS configurado y un filtro global que conserva el formato estándar de error NestJS documentado en arquitectura.
- Prisma conecta a PostgreSQL mediante `DATABASE_URL`; `prisma validate` y `prisma migrate status` describen un esquema coherente con las migraciones aplicadas.
- `Publication.current_stock` admite `NULL` para `STATIC`, pero un valor no nulo negativo es rechazado por una restricción `CHECK` de PostgreSQL.
- `Reservation.unit_price` es `Decimal(10,2)` obligatorio y conserva el precio al reservar; `idempotency_key` es UUID obligatorio y la combinación `(buyer_id, idempotency_key)` es única. No se añade unicidad por `(buyer_id, publication_id)`.
- Los datos previos, incluidos usuarios, publicaciones, reservas y referencias a zonas/categorías, se conservan al pasar del esquema antiguo al nuevo. No se asigna un precio histórico a reservas existentes a partir del precio actual sin evidencia de su valor original; un caso así detiene esa migración hasta resolver la procedencia del dato.
- El seed deja disponibles exactamente las cinco zonas y ocho categorías de `docs/03_ARCHITECTURE.md`, sin duplicados tras repetirlo. Si hay nombres anteriores referenciados, se remapean explícitamente antes de retirarlos.

## Criterios de aceptación

### AC-01 — Arranque y errores del backend

**Dado** un entorno de prueba configurado, **cuando** se compila y arranca el backend y se envía una entrada inválida, **entonces** el build termina correctamente, la petición recibe el error HTTP estándar y el filtro global no oculta el código ni el mensaje de validación; CORS responde según la configuración documentada.

### AC-02 — Conexión y estado de Prisma

**Dado** PostgreSQL de prueba disponible y `DATABASE_URL` válida, **cuando** se valida el esquema, se consulta el estado de migraciones y se inicia el módulo Prisma, **entonces** la conexión funciona y no hay desajuste entre esquema, historial y base resultante.

### AC-03 — Integridad del esquema

**Dado** el esquema actualizado y migrado, **cuando** se inspeccionan las columnas y restricciones y se intenta guardar `current_stock = -1`, **entonces** existen `unit_price Decimal(10,2)`, `idempotency_key UUID` y unicidad por comprador/clave, PostgreSQL rechaza el stock negativo y permite varias reservas del mismo comprador/publicación con claves distintas.

### AC-04 — Migración sin pérdida silenciosa

**Dado** una copia de base con datos del esquema anterior, **cuando** se ensaya la migración y la recuperación, **entonces** se conservan recuentos, claves y relaciones verificables; cualquier dato sin conversión demostrable detiene el cambio antes de alterar la base compartida. Una base vacía también migra desde cero.

### AC-05 — Seed exacto y repetible

**Dado** una base migrada, **cuando** se ejecuta el seed dos veces, **entonces** hay cinco zonas y cuatro categorías por tipo con los nombres exactos de arquitectura, sin duplicados, y las publicaciones existentes siguen apuntando a catálogos válidos.

## Decisiones

Las reglas de producto de precio e idempotencia están resueltas en 0001. La estrategia técnica de migración depende del inventario de datos y se registra en `decisions.md`; no se ejecuta una transformación irreversible por suposición.
