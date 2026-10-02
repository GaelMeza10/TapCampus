# 0004 — Plan técnico

Estado: **Planificado** | Especificación: `spec.md`

## Diseño

- Reutilizar `Publication` con `type=STATIC`, `status=ACTIVE/FINISHED`, `zone_id`, `category_id`, `image_url` y `price`. En DTO, exigir categoría de tipo `STATIC`; no exigir campos exclusivos de `LIVE` y rechazar combinaciones incompatibles. No hay nueva migración de estado.
- Reutilizar `POST /uploads`, `POST /publications`, `GET /publications`, `GET /publications/:id` y `PATCH /publications/:id` con guards de JWT y propiedad. `POST /publications/:id/sold` cambia `ACTIVE → FINISHED` solo para `STATIC`; transacción o actualización condicional evita doble transición.
- El listado público filtra `ACTIVE` y tipo; el detalle de artículo estático activo entrega datos para enlace WhatsApp. No exponer datos sensibles adicionales del vendedor.
- En Expo Router, crear formulario `STATIC`, pestaña de catálogo, detalle y acción de marcar vendido para el vendedor; respetar `docs/04_UI_UX_GUIDELINES.md` y usar `FlatList` para listado.
- Compatibilidad: el frontend actual solo tiene pantallas de auth y un inicio parcial; no hay endpoint anterior que mantener. La imagen local de backend debe ser accesible desde el dispositivo, no solo desde el servidor.

## Constitución

| Principio | Cumplimiento |
| --- | --- |
| I–II | RF-06/US-04/11 → AC-01..05 → T → EV. |
| III | No reserva ni modifica stock; transición de venta condicional. |
| IV | Rutas, permisos, visibilidad de teléfono y errores definidos. |
| V | HTTP con dos vendedores y prueba móvil de listado/contacto. |
| VI | No GPS/pagos; cambios requieren actualizar especificación. |

## Verificación y orden

Para crear, listar y marcar vendido dependen 0002 autenticación, catálogos de 0005 y subida de imagen de 0003. El detalle estático se prepara antes de 0008; el botón de contacto y su prueba final se integran después con 0008. Probar creación válida/errónea, exclusión de `FINISHED` del listado, propiedad y contacto sin reserva. Revisar la migración destructiva existente antes de usar datos compartidos.
