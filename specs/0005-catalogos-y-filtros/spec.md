# 0005 — Catálogos y filtros del feed

Estado: **En implementación; backend fase 2 verificado, móvil pendiente** | Fecha: 2026-10-05

## Contexto y fuentes

RF-05c y RNF-03; US-05c. Arquitectura define cinco zonas y doce categorías separadas por PublicationType desde 0046 (antes ocho). Seed exacto/repetición/remapeo seguro verificados por 0010; catálogos HTTP y filtros AND históricos en EV-06; ampliación y nueva evidencia en 0046. La evidencia anterior conserva su alcance de ocho categorías.

## Alcance y contratos observables

Ampliación aprobada 2026-11-06 en [0025](../0025-busqueda-publicaciones/spec.md): búsqueda por q opcional combinada con los filtros existentes. Las restricciones históricas de query de fase 2 que aparecen debajo describen el contrato anterior; el actual admite también q según 0025. Evidencia nueva en ese expediente, sin reescribir resultados de 0005.

- `GET /zones` entrega las cinco zonas definidas en arquitectura. `GET /categories?type=LIVE|STATIC` entrega seis categorías por tipo, sin mezclar conjuntos (ampliación 0046).
- `GET /publications?type=LIVE|STATIC&zoneId=<id>&categoryId=<id>` permite omitir filtros y combinar los presentes por intersección. Devuelve solo publicaciones visibles del tipo solicitado según 0003/0004.
- La app expone controles de zona y categoría, preserva filtros al cambiar vistas según navegación y usa catálogo, sin GPS ni solicitud de permiso de ubicación. No hay búsqueda por coordenadas.
- Query inválida o categoría incompatible con el tipo solicitado responde `400`; combinación válida sin resultados devuelve `200` con lista vacía.

## Criterios de aceptación

## Contrato backend de fase 2 — 2026-10-05

GET catálogos devuelve arrays `{id,name}` para zonas y `{id,name,type}` para categorías, ordenados por id. `type` es opcional en categorías (sin filtro entrega ambos conjuntos), valores distintos de LIVE/STATIC reciben `400`. Queries desconocidas, IDs no enteros positivos/repetidos, referencias inexistentes y categoría cruzada reciben `400`; combinación válida vacía recibe `200 []`. GET publicaciones admite solo `type,zoneId,categoryId`, todos opcionales e intersectados. Usa visibilidad y proyección de 0003/0004. Se reutiliza seed verificado, sin migrar ni sembrar la base configurada durante esta fase. AC-04 móvil permanece pendiente.

### AC-01 — Catálogos correctos
**Dado** la base inicializada, **cuando** se consultan zonas y categorías por tipo, **entonces** se obtienen las cinco zonas y las seis categorías propias de cada tipo definidas en arquitectura. La ampliación se verifica en 0046 sin reescribir EV históricas.

### AC-02 — Filtros combinables
**Dado** publicaciones de varias zonas/categorías, **cuando** se envían `type`, `zoneId` y `categoryId`, **entonces** solo se listan las que cumplen todos los filtros y la visibilidad del tipo; sin coincidencias devuelve `200` y lista vacía.

### AC-03 — Entrada inválida
**Dado** un ID no válido, tipo desconocido o categoría del otro tipo, **cuando** se consulta el feed, **entonces** responde `400` sin resultados de tipo incorrecto.

### AC-04 — Filtro móvil sin GPS
**Dado** un usuario en el feed, **cuando** selecciona zona/categoría, **entonces** ve el resultado filtrado y la app no pide ubicación ni usa coordenadas.
