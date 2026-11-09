# Verificación

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-02 | EV-01 | PASS |
| AC-02 | T-01/T-02 | EV-01/02 | PASS técnico y visual auxiliar |
| AC-03 | T-02/T-03 | EV-02 | PASS técnico; hardware separado |

## EV-01 — Pruebas

Ejecución completa final: 15 suites/96 pruebas PASS, incluidos los controles de reservas y navegación.

Windows, Expo SDK 58. `npm.cmd test` desde Frontend ejecuta las suites existentes de tarjetas, detalle, reservas, ventas y navegación, más publication-price.test.tsx. La comparación comprueba orden actual/anterior, tachado, ahorro $62→$49=$13, diferencia de centavos, productos normales y ausencia de comparación con precio previo ausente/null/vacío/no numérico/infinito/cero/negativo/igual/menor. Una expectativa antigua de tarjeta esperaba «Antes» bajo stock; actualizada al nuevo comportamiento. Reejecución focal: 2 suites/13 pruebas PASS.

## EV-02 — Visual y convergencia

`node node_modules/typescript/bin/tsc --noEmit`: PASS. `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/exports-gangas --max-workers 2`: bundles móviles generados localmente.

`node scripts/verify-redesign-ui.cjs` desde Frontend reconstruye el fixture aislado; Chrome requirió ejecución fuera del entorno restringido por falta de respuesta de DevTools. Se ajustó la expectativa histórica GANGA ACTIVA al nuevo ahorro. `node scripts/verify-redesign-ui.cjs --reuse-bundle`: PASS, 66 capturas sin desbordamiento horizontal, excepciones ni recursos ausentes. Incluye 12 capturas específicas de ganga: feed/detalle/ventas en 320×844, 375×812, 430×932 y horizontal 844×390, con reduced motion. Se comprueba orden DOM actual/anterior, tachado calculado y límites de ambos importes. Inspección directa de ganga-feed-375, ganga-detail-320 y ganga-sales-375: naranja, etiqueta, precio actual a la izquierda y anterior a la derecha, ahorro y reservas con precio previo fijado intacto. Archivos locales ignorados en Frontend/.local/visual; result.json enumera la ejecución.

Contraste calculado por luminancia relativa: ganga/gangaSoft 5.27:1, white/ganga 5.84:1 y textMedium/gangaSoft 5.82:1. Tokens de tema existentes, sin nueva animación ni controles. El icono decorativo no se anuncia; los precios tienen nombres actual/anterior. Lectores nativos y Dynamic Type del dispositivo no se acreditan mediante Chrome; tema oscuro no existe en el alcance actual. No se tocaron reservas, API, inventario ni Figma. Corrección final de puntuación/acentos en texto normal de detalle; sin cambio a geometría de ganga.

T-03: docs04/09/10, TASKS e índice sincronizados; check-sdd y diff --check ejecutados desde raíz. Evidencia auxiliar no cierra UAT ni fase 5.1–5.6.
