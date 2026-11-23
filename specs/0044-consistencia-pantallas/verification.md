# 0044 — Verificación y convergencia

Estado: Técnico y composición auxiliar aprobados; hardware pendiente | Fecha: 2026-11-22

## Entorno y comandos

Windows, Node 24.13.0, Expo SDK 58, React Native 0.88.1. Datos aislados de scripts/visual-fixture.tsx; sin modificar API/BD del usuario. Chrome headless fuera del sandbox por timeout de DevTools dentro de él. Tema claro; capturas web auxiliares, sin simulación declarada como hardware.

Desde Frontend:

```powershell
node node_modules/typescript/bin/tsc --noEmit
npm.cmd test -- --silent --json --outputFile=.local/consistency-tests.json
node scripts/verify-redesign-ui.cjs --consistency-only
node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/export-0044 --max-workers 2
```

Desde raíz: `node scripts/check-sdd.mjs`. Evidencia resumida y capturas seleccionadas en evidence/; el verificador regenera las 61 capturas completas en Frontend/.local/visual/.

## Matriz

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-04 | EV-01: publication-form.test.tsx, navigation.test.tsx y recorrido Vender LIVE/STATIC | PASS técnico/auxiliar |
| AC-02 | T-02, T-04, T-05 | EV-02: marketplace-insets.test.tsx, navigation.test.tsx y doce cambios de tabs/retornos en verificador | PASS técnico/auxiliar; nativo pendiente |
| AC-03 | T-03, T-04 | EV-03: 61 capturas y revisión-impeccable.md; reservas urgentes y estados recuperables | PASS auxiliar |
| AC-04 | T-02, T-04, T-05 | EV-04: tab-bar-material.test.tsx (seis casos), bloqueo/restauración y barra única | PASS técnico/fallback auxiliar; glass nativo pendiente |
| AC-05 | T-04 | EV-05: tipos, 158 pruebas/21 suites, exports Android/iOS y check-sdd | PASS técnico |

## EV-01 — Publicación directa

Dos pruebas parametrizadas abren LIVE/STATIC con título/campos correctos y sin tablist; regresión de envíos, borradores, fotos, condición y ofertas conservada. La edición toma type del servidor y no representa selector. Recorrido auxiliar pulsa Vender → cada opción → captura → Atrás; no hay selector visible y el retorno conserva geometría del grupo. Enlace sin type mantiene la elección inicial.

## EV-02 — Contenido y navegación

Viewport único aplica padding explícito top/left/right. Contexto transmite los insets originales a una sola barra fuera de las pantallas; scrolls de páginas fijan never/false/false para ajustes automáticos de contenido/indicadores. Prueba con top 47 y bottom 34, alternando insets locales 0/47, conserva una sola aplicación. Bloqueo del navegador durante operaciones se restaura al terminar.

Fixture web con margen superior de 47: doce cambios entre las cuatro tabs y dos retornos conservan top 47 y una barra. En 390×844, barra y contenido permanecen dentro del viewport. Se comprueba alcanzar las acciones finales de ventas/reservas/cuenta en los cuatro tamaños sin superposición de tabs. Esto acredita composición auxiliar; no demuestra UIKit, teclado ni gestos físicos.

## EV-03 — Revisión Impeccable

Contexto de Impeccable cargado una vez; lectura de DESIGN.md, briefs existentes, polish, operate y craft-floor. Consulta ui-ux-pro-max limitada a patrones de React Native; no se toman paleta/tipografías de la skill. Fotografías existentes de fixtures/API local, sin nuevos assets creativos. Revisión de Explorar, ventas de ambos tipos, reservas, cuenta, acceso, registro, detalles y formularios en 320×844, 390×844, 430×932 y 844×390. Estados vacío/carga/error, historial, urgencia y texto largo ampliado 1.5; filtro incluido. Sin desbordamiento horizontal, excepciones JavaScript ni recursos ausentes. Ver revisión-impeccable.md y evidence/visual-summary.json.

## EV-04 — Material acotado

GlassView solo se monta desde TabBarMaterial, dentro de BottomNavigation. Seis pruebas comprueban iOS disponible, transparencia reducida, API no disponible, Android, web y cambio de preferencia en ejecución. Alternativa sólida mantiene hijos y selección; iOS usa regular/dark con tinte verde profundo alpha 0.88, sin transparencia aplicada a las demás superficies. El fallback se revisó visualmente; efecto de refracción/contraste nativo queda en T-05.

## EV-05 — Regresión y límites

TypeScript sin errores; Jest JSON success=true, 158/158 pruebas y 21/21 suites; exports Android/iOS con Hermes y metadata correctos. check-sdd comprueba estructura/referencias sin errores. La revisión de código no altera servicios, backend, DB ni semántica de reserva/stock/contacto. `adb devices -l` no mostró dispositivos; no se dispone de iOS Simulator en Windows. T-05 permanece pendiente: alternar tabs/volver del formulario, teclado, Dynamic Type, VoiceOver y material glass con/sin transparencia reducida en iPhone. No se cierra la aceptación integrada 0040.

## Convergencia

Especificación, decisiones, plan y código convergen en la excepción exclusiva de tabs y el flujo sin elección repetida. Se actualizan DESIGN.md, docs04/05/09/10, TASKS e índice. T-01..04 completas con evidencia; T-05 y las porciones nativas de AC-02/04 permanecen abiertas. La discrepancia visual de la metadata lateral de Impeccable se informa; no se regenera como efecto secundario.
