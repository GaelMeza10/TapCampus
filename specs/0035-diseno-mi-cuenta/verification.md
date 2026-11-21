# Verificación

Estado: PASS técnico/composición auxiliar; revisión independiente ship auxiliar, aceptación física separada. Windows, Expo SDK 58, 2026-11-10.

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-03 | EV-01/02 | PASS técnico/auxiliar |
| AC-02 | T-02/T-03 | EV-01/02 | PASS regresión/editor |
| AC-03 | T-01/T-02/T-03 | EV-01/02 | PASS técnico/auxiliar; físico separado |
| AC-04 | T-03/T-04 | EV-01/02/03 | PASS tipos/exports/revisión auxiliar; físico separado |

## EV-01 — Tipos y regresión

Desde Frontend: `npx.cmd tsc --noEmit`: PASS, repetido tras añadir pruebas. `npm.cmd test -- --silent`: primer pase de 15 suites/103 pruebas PASS. Tras añadir dos casos de iniciales y esqueleto, `npm.cmd test -- --silent --runTestsByPath __tests__/account.test.tsx`: PASS, 16 pruebas. El test existente de cierre pendiente ahora entra al editor y comprueba también campos y Guardar cambios bloqueados durante logout. Incluye validación, cancelar, guardado/error/reintento, envío parcial, sesión y navegación de 0033 sin modificar contratos.

Pase completo final después de añadir los casos nuevos: `npm.cmd test -- --silent`: PASS, 15 suites/105 pruebas.

## EV-02 — Composición auxiliar

Desde Frontend: `node scripts/verify-redesign-ui.cjs --account-design-only`: PASS, 29 PNG finales en `.local/visual/`, enumerados por `account-design-result.json`. Cero excepciones, recursos faltantes o controles fuera de ancho. Vista de perfil, nombre/correo largos, editor, acciones desplazadas y éxito a 320×844, 375×812, 430×932 y 844×390. También fallo/reintento/guardado pendiente, carga/error/reintento del perfil, validación de campos y texto ampliado. Inspección directa de originales de perfil/editor/estrecho/nombre largo/texto ampliado/error; revisión independiente examina el conjunto completo.

El caso ampliado usa fontScale 1.5 simulado en Dimensions.get del fixture y CSS aumentado al 150 %, no Dynamic Type físico. Identidad se apila y datos envuelven; acciones siguen accesibles por scroll. Chrome con movimiento reducido; esqueleto estático y sin motion nuevo. Iniciales ocultas del lector para no duplicar nombre; iconos decorativos y botones con etiqueta/estado/mínimo48.

Fixture sintético aislado sin API/BD del usuario; conserva manifest de 0033 y usa nombres account-design-* distintos. Chrome necesitó ejecución fuera del sandbox por la limitación de DevTools comprobada en esta sesión. No hay nuevos raster ni dependencias de producción.

## EV-03 — Bundles y convergencia

Desde Frontend: `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/exports-account-design --max-workers 2`: PASS ambos bundles. Mismo sistema de tokens/Inter/controles; docs04/09/10, TASKS, índice y brief se sincronizan con este expediente. No se reescribe evidencia histórica de 0033 ni se modifica su API.

Teclado abierto, foco/lectores nativos, escala física y gestos siguen pendientes; Windows sin simulador iOS/AVD configurado. Las capturas web y bundles no acreditan esos puntos. No se ejecuta detector HTML/CSS sobre RN.

Reviewer fresco: **ship**, exclusivamente composición web auxiliar tras inspeccionar los 29 originales finales y dos previos de 0033; sin hallazgos materiales. Cinco secciones y límites en [review.md](review.md). `node scripts/check-sdd.mjs` y `git diff --check`: PASS. Documenter fresco cotejó código/tokens/controles/manifiesto y registró [design-review.md](design-review.md); conservó DESIGN.md/sidecar/previews sin reparar diferencias anteriores como efecto lateral. Cierre técnico/auxiliar, sin atribuir aceptación física.
