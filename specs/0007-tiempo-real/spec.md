# 0007 — Actualización en tiempo real del feed

Estado: **Planificado; implementación pendiente** | Fecha: 2026-10-01

## Contexto y fuentes

RNF-02; US-03, US-05 y US-06. `docs/03_ARCHITECTURE.md` define Socket.io y tres eventos; RF-04, RF-05b, RF-07, RF-09 y RF-12 producen cambios que el usuario debe ver. `Frontend/src/app/homePage.tsx` existe, pero no hay gateway ni cliente Socket.io implementados.

## Alcance y contrato observable

- `stock_updated` comunica `{ publicationId: UUID, newStock: integer }` después de una reserva, cancelación, expiración de reserva o venta física que cambia stock disponible.
- `publication_expired` comunica `{ publicationId: UUID }` cuando una publicación `LIVE` termina por horario. Una venta con stock cero desaparece por la regla de visibilidad del feed, aun si no cambia su `status`.
- `ganga_activated` comunica `{ publicationId: UUID, newPrice: decimal-string }` cuando la ganga se activa y el feed actualiza precio, distintivo y posición.
- El cliente se suscribe mientras muestra el feed. Al reconectar o volver a primer plano vuelve a consultar la API para recuperar eventos perdidos; el servidor sigue siendo fuente de verdad.
- Fuera de alcance: chat, notificaciones push, reloj de servidor transmitido cada segundo y geolocalización.

## Criterios de aceptación

### AC-01 — Stock visible sin recarga manual
**Dado** dos clientes conectados al feed, **cuando** una operación confirmada cambia stock, **entonces** ambos reflejan `newStock` sin gesto de recarga, usando `stock_updated` con el ID correcto.

### AC-02 — Fin de publicación
**Dado** una publicación visible, **cuando** vence su horario y se confirma su cierre, **entonces** ambos clientes la retiran del feed mediante `publication_expired` o la siguiente sincronización, sin permitir nuevas reservas.

### AC-03 — Ganga visible
**Dado** una publicación con ganga, **cuando** se activa, **entonces** los clientes reciben `ganga_activated`, muestran precio/distintivo y la posicionan según el orden del feed.

### AC-04 — Recuperación de desconexión
**Dado** un cliente desconectado durante cambios, **cuando** reconecta o vuelve al feed, **entonces** consulta el estado actual y no conserva stock ni precio obsoletos.

### AC-05 — Solo cambios confirmados
**Dado** una operación fallida o un job repetido sin transición efectiva, **cuando** se procesa, **entonces** no se publica un estado nuevo que contradiga la base de datos.
