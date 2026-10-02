# 0005 — Plan técnico

Estado: **Planificado** | Especificación: `spec.md`

## Diseño

- Ajustar `Backend/prisma/seed.ts` a los cinco nombres exactos de `docs/03_ARCHITECTURE.md` y categorías exactas. El seed debe ser repetible mediante `upsert`. Antes de quitar o renombrar zonas existentes, inspeccionar claves foráneas y planificar remapeo; no borrar datos referenciados por sorpresa.
- Exponer `GET /zones` y `GET /categories?type=...` con DTO de lectura; verificar tipo de categoría y unicidad `(name,type)` ya declarada en Prisma.
- En `GET /publications`, validar query con DTO, componer filtros `AND` y aplicar visibilidad servidor: `LIVE` dentro de horario y stock disponible; `STATIC` activo. Ordenación ganga se integra con 0006. No filtrar solo en el cliente.
- En móvil, selector de zona y categorías del tipo actual, estado visible de filtros y `FlatList`; usar `docs/04_UI_UX_GUIDELINES.md`. No depender de permiso GPS.

## Constitución

| Principio | Cumplimiento |
| --- | --- |
| I–II | RF-05c/RNF-03/US-05c → AC-01..04 → T → EV. |
| III | Lectura no cambia inventario; visibilidad deriva del servidor. |
| IV | Query, catálogos y `400` por tipo inválido son contrato entre capas. |
| V | Seed, HTTP y UI requieren evidencia real. |
| VI | Catálogo manual y ausencia de GPS/pagos explícitos. |

## Verificación y orden

Primero reconciliar seed y datos, luego endpoints, consulta combinada y UI. Probar seed repetido, categoría cruzada, filtros individuales/combinados, respuesta vacía y ausencia de solicitud de ubicación. Dependencias de lectura: 0003 y 0004.
