# 0018 — Verificación

Estado: Verificado (prototipo) | Fecha: 2026-11-05

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-02/T-03 | EV-01 selector explícito | PASS |
| AC-02 | T-02/T-03 | EV-02 estados/enlaces | PASS |
| AC-03 | T-03 | EV-03 capturas/check-sdd | PASS |

Antes: 5:68/6:56/6:86/6:116/6:146 usan botón Catálogo en x=245,y=49 de 125×44; 57:132/57:200 usan Disponibles ahora en x=220,y=49 de 150×44. LIVE navega a 57:132 y Catálogo a 5:68. Las áreas de contenido comienzan en y=138 (LIVE) o y=152 (Catálogo); la barra inferior empieza en y=768.

- EV-01: siete instancias del Selector de catálogo existente (38:10/38:16), con texto local Con horario/Catálogo y opciones de 171×44. Fuente Inter y variables de color originales. Selección visible con borde/color verde. El selector de Explorar conserva su texto. Botones superiores anteriores retirados. [IDs y auditoría](evidence/figma-state.json).
- EV-02: las siete variantes conservan los destinos 57:132/5:68 y los diálogos de entrega/ganga/finalización. Auditoría de toda la página 3:2: cero destinos ausentes o fuera de página. Viewports VERTICAL y clipsContent con y=176, altura=576, terminan en 752 antes de la barra 768; sin cambio en inventario ni reservas. Ambas entregas permanecen alcanzables.
- EV-03: capturas revisadas de venta activa, ganga, finalizada y Catálogo activo/vendido. La primera composición dejó cortada parte de la segunda entrega con ganga; se compactó el encabezado (selector y=88, contexto y=140) y se verificaron capturas posteriores de activa/ganga/Catálogo. Ambas entregas se ven completas en la captura final de ganga; el contenido conserva desplazamiento. Capas editables, solo Inter, sin imágenes aplanadas de pantallas. `node scripts/check-sdd.mjs` y `git diff --check`: PASS al cierre.

Este cambio es visual y de navegación en Figma. Expo y UAT no se verifican con estas capturas.
