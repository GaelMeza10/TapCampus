# 0002 — Verificación

Estado: **Sin ejecutar** | Fecha: 2026-10-01

La revisión de línea base encontró código parcial; no es evidencia de aceptación. `npx tsc --noEmit --incremental false` en backend falla por `prisma.usuario` y problemas del seed; frontend `npx tsc --noEmit` pasa. Ningún EV se declara aprobado.

| AC | Tarea(s) | Evidencia requerida | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02, T-04, T-05 | EV-01: HTTP 400 sin fila creada y error visible | Pendiente |
| AC-02 | T-01, T-02, T-05 | EV-02: HTTP 201 con números nacionales y `+52` de distintas regiones, teléfono canónico, hash persistido y respuesta saneada | Pendiente |
| AC-03 | T-02, T-04, T-05 | EV-03: faltantes y teléfono inválido 400; correo duplicado 409 | Pendiente |
| AC-04 | T-03, T-05 | EV-04: login válido/ inválido con respuesta correcta | Pendiente |
| AC-05 | T-03, T-04, T-05 | EV-05: ruta protegida, token y navegación móvil | Pendiente |
| AC-06 | T-01, T-04, T-05 | EV-06: compilación e integración entre capas | Pendiente |

## Convergencia

Especificación y plan están definidos; implementación y evidencia pendientes. No marcar `TASKS.md` 2.1, 2.2, 4.3 ni 5.1 como completas hasta verificar los criterios.
