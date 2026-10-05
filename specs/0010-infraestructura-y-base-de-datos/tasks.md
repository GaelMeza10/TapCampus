# 0010 — Tareas de la fase 1

Estado: **Verificado** | Plan: `plan.md` | Evidencia: `verification.md` EV-01..05, 2026-10-04

- [x] **T-01** `[AC-02, AC-04, AC-05]` Inspeccionar sin escritura el historial de migraciones, esquema y datos PostgreSQL; documentar tipo de entorno, recuentos, referencias y posibles reservas históricas en `verification.md`. Archivos previstos: `verification.md`, `decisions.md` si aparece un caso sin conversión demostrable.
- [x] **T-02** `[AC-04]` Preparar respaldo y ensayo de restauración en base aislada; registrar comandos y comparación antes/después. Archivos previstos: `verification.md` y, si se necesita, script de migración en `Backend/prisma/migrations/`.
- [x] **T-03** `[AC-01]` Completar la corrección de autenticación y compilación bajo 0002; después implementar y probar el filtro global y configuración CORS. Archivos previstos: `Backend/src/main.ts`, `Backend/src/common/`, pruebas pertinentes y `specs/0002-autenticacion/verification.md`.
- [x] **T-04** `[AC-02, AC-03, AC-04]` Ajustar `schema.prisma` y crear migración aditiva para stock, precio e idempotencia; tratar la migración destructiva según inventario y preservar relaciones. Archivos previstos: `Backend/prisma/schema.prisma`, `Backend/prisma/migrations/`, `decisions.md` si hace falta resolver datos históricos.
- [x] **T-05** `[AC-02, AC-03, AC-04]` Aplicar y verificar en PostgreSQL aislado tanto ruta vacía como copia poblada, incluidos rechazo de stock negativo, unicidad por comprador/clave, múltiples reservas por comprador/publicación y recuperación. Archivos previstos: prueba de integración o script reproducible y `verification.md`.
- [x] **T-06** `[AC-05]` Reconciliar cinco zonas y ocho categorías, corregir la ejecución/tipos del seed y remapear datos referenciados antes de retirar nombres anteriores. Archivos previstos: `Backend/prisma/seed.ts`, `Backend/prisma.config.ts` o `Backend/package.json` según la ruta elegida, migración de datos si aplica.
- [x] **T-07** `[AC-01, AC-02, AC-05]` Ejecutar build, arranque, validación Prisma, estado de migraciones y seed dos veces; registrar entorno, resultados y fallos en `verification.md`.
- [x] **T-08** `[AC-01, AC-02, AC-03, AC-04, AC-05]` Revisar convergencia `AC → T → EV`, actualizar auditoría, trazabilidad y expedientes afectados; marcar 1.1–1.4 en `TASKS.md` únicamente si sus verificaciones están aprobadas y ejecutar `node scripts/check-sdd.mjs`.

Una casilla `[x]` exige evidencia reproducible; completar código o crear una migración no basta.
