# 0003 — Publicaciones en vivo e inventario disponible

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

## Contexto y fuentes

RF-03, RF-04, RF-05b, RNF-03; US-03 y US-05b. RF-05 (US-05d) es SHOULD relacionado. Fuentes: `docs/02_REQUIREMENTS.md`, `docs/03_ARCHITECTURE.md`, `docs/04_UI_UX_GUIDELINES.md`, `docs/05_USER_FLOWS.md`, `README.md` y `TASKS.md` 2.3–2.7, 3.5, 5.2, 5.4–5.5. API de creación/edición/lectura/venta física y uploads implementada/verificada en EV-08..10; UI sigue parcial; reservas/jobs/eventos verificados en fase 3.

## Alcance y contratos observables

- El vendedor autenticado crea `LIVE` con foto, título, descripción, precio, categoría `LIVE`, zona, stock inicial positivo y horas de inicio/fin. `POST /uploads` entrega la URL de imagen; `POST /publications` persiste `image_url` y demás campos.
- `GET /publications?type=LIVE` devuelve solo publicaciones visibles: `ACTIVE`, dentro de horario y con stock disponible positivo. El temporizador se calcula con `end_time` del servidor; la app no decide la expiración.
- El vendedor puede editar datos permitidos de su publicación activa mediante `PATCH /publications/:id`. `POST /publications/:id/physical-sale` resta una pieza **disponible**; no toca reservas activas. Un usuario ajeno recibe `403`.
- `GET /publications/mine` requiere JWT y devuelve solo publicaciones del vendedor, incluidas `LIVE` sin stock, futuras y `FINISHED`, ordenadas por creación e ID descendentes. Reutiliza la proyección de publicación sin contactos; permite gestionar estado y consultar reservas por ID aun cuando una publicación sale del feed público. Sin JWT responde `401`.
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

### AC-08 — Lista propia de ventas
**Dado** un vendedor con publicaciones activas, agotadas y finalizadas, **cuando** consulta `GET /publications/mine` con JWT, **entonces** recibe solo las suyas con sus estados y stock, sin teléfonos; un usuario sin JWT recibe `401`.

## Decisiones

## Extensión backend fase 3 — 2026-10-05

POST /publications/:id/finish recibe cuerpo vacío: propietario de LIVE ACTIVE antes del fin →200 FINISHED, otro actor →403, STATIC/estado terminal →409. No cambia reservas. Fin natural se persiste en FINISHED y emite publication_expired solo una vez. Edición de current_stock emite stock_updated si cambia efectivamente. Feed pasa a ordenar is_ganga_active descendente antes de created_at/id. Crear/editar horario encola fin natural y ganga después del commit; trabajos antiguos releen el horario actual.

## Contrato backend de fase 2 — 2026-10-05

- `POST /uploads`: multipart con exactamente un campo `file`, JPEG/PNG/WebP detectado por contenido, no vacío y máximo 5 MiB. Devuelve `201 { image_url }`, URL absoluta de `/uploads/<UUID>.<ext>`; nombre original ignorado. Ausente, campo extra, formato inválido o contenido falso: `400`; tamaño excedido: `413`; escritura fallida: `500` estándar sin datos internos. No se persiste archivo rechazado. `UPLOADS_DIR` opcional (predeterminado `Backend/uploads` al arrancar desde Backend); `PUBLIC_BASE_URL` opcional define origen externo, si se omite se usa origen de la petición.
- Cuerpos REST usan campos Prisma snake_case. Creación: `type,title,description,price,image_url,zone_id,category_id`; LIVE añade `initial_stock,start_time,end_time`. `current_stock` se inicializa igual a `initial_stock`. Precio JSON numérico, positivo, máximo 99999999.99 y dos decimales; respuesta decimal en cadena con dos posiciones. IDs catálogo enteros positivos. Fechas ISO 8601 con zona explícita, inicio anterior al fin y fin futuro. Texto obligatorio sin solo espacios. Imagen referencia un archivo existente de la subida local, usando URL devuelta o ruta `/uploads/...`.
- PATCH acepta `title,description,price,image_url,zone_id,category_id` y, en LIVE, `current_stock,start_time,end_time`. `id,type,seller_id,status,initial_stock,is_ganga_active` son inmutables desde DTO. Cuerpo vacío, null, campos desconocidos o exclusivos LIVE en STATIC: `400`. Edición solo ACTIVE y, en LIVE, antes de end_time (`409` si incompatible). Se valida el estado combinado, no solo el fragmento. Asignar current_stock ajusta únicamente inventario disponible; no modifica reservas ni su precio; mínimo cero.
- Configuración opcional LIVE de RF-11: `ganga_min_price,ganga_activation_mode,ganga_minutes_before`, sin activación/colas en esta fase. Mínimo positivo <= precio, modo MANUAL sin minutos o SCHEDULED con minutos enteros positivos y disparo dentro de ventana/futuro. Validar configuración combinada en PATCH; configuración activa no editable. La ejecución y reprogramación duradera pertenecen a 0006/fase 3.
- GET listado devuelve array de publicaciones visibles, orden estable por created_at/id descendente. GET detalle aplica la misma visibilidad: ausentes/ocultas/finalizadas, LIVE futura/agotada/vencida: `404`. Proyección explícita de vendedor `{id,name}`, sin email/hash/teléfono en feed ni LIVE. STATIC activo añade `sellerContact: {phone}` solo en detalle.
- Venta física recibe cuerpo vacío y devuelve `200` con publicación tras descontar uno. Requiere LIVE ACTIVE en ventana y stock >0, si incompatible `409`. Venta física/edición bloquean la fila con `SELECT FOR UPDATE`; una operación espera a la otra y valida después del bloqueo. No hay rutas DELETE ni cierre manual en fase 2. Eventos, worker, carrera HTTP con reservas y UI quedan pendientes de fases 3–5.

DEC-02 está resuelta y reflejada en 0001. Backend fases 2/3 verificado en EV-08..10 y EV-04/05/07; UI pendiente.
