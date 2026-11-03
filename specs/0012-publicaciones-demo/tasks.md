# 0012 — Tareas

Estado: Verificado (ampliación) | Plan: `plan.md`

- [x] **T-01** `[AC-01, AC-03]` Extender el seed con vendedor existente, publicaciones válidas y PNG servidos por el backend.
- [x] **T-02** `[AC-02, AC-03]` Verificar modo normal, repetición y rechazo de parámetros inválidos sin mutar publicaciones existentes.
- [x] **T-03** `[AC-01, AC-02, AC-03]` Ejecutar en la base local, comprobar feed/imágenes, registrar EV y ejecutar `node scripts/check-sdd.mjs`.

Las tareas T-01..03 y EV-01..03 documentan el alcance original de ocho publicaciones.

- [x] **T-04** `[AC-01, AC-04]` Añadir dieciséis registros plausibles, dos por categoría, con gangas de prueba y sin modificar los ocho originales. EV-04/07 local.
- [x] **T-05** `[AC-03, AC-04]` Empaquetar dieciséis fotografías ilustrativas y copiar al directorio de uploads sin sobrescribir archivos existentes. EV-06 local.
- [x] **T-06** `[AC-01, AC-02, AC-03, AC-04]` Verificar tipos, seed repetido, feed e imágenes sobre PostgreSQL/API reales; registrar EV-04..07, convergencia y actualizar `TASKS.md`.
