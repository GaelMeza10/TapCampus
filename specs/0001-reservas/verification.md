# 0001 — Verificación y convergencia

Estado: **Sin ejecutar** | Fecha: 2026-10-01

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

| Fecha | Entorno y comando | Resultado | Evidencia adjunta |
| --- | --- | --- | --- |
| — | — | Sin ejecutar | — |

## Convergencia

- Especificación ↔ plan: decisiones resueltas; contrato documental listo.
- Plan ↔ código: pendiente; no hay módulo de reservas.
- Criterios ↔ pruebas: definidos, sin ejecución.
- Desvíos y tareas nuevas: registrar aquí antes de cerrar.
- Conclusión: **no verificado**.
