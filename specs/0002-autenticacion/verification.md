# 0002 — Verificación

Estado: **Backend parcialmente verificado; aceptación integrada pendiente** | Fecha: 2026-10-04

La revisión histórica del 2026-10-01 encontró fallos de compilación por `prisma.usuario`/seed. La corrección del 2026-10-04 compila y dispone de evidencia HTTP backend; la integración móvil sigue sin probarse con el contrato inglés.

| AC | Tarea(s) | Evidencia requerida | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02, T-04, T-05 | EV-01: HTTP 400 sin fila creada y error visible | Pendiente |
| AC-02 | T-01, T-02, T-05 | EV-02: HTTP 201 con números nacionales y `+52` de distintas regiones, teléfono canónico, hash persistido y respuesta saneada; ejecución EV-07 | Aprobado backend |
| AC-03 | T-02, T-04, T-05 | EV-03: faltantes y teléfono inválido 400; correo duplicado 409 | Pendiente |
| AC-04 | T-03, T-05 | EV-04: login válido/ inválido con respuesta correcta; ejecución EV-07 | Aprobado backend |
| AC-05 | T-03, T-04, T-05 | EV-05: ruta protegida, token y navegación móvil | Pendiente |
| AC-06 | T-01, T-04, T-05 | EV-06: compilación e integración entre capas | Pendiente |

## Convergencia

### EV-07 — Corrección backend para fase 1

Entorno: Windows, Node 24.13, PostgreSQL 16.15. Comandos en `Backend/`: `npm run build`, `node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm test -- --runInBand`, `npm run test:infra` con `PG_TOOLS_CONTAINER=backend-postgres-1`: salida 0. [0010 EV-01/04](../0010-infraestructura-y-base-de-datos/verification.md) y su resumen adjunto acreditan el respaldo/restore previo y las pruebas reales de auth. Unitarias: 9 pruebas, incluidas DI, JWT UUID/email, bcrypt y conflicto concurrente P2002→409.

HTTP: dominio externo, teléfono ajeno, faltantes y campo extra →400 con lista de validación y sin usuario; registro con lada 664 nacional y 55 con +52 →201, persistencia canónica, hash bcrypt comprobado y respuesta solo access_token. Email duplicado en mayúsculas →409. Login correcto con email normalizado →200; contraseña incorrecta/correo ausente →401 indistinguibles. T-01/T-02 completas; parte login de T-03 comprobada. AC-01/03 conservan la parte móvil por verificar; AC-05/06 requieren guards e integración móvil. No se cierra el feature ni 2.1/2.2/4.3/5.1.

Especificación y plan alineados con la corrección backend; se conservan como pendientes los criterios integrados que exigen cliente móvil y autorización. No marcar `TASKS.md` 2.1, 2.2, 4.3 ni 5.1 como completas hasta verificar esos criterios.
