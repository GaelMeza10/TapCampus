# 0017 — Verificación

Estado: Verificado (prototipo) | Fecha: 2026-11-05

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-02/T-03 | EV-01 inspección y SVG | PASS |
| AC-02 | T-01/T-02/T-03 | EV-02 barras y enlaces | PASS |
| AC-03 | T-03 | EV-03 capturas y check-sdd | PASS |

- EV-01: 17 barras, 51 iconos oficiales Ionicons editables: brújula, comprobante, bolsa. Las otras dos páginas no contienen barras. Fuente de etiquetas Inter conservada. Inventario en [evidence/figma-state.json](evidence/figma-state.json).
- EV-02: 51 símbolos circulares retirados; cada icono mide 24×24 y usa VariableID:2:4 (activo) o VariableID:2:8 (inactivo). 35 áreas táctiles de 130×76, incluidos diez controles completados en estados de ventas; destinos inspeccionados sin errores ni saltos entre páginas. Etiquetas y reacciones originales conservadas.
- EV-03: capturas de 3:42, 4:62 y 5:68 revisadas a 390×844: etiquetas legibles, iconos diferenciados, sin recortes. Auditoría de barras: 86 FRAME, 153 VECTOR, 51 TEXT; cero imágenes y cero círculos anteriores. `node scripts/check-sdd.mjs` y `git diff --check`: PASS al cierre documental.

Validación visual/estructural de Figma; no equivale a UAT ni cambia la implementación Expo.
