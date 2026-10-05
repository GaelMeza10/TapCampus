# 0005 — Catálogos y filtros del feed

Estado: **Planificado; implementación pendiente** | Fecha: 2026-10-01

## Contexto y fuentes

RF-05c y RNF-03; US-05c. `docs/03_ARCHITECTURE.md` define cinco zonas y ocho categorías separadas por `PublicationType`. Seed exacto, repetición y remapeo seguro verificados por 0010 el 2026-10-04. No hay API de catálogos ni de publicaciones.

## Alcance y contratos observables

- `GET /zones` entrega las cinco zonas definidas en arquitectura. `GET /categories?type=LIVE|STATIC` entrega cuatro categorías por tipo, sin mezclar conjuntos.
- `GET /publications?type=LIVE|STATIC&zoneId=<id>&categoryId=<id>` permite omitir filtros y combinar los presentes por intersección. Devuelve solo publicaciones visibles del tipo solicitado según 0003/0004.
- La app expone controles de zona y categoría, preserva filtros al cambiar vistas según navegación y usa catálogo, sin GPS ni solicitud de permiso de ubicación. No hay búsqueda por coordenadas.
- Query inválida o categoría incompatible con el tipo solicitado responde `400`; combinación válida sin resultados devuelve `200` con lista vacía.

## Criterios de aceptación

### AC-01 — Catálogos correctos
**Dado** la base inicializada, **cuando** se consultan zonas y categorías por tipo, **entonces** se obtienen las cinco zonas y las cuatro categorías propias de cada tipo definidas en arquitectura.

### AC-02 — Filtros combinables
**Dado** publicaciones de varias zonas/categorías, **cuando** se envían `type`, `zoneId` y `categoryId`, **entonces** solo se listan las que cumplen todos los filtros y la visibilidad del tipo; sin coincidencias devuelve `200` y lista vacía.

### AC-03 — Entrada inválida
**Dado** un ID no válido, tipo desconocido o categoría del otro tipo, **cuando** se consulta el feed, **entonces** responde `400` sin resultados de tipo incorrecto.

### AC-04 — Filtro móvil sin GPS
**Dado** un usuario en el feed, **cuando** selecciona zona/categoría, **entonces** ve el resultado filtrado y la app no pide ubicación ni usa coordenadas.
