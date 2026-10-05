# 0002 — Verificación

Estado: **Backend fase 2 verificado; aceptación móvil integrada pendiente** | Fecha: 2026-10-05

La revisión histórica del 2026-10-01 encontró fallos de compilación por `prisma.usuario`/seed. La corrección del 2026-10-04 compila y dispone de evidencia HTTP backend; la integración móvil sigue sin probarse con el contrato inglés.

| AC | Tarea(s) | Evidencia requerida | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02, T-04, T-05, T-06 | EV-01 plan móvil; EV-08 HTTP 400 sin fila | Aprobado backend; error móvil pendiente |
| AC-02 | T-01, T-02, T-05, T-06 | EV-02/07 históricos; EV-08 registro/hash/teléfono canónico | Aprobado backend |
| AC-03 | T-02, T-04, T-05, T-06 | EV-03 plan móvil; EV-08 faltantes/teléfonos 400 y duplicados 409 | Aprobado backend; formulario pendiente |
| AC-04 | T-03, T-05, T-06 | EV-04/07 históricos; EV-08 login HTTP | Aprobado backend |
| AC-05 | T-03, T-04, T-05, T-06 | EV-05 plan móvil; EV-08 JWT, guard y CurrentUser | Aprobado backend; sesión/navegación móvil pendiente |
| AC-06 | T-01, T-04, T-05, T-06 | EV-06 plan integrado; EV-08 build y contrato backend | Aprobado backend; cliente móvil pendiente |

## Convergencia

### EV-07 — Corrección backend para fase 1

Entorno: Windows, Node 24.13, PostgreSQL 16.15. Comandos en `Backend/`: `npm run build`, `node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm test -- --runInBand`, `npm run test:infra` con `PG_TOOLS_CONTAINER=backend-postgres-1`: salida 0. [0010 EV-01/04](../0010-infraestructura-y-base-de-datos/verification.md) y su resumen adjunto acreditan el respaldo/restore previo y las pruebas reales de auth. Unitarias: 9 pruebas, incluidas DI, JWT UUID/email, bcrypt y conflicto concurrente P2002→409.

HTTP: dominio externo, teléfono ajeno, faltantes y campo extra →400 con lista de validación y sin usuario; registro con lada 664 nacional y 55 con +52 →201, persistencia canónica, hash bcrypt comprobado y respuesta solo access_token. Email duplicado en mayúsculas →409. Login correcto con email normalizado →200; contraseña incorrecta/correo ausente →401 indistinguibles. T-01/T-02 completas; parte login de T-03 comprobada. AC-01/03 conservan la parte móvil por verificar; AC-05/06 requieren guards e integración móvil. No se cierra el feature ni 2.1/2.2/4.3/5.1.

En esa revisión histórica no se cerraron 2.1/2.2/4.3/5.1. La revisión de fase 2 siguiente acepta por separado el alcance backend autorizado y conserva móvil pendiente.

### EV-08 — Aceptación backend de fase 2

2026-10-05: Windows/PowerShell, Node 24.13.0, PostgreSQL 16.15. Desde `Backend/`: `npm run build`, `node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm test -- --runInBand` (5 suites/9 pruebas), `npm run test:e2e -- --runInBand` (1 suite/1 prueba), `npm run lint`, `npm run test:phase2`: salida 0. Prisma migrate status/diff: cuatro migraciones vigentes, sin diferencias. El [script HTTP](../../Backend/scripts/verify-phase2.mjs) crea BD propia, aplica migraciones y seed existentes, arranca `dist/main.js` y usa JWT de fixture. [Resumen de ejecución y conservación](../0003-publicaciones-en-vivo/evidence/phase2.json): diez grupos aprobados, inventario original antes/después idéntico. Credenciales y tokens no se guardan en evidencia.

AC-01/03: dominio externo/sufijos falsos, campos faltantes/extra, contraseña corta, teléfono extranjero/ambiguo/null →400; cero filas tras inválidos. AC-02: registros nacionales 664 y +52 55 →201, phone canónico, bcrypt comparado con password y respuesta únicamente access_token. Duplicado con mayúsculas →409; dos registros simultáneos mismo correo →201/409. AC-04: login correcto →200, contraseña errónea y correo inexistente →401 indistinguibles. AC-05: sin Bearer, token basura, firma ajena, expirado, sub inválido/usuario inexistente y algoritmo distinto →401 en publications/uploads. Token válido permite crear y seller_id corresponde a CurrentUser, sin campos secretos. AC-06: DTO/User/UUID ingleses y backend compilan.

T-03/T-06 y 2.1/2.2 completas con evidencia backend. T-04/T-05, 4.3/5.1 y aceptación móvil de AC-01/03/05/06 permanecen pendientes; expediente **En implementación**, no Verificado completo.
