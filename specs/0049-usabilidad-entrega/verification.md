# 0049 — Verificación y convergencia

Estado: Verificación técnica aprobada; aceptación en dispositivo pendiente | Fecha: 2026-11-22

## Entorno y comandos

- Backend: `npm run lint`, `tsc -p tsconfig.build.json`, `npm test`.
- Frontend: `node node_modules/typescript/bin/tsc --noEmit`, `npm test` (incluye `check:design`).

## Matriz de trazabilidad

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 | EV-01: `reservations.service.spec.ts` «Apartado de la propia publicación»; `reservation-screen.test.tsx` «el vendedor no puede apartar…» | Aprobado |
| AC-02 | T-02 | EV-02: `common/validation-messages.spec.ts`; `adverse-errors.test.tsx` 413; `account.test.tsx` «rechazo del servidor…»; `reservation-screen.test.tsx` 409 | Aprobado |
| AC-03 | T-03 | EV-03: `feed.test.tsx` «vacío sin filtros…»; `timers.test.tsx` | Aprobado |
| AC-04 | T-04 | EV-04: `publication-form.test.tsx` normalización de precio; `auth-screens.test.tsx` registro incompleto y login lento | Aprobado |
| AC-01..04 | T-05 | EV-05: recorrido en teléfono | Pendiente |

EV-06: backend 15 suites / 138 pruebas; frontend 28 suites / 243 pruebas; lint y tipos sin errores.

## Convergencia

- Especificación ↔ plan ↔ código: coinciden.
- Desvíos: el 403 de publicación propia es nuevo en el contrato de `POST /reservations`.
- Fecha y conclusión: 2026-11-22. Técnicamente verificado; falta T-05.
