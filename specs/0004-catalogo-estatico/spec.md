# 0004 — Catálogo de publicaciones estáticas

Estado: **Planificado; implementación pendiente** | Fecha: 2026-10-01

## Contexto y fuentes

RF-06, RNF-03; US-04 y US-11. `README.md` define que una venta estática no tiene temporizador ni reservas y permite contacto directo; `docs/03_ARCHITECTURE.md` exige categoría y zona, y `docs/05_USER_FLOWS.md` describe el cierre al marcar «Vendida». No existe API de publicaciones; el esquema Prisma ya soporta `STATIC` y `FINISHED`.

## Alcance y contrato observable

- El vendedor autenticado crea artículo `STATIC` con foto, título, descripción, precio, zona y categoría `STATIC`, mediante `POST /publications` tras cargar la imagen. No se requieren stock ni horario ni ganga.
- `GET /publications?type=STATIC` y `GET /publications/:id` muestran artículos `ACTIVE` sin temporizador ni botón de reserva. El comprador puede abrir WhatsApp desde el detalle; el enlace se especifica en 0008.
- El vendedor marca el artículo vendido con `POST /publications/:id/sold`. El backend persiste `FINISHED` y la UI muestra «Vendido» en su gestión; el artículo ya no aparece en el catálogo activo.
- Solo el creador puede editar o marcar vendida su publicación. Se usan `400` para datos inválidos, `401` sin sesión, `403` ajeno, `404` inexistente y `409` transición repetida/incompatible.
- Fuera de alcance: reserva, temporizador, inventario de piezas, ganga, GPS y pagos.

## Criterios de aceptación

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
