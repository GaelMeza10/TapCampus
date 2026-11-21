# Verificación

Estado: PASS técnico y composición auxiliar; revisión independiente ship auxiliar, aceptación nativa pendiente. Entorno: Windows, Expo SDK 58, 2026-11-10.

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-03 | EV-01/02 | PASS técnico y auxiliar |
| AC-02 | T-02/T-03 | EV-01/02 | PASS técnico y auxiliar |
| AC-03 | T-02/T-03 | EV-01/02 | PASS técnico y auxiliar; WhatsApp físico separado |
| AC-04 | T-03/T-04 | EV-02/03 | PASS tipos/exportaciones/composición y revisión auxiliar; nativo pendiente |

## EV-01 — Regresión y tipos

Desde Frontend: `npm.cmd test -- --silent`: PASS, 15 suites/100 pruebas. `npx.cmd tsc --noEmit`: PASS, repetido tras cambios del fixture. Siete pruebas en reservations.test.tsx: cancelar exactamente una unidad, cuatro estados y actualización al vencer, alternativa de foto con precio/acciones conservados, agrupación por vencimiento e historial sin renumerar unidades ni mutar datos, contacto autorizado y ausencia de acciones tras plazo/estado terminal, recuperación de error/vacío con navegación, carga accesible sin datos ficticios. Los tests existentes de detalle y vendedor pasan sin modificar su componente.

## EV-02 — Composición auxiliar

Desde Frontend: `node scripts/verify-redesign-ui.cjs --reservations-only`: PASS, 22 capturas finales en `.local/visual/`; listado y textos en `reservations-result.json`, cero excepciones, recursos faltantes o controles fuera de ancho. Chrome necesitó ejecución fuera del sandbox tras fallo de DevTools; se reconstruyó el bundle en cada ejecución con el origen de su propio servidor.

Normal, título largo e historial a 320×844, 375×812, 430×932 y 844×390. También carga, vacío, error y Reintentar, ACTIVE con plazo terminado pendiente del servidor, foto ausente, confirmación/resultado de cancelación y ampliación de texto. Inspección de los originales y tablero auxiliar en la primera ronda; después se corrigió un nombre de producto del fixture para coincidir con su foto (Esquites) y se mejoró la simulación de fontScale. Segunda ronda completa: 22 originales finales. Los tableros de la primera ronda no son evidencia final.

El caso ampliado modifica Dimensions.get del fixture para simular fontScale 1.5 y amplía CSS al 150 %; comprueba la rama apilada y lectura flexible, no equivale a Dynamic Type físico. Movimiento reducido solicitado en Chrome; esqueleto sin animación y sin motion nuevo. Los estados de historial se distinguen por icono/texto, no solo color. Contraste de los tokens compartidos preservado, sin tema oscuro nuevo.

Fixtures sintéticos con fotografías locales existentes; no se modificó API, BD ni reservas del usuario. La prueba de cancelación visual actúa solo sobre el adaptador del fixture y verifica que la segunda unidad sigue activa. No se abrió WhatsApp real.

## EV-03 — Bundles y convergencia

Desde Frontend: `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/exports-reservations --max-workers 2`: PASS, bundles de ambas plataformas. Desde raíz: `node scripts/check-sdd.mjs` y `git diff --check`: PASS. Sin dependencias ni assets raster de producción nuevos. Guía UI, tareas, índice y trazabilidad se sincronizan con este expediente.

Revisión fresca `impeccable_finish_reviewer`: **ship** exclusivamente para la composición auxiliar de los 22 originales, sin defectos materiales observados; cinco secciones y alcance en [review.md](review.md). Mantiene gate nativo pendiente. No se ejecutó detector HTML/CSS sobre código React Native.

Cotejo fresco `impeccable_documenter` en [design-review.md](design-review.md): paleta, Inter, escala, radios y contornos concordantes, sin drift nuevo. Refinamiento local: se preservan DESIGN.md y .impeccable/design.json. No se regeneran sus vistas previas históricas ni se reparan diferencias anteriores como efecto lateral.

No hay simulador iOS en este Windows; `emulator.exe -list-avds` no devolvió AVD configurado. No se atribuyen a estas capturas gestos, foco/lectores nativos, fontScale físico, contraste del tema oscuro ni rendimiento en hardware. TASKS 5.3 y aceptación integrada siguen abiertos.
