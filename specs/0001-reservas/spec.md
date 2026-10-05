# 0001 — Reservas de ventas en vivo

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

## Contexto y fuentes

El comprador necesita apartar una pieza durante 20 minutos y el vendedor confirmar su entrega. Fuentes: `docs/02_REQUIREMENTS.md` (RF-04, RF-05, RF-05b, RF-07 a RF-10, RNF-01, RNF-02), `docs/03_ARCHITECTURE.md` (Reservation, rutas y eventos), `docs/05_USER_FLOWS.md`, `docs/06_USER_STORIES_AND_TASKS.md` (US-06, US-07, US-07b, US-08), `docs/07_VALIDATION.md` y `TASKS.md` (3.1–3.5, 5.3, 6.1).

El esquema contiene `Reservation` con precio/idempotencia y `Publication` con CHECK de stock, migrados y verificados por 0010 (2026-10-04). Fases 1/2 revalidadas y reservas backend verificadas en fase 3; móvil pendiente.

## Alcance

- Incluye reserva de **una unidad** de publicación `LIVE`, confirmación del vendedor, cancelación del comprador, expiración a los 20 minutos, control de concurrencia y aviso de stock.
- Excluye pagos, GPS, reservas de publicaciones `STATIC`, chat propio y cambios del precio ganga.
- Depende de publicación disponible, identidad autenticada, PostgreSQL y worker persistente.

## Reglas y contratos observables

- `POST /reservations` recibe `{ publicationId }`, JWT y encabezado obligatorio `Idempotency-Key` (UUID nuevo por acción del comprador; ausente o inválido `400`). La primera creación devuelve `201` con `id`, `publicationId`, `status: ACTIVE`, `reservedAt`, `expiresAt` ISO 8601, `unitPrice` cadena decimal de dos posiciones y `sellerContact.phone` canónico. Un reintento del mismo comprador, clave y publicación devuelve la misma reserva y su estado actual con `200`, sin otro descuento de stock; reutilizar la clave para otra publicación responde `409`.
- `GET /reservations/mine` permite al comprador consultar cada reserva propia; `GET /publications/:id/reservations` permite al vendedor propietario ver las de su publicación; `GET /reservations/:id` da detalle a comprador o vendedor relacionados. Otro actor recibe `403`. Los contactos se exponen solo conforme a RF-13.
- Un comprador puede mantener varias reservas activas independientes de la misma publicación, una unidad cada una, si queda stock. Una nueva acción emplea otra clave; no existe unicidad por comprador/publicación. El precio de cada reserva se fija al confirmarla y cambios posteriores del precio visible no la alteran.
- Solo se reserva una publicación `LIVE` en estado `ACTIVE`, dentro de su ventana de venta y con `current_stock > 0`. La operación crea la reserva y resta una pieza de stock disponible de forma atómica.
- `POST /reservations/:id/complete` permite únicamente al vendedor pasar `ACTIVE → COMPLETED` antes del vencimiento; el stock disponible no cambia otra vez.
- `POST /reservations/:id/cancel` permite únicamente al comprador pasar `ACTIVE → CANCELLED` antes del vencimiento; libera una pieza una sola vez.
- A los 20 minutos, el servidor pasa `ACTIVE → EXPIRED` y libera una pieza una sola vez. Un job atrasado no cambia una reserva ya resuelta. La app cerrada o el reinicio del servidor no alteran la fecha límite.
- Si la publicación se finaliza manualmente o alcanza `end_time`, se rechazan reservas nuevas y las reservas activas previas conservan su derecho de completarse dentro de sus propios 20 minutos o expirar.
- Si se libera stock y la publicación sigue `ACTIVE` dentro de horario, vuelve al feed; una publicación `FINISHED` no se reactiva (DEC-01 resuelta).
- Los cambios confirmados de stock emiten `stock_updated` con `{ publicationId, newStock }`. El feed se vuelve a consultar si pierde eventos.
- Los rechazos por stock agotado o venta no disponible son `409`; acciones de otro actor son `403`. El estado final de una reserva no retrocede a `ACTIVE`.

## Criterios de aceptación

### AC-01 — Reserva exitosa

**Dado** una publicación `LIVE` vigente con stock 2 y comprador autenticado, **cuando** reserva una unidad con clave nueva, **entonces** obtiene `201`, existe una reserva `ACTIVE`, el stock disponible es 1, la respuesta contiene `expiresAt` a 20 minutos, `unitPrice` igual al precio vigente al confirmar y el contacto autorizado.

### AC-02 — Última pieza concurrente

**Dado** stock 1, **cuando** 50 compradores diferentes envían la reserva a la vez, **entonces** exactamente una petición obtiene `201`, 49 reciben `409`, existe una sola reserva `ACTIVE` y el stock queda en 0.

### AC-03 — Publicación no reservable

**Dado** una publicación `STATIC`, finalizada, fuera de horario o sin stock, **cuando** se intenta reservar, **entonces** la API responde `409` y no crea reserva ni cambia inventario.

### AC-04 — Confirmación autorizada

**Dado** una reserva `ACTIVE` antes de su vencimiento, incluso si la publicación ya alcanzó `end_time`, **cuando** su vendedor confirma entrega, **entonces** queda `COMPLETED` al precio fijado y el stock disponible no cambia; otro usuario recibe `403`.

### AC-05 — Cancelación autorizada e idempotencia de estado

**Dado** una reserva `ACTIVE` antes de su vencimiento, **cuando** su comprador cancela, **entonces** queda `CANCELLED` y se libera una pieza; una segunda ejecución no libera otra. Otro usuario recibe `403`.

### AC-06 — Expiración resistente a reinicio

**Dado** una reserva `ACTIVE` sin entrega confirmada, **cuando** llega la fecha límite y se ejecuta o recupera el worker tras reinicio, **entonces** queda `EXPIRED`, se libera exactamente una pieza y el mismo job repetido no cambia el resultado.

### AC-07 — Cierre manual y evento

**Dado** una publicación finalizada con reserva activa previa, **cuando** otro comprador intenta reservar, **entonces** recibe `409`; la reserva previa puede resolverse. Cada cambio efectivo de stock emite un `stock_updated` con el nuevo valor confirmado.

### AC-08 — Stock liberado y visibilidad

**Dado** una `LIVE` oculta solo porque su stock llegó a cero, **cuando** se cancela o expira una reserva antes de `end_time`, **entonces** el stock vuelve a ser positivo y la publicación reaparece en el feed si sigue `ACTIVE`; si ya está `FINISHED`, no reaparece.

### AC-09 — Varias reservas e idempotencia del reintento

**Dado** el mismo comprador, la misma publicación y stock 2, **cuando** envía dos acciones con claves distintas, **entonces** obtiene dos reservas `ACTIVE` visibles por separado para comprador y vendedor y stock 0; al repetir cualquiera de las claves, aun concurrentemente, recibe `200` con la reserva original y el stock sigue en 0. Una clave usada para otra publicación recibe `409`; una clave ausente o inválida recibe `400`.

## Decisiones

## Precisión del contrato backend de fase 3 — 2026-10-05

Complete/cancel reciben cuerpo vacío y devuelven 200 con la reserva; estado terminal o plazo vencido devuelve 409 sin mutación. El contacto del vendedor se entrega al comprador relacionado desde la reserva creada; el teléfono del comprador solo al vendedor relacionado mientras la reserva esté ACTIVE y no vencida. Consultas sin JWT: 401; ID inexistente: 404. UUID y claves se normalizan a minúsculas. El vencimiento se comprueba después de adquirir los bloqueos, con hora de servidor. Los reintentos devuelven el estado persistido actual incluso después de resolverse la reserva.

DEC-02/03 y 0003 DEC-02 están resueltas en `decisions.md`. Backend aprobado en EV-01..09; móvil pendiente.
