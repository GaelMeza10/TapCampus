# 0001 — Verificación y convergencia

Estado: **Infraestructura verificada; aceptación de reservas sin ejecutar** | Fecha: 2026-10-04

No existe implementación del módulo de reservas. Las pruebas siguientes son el plan de evidencia; `EV` es un identificador reservado, no una prueba aprobada.

| AC | Tarea(s) | Evidencia requerida | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-02, T-03, T-06, T-07 | EV-01: alta 201, stock, fecha, precio fijado y contacto | Pendiente |
| AC-02 | T-03, T-07 | EV-02: 50 peticiones, 1×201 y 49×409 | Pendiente |
| AC-03 | T-03, T-06, T-07 | EV-03: rechazos y ausencia de mutación | Pendiente |
| AC-04 | T-04, T-07 | EV-04: vendedor/otro actor, estado y stock | Pendiente |
| AC-05 | T-04, T-06, T-07 | EV-05: cancelación repetida y permisos | Pendiente |
| AC-06 | T-02, T-05, T-07 | EV-06: vencimiento, reinicio y job duplicado | Pendiente |
| AC-07 | T-04, T-05, T-06, T-07 | EV-07: cierre manual, resolución previa y evento | Pendiente |
| AC-08 | T-05, T-06, T-07 | EV-08: feed reaparece solo si publicación vigente | Pendiente |
| AC-09 | T-01, T-02, T-03, T-06, T-07 | EV-09: dos reservas independientes visibles para ambos actores, reintento concurrente 200 sin doble descuento, clave ausente 400 y clave cruzada 409 | Pendiente |

## Registro de ejecución

### EV-10 — Dependencia de datos (T-02)

2026-10-04, Windows/Node 24.13/PostgreSQL 16.15: `npm run test:infra` en `Backend/` y aplicación local de `npm run db:migrate:safe -- --backup-verified`, tras respaldo/restore comprobados. [0010 EV-02/03/04](../0010-infraestructura-y-base-de-datos/verification.md) acredita precio Decimal(10,2) obligatorio, UUID de idempotencia, unicidad por comprador/clave, varias reservas por comprador/publicación, índice status/fecha, conservación de relaciones y rechazo del backfill sin evidencia. T-02 completa. Esta evidencia no acredita creación HTTP, bloqueo de fila, worker ni reintentos de 0001; EV-01..09 continúan por ejecutar.

| Fecha | Entorno y comando | Resultado | Evidencia adjunta |
| --- | --- | --- | --- |
| 2026-10-04 | PostgreSQL 16.15 / Node 24.13; npm run test:infra, migración local tras respaldo restaurado | Esquema aprobado; pruebas HTTP/worker del feature sin ejecutar | EV-10 / 0010 EV-02/03/04 |

## Convergencia

- Especificación ↔ plan: decisiones resueltas; contrato documental listo.
- Plan ↔ código: pendiente; no hay módulo de reservas.
- Criterios ↔ pruebas: definidos, sin ejecución.
- Desvíos y tareas nuevas: registrar aquí antes de cerrar.
- Conclusión: **no verificado**.
