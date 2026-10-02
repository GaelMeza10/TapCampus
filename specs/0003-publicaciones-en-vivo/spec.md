# 0003 — Publicaciones en vivo e inventario disponible

Estado: **Planificado; implementación pendiente** | Fecha: 2026-10-01

## Contexto y fuentes

RF-03, RF-04, RF-05b, RNF-03; US-03 y US-05b. RF-05 (US-05d) se documenta como comportamiento SHOULD relacionado. Fuentes: `docs/02_REQUIREMENTS.md`, `docs/03_ARCHITECTURE.md`, `docs/04_UI_UX_GUIDELINES.md`, `docs/05_USER_FLOWS.md`, `README.md` y `TASKS.md` 2.3–2.7, 3.5, 5.2, 5.4–5.5. Solo existen modelo Prisma, tarjetas y una pantalla de inicio parcial; no hay API de publicaciones ni subida de imágenes.

## Alcance y contratos observables

- El vendedor autenticado crea `LIVE` con foto, título, descripción, precio, categoría `LIVE`, zona, stock inicial positivo y horas de inicio/fin. `POST /uploads` entrega la URL de imagen; `POST /publications` persiste `image_url` y demás campos.
- `GET /publications?type=LIVE` devuelve solo publicaciones visibles: `ACTIVE`, dentro de horario y con stock disponible positivo. El temporizador se calcula con `end_time` del servidor; la app no decide la expiración.
- El vendedor puede editar datos permitidos de su publicación activa mediante `PATCH /publications/:id`. `POST /publications/:id/physical-sale` resta una pieza **disponible**; no toca reservas activas. Un usuario ajeno recibe `403`.
- Cuando llega `end_time`, la publicación sale del feed, impide nuevas reservas y emite `publication_expired`. Las reservas activas previas pueden confirmarse por el vendedor dentro de sus propios 20 minutos; las vencidas liberan stock sin reactivar el feed. El cierre manual SHOULD usa `POST /publications/:id/finish` y aplica la misma continuidad.
- Respuestas: `400` para datos mal formados, `401` sin JWT, `403` para ajenos, `404` si no existe y `409` para estado/stock incompatible. La visibilidad tras liberar stock y el destino de reservas activas están definidos en 0001 y `decisions.md`.
- Fuera de alcance: pagos, GPS, reservas (0001), activación de ganga (0006) y moderación.

## Criterios de aceptación

### AC-01 — Crear publicación válida
**Dado** un vendedor autenticado y catálogos válidos, **cuando** envía foto y datos `LIVE` completos con stock mayor que cero e inicio anterior al fin, **entonces** obtiene `201` y la publicación pertenece a ese vendedor con inventario inicial correcto.

### AC-02 — Rechazar datos inválidos
**Dado** una categoría de tipo `STATIC`, zona inexistente, precio no positivo, stock negativo/cero, imagen ausente o fechas invertidas, **cuando** se crea una `LIVE`, **entonces** responde `400`, sin publicación parcial.

### AC-03 — Visibilidad y temporizador
**Dado** publicaciones antes, dentro y después de su ventana, o con stock cero, **cuando** el comprador abre el feed, **entonces** ve solo las activas y disponibles; el temporizador del detalle corresponde a `end_time`.

### AC-04 — Expirar por tiempo
**Dado** una `LIVE` visible con reserva previa activa, **cuando** llega `end_time`, **entonces** desaparece del feed, rechaza reservas nuevas y se emite `publication_expired` una vez; el vendedor aún puede confirmar esa reserva antes de su propio vencimiento, y su expiración posterior no reactiva la publicación.

### AC-05 — Venta física concurrente
**Dado** stock disponible 1, **cuando** una venta física y una reserva compiten, **entonces** solo una descuenta la pieza, el stock nunca es negativo y las reservas anteriores permanecen intactas.

### AC-06 — Propiedad y edición
**Dado** una publicación activa, **cuando** su vendedor actualiza datos permitidos, **entonces** se guardan valores válidos sin afectar reservas; otro usuario recibe `403` y ningún cambio.

### AC-07 — Cierre manual SHOULD
**Dado** una `LIVE` con reserva activa, **cuando** el vendedor la finaliza, **entonces** desaparece del feed, bloquea reservas nuevas y conserva la reserva existente hasta su resolución; otro usuario recibe `403`.

## Decisiones

DEC-02 está resuelta y reflejada en 0001. Implementación y pruebas pendientes.
