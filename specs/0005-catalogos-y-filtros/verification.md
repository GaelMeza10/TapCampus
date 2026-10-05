# 0005 — Verificación

Estado: **Seed verificado; aceptación HTTP/móvil sin ejecutar** | Fecha: 2026-10-04

| AC | Tarea(s) | Evidencia requerida | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-02, T-05 | EV-01: seed repetido y catálogos HTTP exactos | Pendiente |
| AC-02 | T-03, T-04, T-05 | EV-02: matriz zona/categoría/tipo con intersección | Pendiente |
| AC-03 | T-02, T-03, T-05 | EV-03: queries inválidas 400 y vacío 200 | Pendiente |
| AC-04 | T-04, T-05 | EV-04: filtrado móvil sin permiso GPS | Pendiente |

## Convergencia

### EV-05 — Seed y referencias (T-01)

`npm run test:infra` en Backend con PostgreSQL 16.15/Node 24.13 y `PG_TOOLS_CONTAINER=backend-postgres-1`: salida 0. [0010 EV-05](../0010-infraestructura-y-base-de-datos/verification.md) acredita dos ejecuciones sobre base vacía y copia poblada, catálogo exacto 5/8, hashes idénticos al repetir y publicaciones con FK válidas. Sin remapeo para zona referenciada, transacción íntegramente revertida. En la base local configurada, respaldo/restore y ensayo precedieron al seed doble, también aprobado. T-01 completa; EV-01 conserva la parte HTTP y AC-01 sigue sin aceptación completa.

Modelo y seed verificados; endpoints, filtros y evidencias HTTP/móviles pendientes.
