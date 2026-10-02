# 0009 — Plan provisional de reportes y moderación

Estado: **Provisional por DEC-01/02** | Especificación: `spec.md`

## Contexto y diseño previsto

- Partir de `Report(reporter_id, publication_id, reason, created_at)` y `PublicationStatus.HIDDEN_BY_REPORTS`. Antes de migrar, inspeccionar datos y planificar respaldo; añadir restricción única `(reporter_id, publication_id)` cuando el contrato esté aprobado.
- Para registrar reportes, usar identidad autenticada, verificar publicación y actualizar el estado únicamente cuando el número de reportantes distintos llegue a tres. La inserción y la transición necesitan una operación atómica para evitar carreras. La ruta, errores exactos y campos de entrada se fijarán después de DEC-02.
- Filtrar `HIDDEN_BY_REPORTS` de listados públicos desde servidor. La revisión de moderador y posible restauración requieren DEC-01; no asumir reglas de sanción ni de borrado.
- El cliente podrá mostrar la acción de reportar y sus errores solo si se incluye RF-14. Revisar `docs/04_UI_UX_GUIDELINES.md` antes de diseñar pantallas.

## Constitución

| Principio | Aplicación |
| --- | --- |
| I–II | RF-14/US-10 → AC-01..03 → T → EV; decisiones abiertas impiden implementación. |
| III | Umbral y transición atómicos, reportante único por publicación. |
| IV | Permisos y exposición se fijan tras DEC-01/02. |
| V | Pruebas de umbral, duplicados, carrera y feed previstas; sin ejecutar. |
| VI | SHOULD separado del núcleo MUST; inclusión requiere decisión explícita. |

## Dependencias y verificación prevista

Depende de 0002 autenticación y 0003/0004 publicaciones. Tras cerrar DEC-01/02: definir contrato API y moderación → plan de migración → operaciones y feed → interfaz → pruebas contra PostgreSQL real con reportantes distintos y solicitudes concurrentes. Revisar manualmente el resultado de moderación antes de cerrar AC-03.
