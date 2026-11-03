# 0001 — Plan técnico de reservas

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

## Contexto y dependencias

El esquema Prisma ya tiene precio fijado, clave de idempotencia, unicidad por comprador e índice `(status,reserved_at)`, comprobados por 0010 EV-02/03/04. Fases 1/2 revalidadas; JWT/publicaciones y reservas/worker/eventos backend verificados en fase 3. `expiresAt` se deriva de `reserved_at + 20 min` con hora de servidor; la consulta de conciliación usa esa misma expresión.

## Diseño propuesto

La proyección de reserva selecciona también `publication.title` y responde `publicationTitle` para AC-10. La pantalla de reservas propias consulta `/reservations/mine` sin depender de `GET /publications/:id`, pues este puede devolver 404 tras agotar stock o vencer horario. Se prueba la lista con una publicación invisible y una reserva activa.

### Ejecución fase 3

Revalidar fases 1/2 mediante suite HTTP/SQL aislada y status/diff de Prisma. Serializar la clave por comprador con bloqueo de su fila users (evita carreras incluso entre publicaciones distintas); después bloquear publications. Resoluciones bloquean publication antes de reservation, siguiendo el mismo orden que los consumidores de inventario. No cambiar esquema ni migraciones. Separar ReservationsModule, RealtimeModule y JobsModule; JobsModule consume servicios exportados sin dependencia circular. Un productor QueueService independiente encola tras commit; conciliación al arrancar y cada 30 s recupera vencidas y recrea trabajos futuros. Tiempo fijo de reserva: 1 200 000 ms, no configurable en producción. Pruebas SQL adelantan reserved_at en fixtures sin alterar ese contrato.

- **Datos:** planificar `Reservation.unit_price Decimal(10,2)` no nulo y `idempotency_key UUID` con unicidad `(buyer_id, idempotency_key)`. No crear unicidad `(buyer_id, publication_id)`. Validar stock no negativo y tipo/estado de publicación. Indexar reservas activas por vencimiento derivado; documentar migración y respaldo antes de aplicarla en entornos compartidos. Si existen reservas históricas, inspeccionarlas antes del backfill: el precio original no se deduce de `Publication.price` actual sin evidencia.
- **Reserva:** buscar primero la clave del comprador; si existe para esa publicación, devolver la reserva existente. Para una clave nueva, dentro de una transacción interactiva de Prisma bloquear la fila de publicación con `SELECT ... FOR UPDATE`, comprobar estado, horario y stock, capturar precio decimal vigente, restar uno y crear reserva. El bloqueo previo de la fila del comprador serializa los reintentos y permite releer la clave antes de descontar; la restricción única conserva la integridad de datos. Una clave reutilizada para otra publicación responde `409`. No leer ni actualizar stock fuera de la transacción.
- **Resolución:** confirmar, cancelar y expirar comprueban actor/fecha/estado y actualizan estado + stock en una transacción. Tomar bloqueos en un orden estable para evitar deadlocks. El cambio de `ACTIVE` a estado final se condiciona al estado actual para evitar doble liberación en carrera con el worker.
- **Job:** BullMQ/Redis programa la expiración, pero la base de datos es la fuente de verdad. El worker vuelve a comprobar vencimiento y estado; una conciliación al arrancar y periódica recupera reservas vencidas si el encolado posterior al commit falla. El job repetido no vuelve a sumar stock.
- **Contratos:** respetar las rutas de `docs/03_ARCHITECTURE.md`, incluidas consultas propias y del vendedor, y publicar `stock_updated` solo tras una creación o cambio efectivo confirmado. La respuesta de reserva incluye `id`, `publicationId`, `status`, `reservedAt`, `expiresAt` ISO 8601, `unitPrice` como cadena decimal y contacto autorizado; primer alta `201`, repetición idéntica `200`. Nunca incluir teléfonos protegidos en listados públicos.
- **UI:** generar y conservar una clave por intento lógico; un fallo de red reenvía la misma clave y una nueva pulsación de «Apartar otra unidad» genera otra. Mostrar cada reserva con su propio temporizador, precio fijado, contacto y cancelación. Mostrar `409` como stock agotado/venta no disponible o clave reutilizada indebidamente.
- **Recuperación:** si Redis está indisponible, registrar error operativo y usar conciliación sobre reservas vencidas; evitar considerar la tarea en cola como prueba de expiración. No ejecutar migración destructiva sin plan de reversión.

## Comprobación constitucional

| Principio | Aplicación |
| --- | --- |
| I | AC-01 a AC-13 definen resultados; las decisiones de producto están cerradas. |
| II | RF/RNF/US se vinculan en `spec.md`; matriz `AC → T → EV` en `verification.md`. |
| III | Transacciones, bloqueo de fila, estados terminales y conciliación cubren integridad. |
| IV | Rutas, errores, permisos y evento se especifican antes de integrar frontend. |
| V | Pruebas de concurrencia, expiración, permisos y convergencia se registrarán por AC. |
| VI | El alcance excluye pagos, GPS y venta estática; cambios reabren la especificación. |

## Estrategia de verificación prevista

| Criterios | Prueba / entorno |
| --- | --- |
| AC-01, AC-03 | Integración HTTP con PostgreSQL real y publicaciones de cada estado. |
| AC-02 | 50 compradores autenticados y peticiones concurrentes contra stock 1. |
| AC-04, AC-05 | Permisos, transiciones finales y segunda ejecución. |
| AC-06 | Worker con Redis persistente, reloj controlado o espera real; reinicio del proceso y job duplicado. |
| AC-07 | Cierre manual con reserva activa y suscripción Socket.io. |
| AC-08 | Consulta de feed tras liberar stock con publicación activa y finalizada. |
| AC-09 | Dos altas del mismo comprador con claves distintas, consultas separadas para comprador/vendedor, reintento concurrente con la misma clave y rechazo de clave usada para otra publicación. |
| AC-11, AC-12 | Probar los cuatro estados en comprador/vendedor y ausencia de UUID/enums en texto visible y etiquetas accesibles. |
| AC-13 | Dos reservas del mismo producto, incluso con la misma marca de tiempo; confirmar/cancelar una y comprobar que se envía su UUID interno y la otra permanece. |

Orden: resolver dependencias de autenticación/publicaciones → datos/contratos → transacciones → worker/conciliación → eventos y UI → pruebas y convergencia.

## Corrección planificada de presentación móvil — 2026-10-19

### Hallazgo y alcance

`Frontend/src/app/reservations.tsx` y `Frontend/src/app/publication/[id].tsx` imprimen `reservation.id` y `reservation.status`. `Frontend/src/app/sales.tsx` imprime IDs de reserva/publicación, estados y tipos técnicos en filas y en el diálogo de confirmación. Son datos del contrato que se están mostrando sin adaptación al usuario.

### Diseño de la corrección (AC-11..13)

1. Crear una capa pura de presentación en `Frontend/src/lib/reservation-presentation.ts`: mapa exhaustivo `ACTIVE → Activa`, `COMPLETED → Entrega confirmada`, `CANCELLED → Cancelada`, `EXPIRED → Vencida`; tipo de publicación `LIVE → En vivo`, `STATIC → Estática` y estados de publicación `ACTIVE → Activa`, `FINISHED` estática → Vendida, `FINISHED` en vivo → Finalizada, `HIDDEN_BY_REPORTS → Oculta por reportes`. Un valor futuro no reconocido se muestra como «Estado no disponible» o «Tipo no disponible», nunca como enum crudo.
2. Formatear `reservedAt`, `expiresAt` y `resolvedAt` con locale `es-MX` y zona horaria del dispositivo; manejar fechas inválidas sin exponer `Invalid Date`. Mostrar «Vence» solo mientras la reserva esté activa y aún tenga plazo. Si el reloj local alcanza `expiresAt` antes de que el servidor cambie `ACTIVE`, mostrar «Plazo terminado; actualizando», deshabilitar la acción y solicitar una actualización al cruzar el plazo, sin repetirla en cada segundo. El servidor conserva autoridad sobre el estado.
3. Reemplazar encabezados UUID por `publicationTitle`, fecha/hora del apartado y «Unidad N de M» solo cuando haya varias reservas de esa publicación. Ordenar por `reservedAt` y desempatar con `id` interno para que dos reservas del mismo segundo tengan referencias visuales distintas. Conservar el ID como `key` de React y argumento de `cancelReservation`/`completeReservation`; no imprimirlo ni usarlo en etiquetas accesibles.
4. Aplicar la misma presentación en `reservations.tsx`, `publication/[id].tsx` y `sales.tsx`. En el diálogo del vendedor, describir la acción concreta con título, comprador y momento de apartado; para acciones de publicación, usar su título y tipo en vez de `publicationId`. Mantener las confirmaciones y permisos existentes.

### Contratos, compatibilidad y recuperación

- Sin cambios de Prisma, migraciones, endpoints, payloads ni enums del backend. Los UUID continúan identificando cada reserva y las claves de idempotencia conservan su comportamiento.
- No se almacena un número de reserva derivado. «Unidad N de M» es una referencia de pantalla calculada sobre el conjunto recibido; el UUID sigue siendo la única clave de operación.
- La corrección se limita a presentación móvil. Si hay regresión, se revierten helper/vistas sin transformar datos persistidos.

### Verificación prevista

- Pruebas del helper para todos los estados, `ACTIVE` con plazo transcurrido, valores inesperados, fechas inválidas y empate de `reservedAt`.
- Pruebas de pantalla comprador/vendedor con dos reservas del mismo producto: ningún UUID ni enum técnico visible, etiquetas en español y acción HTTP con el ID correcto para la tarjeta elegida.
- `npx tsc --noEmit`, suites Jest pertinentes y `node scripts/check-sdd.mjs`; recorrido Android en dispositivo o emulador con reserva, cancelación, confirmación, expiración y dos apartados del mismo producto. Registrar resultados como EV-12..14 antes de cerrar AC-11..13, T-06/T-11 o TASKS 5.3/5.5.

### Convergencia con la constitución

I–II: AC-11..13 → T-12..14 → EV-12..14 y DEC-04/05 cierran el comportamiento esperado. III–IV: IDs y estados del servidor siguen gobernando operaciones/stock y los contratos no cambian. V: se exige evidencia de mapeo, acción individual y dispositivo. VI: el cambio queda acotado a texto y presentación de reservas/publicaciones en estas vistas.
