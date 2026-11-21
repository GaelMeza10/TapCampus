# 0004 — Catálogo de publicaciones estáticas

Estado: **En implementación; backend fase 2 verificado, móvil pendiente** | Fecha: 2026-10-05

## Contexto y fuentes

Ampliación 2026-11-21: el texto de creación/edición STATIC aplica RF-15 según [0038](../0038-filtro-palabras-publicaciones/spec.md). Las proyecciones se separan conforme a 0037; contacto estático directo y ausencia de reservas se conservan. Evidencia del filtro pendiente y separada de la línea base.

RF-06, RNF-03; US-04 y US-11. `README.md` define STATIC sin temporizador ni reservas y con contacto directo; arquitectura exige categoría/zona y flujos definen «Vendida». API STATIC/FINISHED implementada y verificada en EV-06; integración móvil pendiente.

## Alcance y contrato observable

- El vendedor autenticado crea artículo `STATIC` con foto, título, descripción, precio, zona y categoría `STATIC`, mediante `POST /publications` tras cargar la imagen. No se requieren stock ni horario ni ganga.
- `GET /publications?type=STATIC` y `GET /publications/:id` muestran artículos `ACTIVE` sin temporizador ni botón de reserva. El comprador puede abrir WhatsApp desde el detalle; el enlace se especifica en 0008.
- El vendedor marca el artículo vendido con `POST /publications/:id/sold`. El backend persiste `FINISHED` y la UI muestra «Vendido» en su gestión; el artículo ya no aparece en el catálogo activo.
- Solo el creador puede editar o marcar vendida su publicación. Se usan `400` para datos inválidos, `401` sin sesión, `403` ajeno, `404` inexistente y `409` transición repetida/incompatible.
- Fuera de alcance: reserva, temporizador, inventario de piezas, ganga, GPS y pagos.

## Criterios de aceptación

## Contrato backend de fase 2 — 2026-10-05

Comparte upload, nombres snake_case, precio decimal, DTO estricto y proyección con 0003. STATIC rechaza stock, horarios y ganga, incluso null; persiste campos LIVE null. Detalle solo ACTIVE (otro estado `404`), contacto `sellerContact: {phone}` sin hash/email. PATCH solo campos comunes de 0003 en ACTIVE. `POST /publications/:id/sold` exige cuerpo vacío y devuelve `200` con FINISHED; LIVE o estado distinto de ACTIVE: `409`, ajeno: `403`, inexistente: `404`. Transición protegida por bloqueo de fila; repetición concurrente solo permite un éxito. UI y apertura WhatsApp se verifican después, sin cerrar el expediente en fase 2.

### AC-01 — Crear artículo estático
**Dado** vendedor autenticado e imagen válida, **cuando** crea un artículo con zona y categoría `STATIC`, **entonces** recibe `201` y queda `ACTIVE` sin stock ni horarios exigidos.

### AC-02 — Validación por tipo
**Dado** categoría `LIVE`, precio no positivo, foto ausente o zona inexistente, **cuando** se intenta crear `STATIC`, **entonces** responde `400` sin publicación parcial.

### AC-03 — Catálogo y contacto
**Dado** artículo `STATIC` activo, **cuando** el comprador abre listado y detalle, **entonces** ve datos e imagen sin temporizador ni reserva y puede iniciar una consulta por WhatsApp.

### AC-04 — Marcar vendido
**Dado** artículo activo, **cuando** su vendedor lo marca «Vendido», **entonces** pasa a `FINISHED`, desaparece del catálogo activo y una repetición recibe `409` sin nueva transición.

### AC-05 — Propiedad
**Dado** artículo de otro vendedor, **cuando** un usuario intenta editarlo o marcarlo vendido, **entonces** recibe `403` y los datos no cambian.
