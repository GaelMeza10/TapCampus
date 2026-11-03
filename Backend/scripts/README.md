# Operación de la fase 1

## Backend fase 3

Desde Backend, con DATABASE_URL y JWT_SECRET locales, PostgreSQL de fase 1 y Redis:

```powershell
docker compose up -d redis
npm run build
npm run test:phase3
```

`verify-phase3.mjs` crea `tapcampus_phase3_<timestamp>` y un BULLMQ_PREFIX del mismo nombre, migra/siembra esa BD nueva y arranca dos veces `dist/main.js` en puertos libres. Mantiene PostgreSQL original sin escrituras y compara inventarios/hash. Prueba 50 compradores con claves distintas (1×201/49×409), 50 reintentos de la misma clave (1×201/49×200 y un ID), precio/plazo/permisos/privacidad, estados terminales, bloqueo SQL real, carreras de resolución y venta física, eventos con dos socket.io-client, ganga y reprogramación. Mata y reinicia el proceso que contiene los workers manteniendo Redis y comprueba jobs pendientes/perdidos y conciliación periódica. Para acelerar el vencimiento solo modifica reserved_at de fixtures y añade jobs en el namespace aislado; el plazo de producción sigue fijo en 20 minutos. Los jobs de ganga y fin también se prueban con delays reales cortos. No requiere esperar 21 minutos de reloj real.

Redis se crea con volumen/AOF y política noeviction. No se usa FLUSHDB ni se eliminan bases. Ensayos conservados en `.local/verification/`; phase3.json no contiene credenciales ni teléfonos. La aplicación aloja QueueService, tres workers y conciliación al arrancar/cada 30 s (configurable). Encolado tras commit puede fallar; se registra y la conciliación usa PostgreSQL para recuperar trabajos. Socket.io en mismo puerto/namespace `/`, room `feed`, eventos públicos; al reconectar consultar REST. Cada despliegue/base debe tener su propio BULLMQ_PREFIX. La suite de fase 2 también usa namespace aislado; el E2E de smoke desactiva JobsService para no modificar la base original.

Diseño consultado: [conexiones BullMQ](https://docs.bullmq.io/guide/connections), [producción BullMQ](https://docs.bullmq.io/guide/going-to-production) y [gateways NestJS](https://docs.nestjs.com/websockets/gateways). El lock fija las versiones usadas; BullMQ 6 ya no expone Queue.client, por lo que la prueba de versión Redis usa ioredis directamente.

## Verificación del backend de fase 2

Desde `Backend/`, con PostgreSQL de fase 1 disponible, DATABASE_URL local y permiso de crear bases:

```powershell
npm run build
npm run test:phase2
```

`verify-phase2.mjs` crea exclusivamente `tapcampus_phase2_<timestamp>`, despliega las migraciones y ejecuta el seed existente dos veces **en esa base nueva**. La BD original se consulta solo para comparar hashes/recuentos antes/después. Arranca la API compilada en puerto libre, con JWT y directorio de uploads de fixture, comprueba contratos HTTP y concurrencia SQL, y termina su proceso. Conserva BD y archivos en `.local/verification/tapcampus_phase2_<timestamp>/`; no borra bases ni datos preexistentes. `phase2.json` contiene resultados sin tokens/contraseñas; un fallo termina con código distinto de cero. Evidencia AC → T → EV en `specs/0002` a `0005`, resumen compartido en `specs/0003-publicaciones-en-vivo/evidence/phase2.json`.

Para uso local, POST uploads recibe exactamente un campo multipart `file`, imagen JPEG/PNG/WebP de hasta 5 MiB y Bearer JWT; devuelve image_url. Directorio default `uploads` relativo a Backend, configurable con UPLOADS_DIR. PUBLIC_BASE_URL opcional es el origen HTTP(S) externo sin path, accesible desde móvil; sin él se usa el origen de la petición. Los ejemplos y cuerpos de publicaciones están en `docs/03_ARCHITECTURE.md` y los expedientes; no se aceptan seller_id/status ni campos desconocidos del cliente.

## Publicaciones de demostración

El seed ordinario solo reconcilia zonas y categorías. Para poblar el feed local con doce publicaciones LIVE y doce STATIC, primero registra un vendedor y ejecuta desde `Backend/`:

```powershell
$env:SEED_DEMO_SELLER_EMAIL='correo.existente@uabc.edu.mx'
$env:SEED_PUBLIC_BASE_URL='http://IP_LOCAL_DE_TU_EQUIPO:3000'
node node_modules/prisma/build/index.js db seed
```

La IP debe ser alcanzable desde el teléfono. El script crea los ocho PNG originales y copia dieciséis fotografías ilustrativas desde `prisma/demo-images/` a `UPLOADS_DIR` o `uploads/`; el backend debe servir ese mismo directorio. Repetir el comando no duplica ni restablece publicaciones existentes. LIVE caduca tras siete días y una nueva ejecución no modifica su horario. Los títulos empiezan con `Demo:` y el contacto del vendedor de prueba no representa una venta real. Quita las dos variables de entorno para ejecutar únicamente el seed de catálogos. Para comprobar la forma de los datos y la repetición sin PostgreSQL, ejecuta `node scripts/verify-demo-seed.cjs`. Con PostgreSQL local y el backend compilado, `node scripts/verify-demo-feed.cjs` comprueba feed e imagen por HTTP en memoria, sin abrir el puerto de la aplicación.

## Infraestructura y recuperación

Ejecutar desde `Backend/` con Node 24.13 o posterior y `DATABASE_URL` configurada
en el entorno o `.env`. No registrar la URL ni datos personales en evidencia.

1. `npm run db:inventory` realiza únicamente lecturas y devuelve recuentos,
   hashes, restricciones e historial. Conservar el resultado localmente.
2. Crear un respaldo completo con `pg_dump -Fc`, restaurarlo en otra base mediante
   `pg_restore --exit-on-error`, y comparar inventarios. El respaldo debe quedar
   fuera del contenedor antes de aplicar cambios a la base original.
3. Ensayar en esa copia la ruta correspondiente y comprobar recuentos, relaciones,
   estado/diff Prisma y seed. `npm run test:infra` comprueba ambas rutas con
   fixtures sintéticos; no modifica la base configurada.
4. `npm run db:migrate:safe -- --backup-verified` despliega tras esas comprobaciones.
   El indicador declara una comprobación realizada, no crea ni valida un respaldo.
   No usar directamente `prisma migrate deploy` sobre esquemas antiguos poblados:
   el historial conservado contiene `DROP TABLE`.
5. `node node_modules/prisma/build/index.js db seed`, dos veces; después
   `migrate status` y `migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code`.

Para el esquema antiguo, las dos primeras migraciones deben estar aplicadas y
comprobadas. La ruta segura admite `--legacy-manifest ruta.json`, con
`reservations: { "ID_ANTIGUO": { "unit_price": "12.50", "source": "Referencia verificable del precio original" } }`.
Cada reserva exige evidencia propia; los fixtures nunca son datos de producción.
No usar el precio actual como fuente. Importes que no admitan conversión decimal
exacta, teléfonos ambiguos, stock negativo o publicaciones sin zona detienen la
transacción y requieren una decisión documentada.

La transición crea las tablas modernas sin ejecutar los `DROP`, conserva todas
las tablas y tipos antiguos en `tapcampus_legacy` y deja `id_map` para comprobar
las claves UUID y `price_evidence` para auditar los precios. Conserva los IDs
enteros de catálogos/reportes y sus secuencias. Mapea los estados antiguos a sus
equivalentes: `ACTIVA → ACTIVE`, publicaciones terminadas/expiradas/vendidas a
`FINISHED`; reservas `RESERVADA/VENDIDA/CANCELADA/EXPIRADA` a
`ACTIVE/COMPLETED/CANCELLED/EXPIRED`. `resolved_at` queda nulo porque el modelo
antiguo carece de ese instante; `expiracion` debe coincidir con los veinte minutos.
El archivo conserva estados y campos antiguos completos, incluidos los que no
tienen columna moderna, sin inventar valores.

Si la transición confirmó sus datos pero falló `migrate resolve`, comprobar tablas,
archivo y mapa antes de ejecutar `migrate resolve --applied 20260929232323_sdd_architecture`.
La siguiente ejecución se detiene ante tablas modernas sin historial confirmado;
no vuelve a aplicar la migración destructiva. Ante fallo de una migración,
inspeccionar `_prisma_migrations` antes de usar `migrate resolve`; nunca emplear
`migrate reset` como recuperación de datos. Recuperar el respaldo en una base
separada, validar hashes y cambiar la conexión durante una ventana sin escrituras.

Para reservas modernas sin instantánea, ejecutar
`node scripts/backfill-reservation-prices.mjs ruta.json --backup-verified`
solo después del mismo inventario/respaldo/ensayo. El manifiesto usa UUID de
reserva. El backfill completo se valida antes de escribir y no sustituye precios
ya registrados que contradigan la evidencia. Luego ejecutar la ruta segura.

El seed remapea los alias equivalentes `Gimnasio Universitario → Gimnasio` y
`Batas y Uniformes → Batas/Uniformes`. Otras zonas referenciadas exigen
`CATALOG_REMAP_FILE`, con formato mostrado en `fixtures/catalog-remap.json` y
procedencia verificable por zona. Categorías desconocidas referenciadas se
detienen para resolver su conversión. Todo el seed es transaccional; no borra
publicaciones. Los catálogos retirados sin referencias pueden eliminarse.

Para ejecutar la verificación con las herramientas del contenedor de desarrollo:

```powershell
$env:PG_TOOLS_CONTAINER='backend-postgres-1'
npm run test:infra
```

Sin esa variable se utilizan `pg_dump`/`pg_restore` locales. La cuenta de pruebas
necesita crear bases. El script crea únicamente `tapcampus_verify_<timestamp>_*`,
conserva las bases y dumps para inspección y escribe un resumen sin datos
personales en `.local/verification/`. Los respaldos y manifiestos reales quedan
en `.local/` ignorado por Git. El puerto HTTP se asigna dinámicamente.
