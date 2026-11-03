# 0012 — Verificación y convergencia

Estado: Verificado (ampliación 2026-11-03) | Evidencia original: 2026-10-19

## Ampliación a 24 publicaciones — 2026-11-03

La evidencia EV-01..03 de abajo corresponde a los ocho ejemplos originales. La ampliación añade dieciséis anuncios nuevos con fotografías ilustrativas empaquetadas, sin reemplazar sus UUID ni modificar las filas existentes.

| AC | Tarea(s) | Evidencia nueva | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-04, T-06 | **EV-04:** SQL real: 12 LIVE y 12 STATIC; `node scripts/verify-demo-feed.cjs` comprueba los ocho IDs nuevos de cada tipo en el feed HTTP. | Aprobado. Los cuatro LIVE originales vencidos se ocultan conforme RF-04. |
| AC-02 | T-04, T-06 | **EV-05:** seed real: 16 nuevas en la primera ejecución y 0 en la segunda. `verify-demo-seed.cjs` repite con Prisma simulado, compara filas y rechaza vendedor ausente/URL inválida. | Aprobado; usuarios, reservas y catálogos conservaron sus hashes. |
| AC-03 | T-05, T-06 | **EV-06:** 16 fotografías PNG empaquetadas y 24 archivos en `Backend/uploads/`; `verify-demo-feed.cjs` obtiene una fotografía nueva por HTTP 200 con `image/png`. | Aprobado. |
| AC-04 | T-04, T-05, T-06 | **EV-07:** SQL real: dos anuncios nuevos en cada una de las ocho categorías; verificador local comprueba descripciones, stock, horarios y gangas MANUAL/SCHEDULED; TypeScript/build/lint/Prisma validate aprobados. | Aprobado. |

Entorno: Windows, Node 24, PostgreSQL 16.15 y Redis en Docker local. La base configurada tenía antes 8 publicaciones, 3 usuarios, 2 reservas, 5 zonas, 8 categorías y cuatro migraciones aplicadas (`prisma migrate status`: al día). El vendedor se tomó de la primera publicación de demo existente, sin exponer su email; `SEED_PUBLIC_BASE_URL` coincidió con la URL LAN del frontend. `prisma db seed` creó 16 publicaciones y su segunda ejecución creó 0. SQL: 24 publicaciones finales y exactamente dos nuevas por categoría. Después del seed, los hashes de usuarios (`d7142cdd…`), reservas (`ebc9c0b4…`), zonas (`0e1bf4a0…`) y categorías (`9c7a9a5e…`) permanecieron iguales al inventario previo.

Comandos reproducibles desde `Backend/`: `node scripts/verify-demo-seed.cjs`, `node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm.cmd run build`, `npm.cmd run lint`, `node node_modules/prisma/build/index.js validate`, `node node_modules/prisma/build/index.js migrate status`, `node node_modules/prisma/build/index.js db seed` con las dos variables de demo y `node scripts/verify-demo-feed.cjs`: salida 0. El verificador HTTP usa Nest en memoria con la base local y no abre el puerto de la aplicación. Desde la raíz: `node scripts/check-sdd.mjs` y `git diff --check`: salida 0. La visualización en un teléfono sigue dependiendo de la conectividad LAN y pertenece a la aceptación móvil de fase 5.

## Entorno y respaldo

Windows, Node 24, PostgreSQL 16 y Redis 7 en Docker; backend local en puerto 3000. Antes de sembrar la base local, `pg_dump -Fc` creó `tapcampus_before_demo_20261019183223.dump`, copiado fuera del contenedor a `%TEMP%`. `pg_restore --exit-on-error` terminó en la base aislada `tapcampus_demo_restore_20261019183223`. Recuentos original/copia: usuarios 2, zonas 5, categorías 8, publicaciones 0, reservas 0. No se registraron contraseñas ni teléfonos.

## Matriz AC → T → EV

| AC | Tarea(s) | Evidencia reproducible | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-03 | **EV-01:** `node node_modules/prisma/build/index.js db seed` con `SEED_DEMO_SELLER_EMAIL` de cuenta existente y `SEED_PUBLIC_BASE_URL=http://10.41.60.121:3000`; creó 8 filas. SQL: LIVE 4, STATIC 4. `GET /publications?type=LIVE` y `?type=STATIC`: 4 cada uno. | Aprobado en API/base local. |
| AC-02 | T-02, T-03 | **EV-02:** en copia restaurada, primera ejecución creó 8; segunda creó 0. Una ejecución sin variables completó solo catálogos. `createMany` con IDs fijos y `skipDuplicates` conserva filas existentes. | Aprobado. |
| AC-03 | T-01, T-02, T-03 | **EV-03:** vendedor ausente y URL con ruta hicieron fallar el seed en la copia. `GET /uploads/10000000-0000-4000-8000-000000000001.png`: HTTP 200, `image/png`, 5634 bytes, también desde la IP LAN. | Aprobado. |

`node node_modules/typescript/bin/tsc --noEmit --incremental false` y `node scripts/check-sdd.mjs` terminaron con código 0; `git diff --check` no detectó espacios inválidos.

## Convergencia histórica (ocho ejemplos)

Los ocho ejemplos tienen categorías/zonas existentes, imágenes servidas por el backend y vendedor registrado. El seed normal mantiene la semántica de 0010. El feed HTTP ya muestra los ejemplos; la visualización en un dispositivo físico depende de la conexión del teléfono con la IP LAN y queda fuera de esta comprobación.
