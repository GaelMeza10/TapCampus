# 0036 — Verificación y convergencia

Estado: PASS técnico y composición auxiliar; revisión independiente ship auxiliar, hardware separado | Fecha: 2026-11-10

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-02/T-03 | EV-01: capturas y revisión independiente | PASS auxiliar |
| AC-02 | T-01/T-02 | EV-02: regresión del formulario | PASS |
| AC-03 | T-01/T-02/T-03 | EV-01/EV-03: tamaños, tipos y exports | PASS técnico/auxiliar; hardware separado |

Aceptación de cámara/teclado/lector/texto ampliado en hardware nativo separada de la revisión auxiliar web.

## EV-01 — Composición auxiliar

Desde Frontend: `node scripts/verify-redesign-ui.cjs --publication-design-only`: PASS, 38 PNG enumerados en `.local/visual/publication-design-result.json`. Cero excepciones y recursos ausentes; controles dentro del ancho. Tamaños 320×844, 375×812, 390×844, 430×932 y 844×390; formulario LIVE/STATIC, foto existente/edición, entrega, oferta programada, error de título y stock con foco visible y borrador intacto. También zona y texto ampliado mediante fontScale simulado 1.5 más CSS al 150 %. Movimiento reducido. Imágenes reales de fixture local, sin API/BD del usuario.

El primer intento de Chrome dentro del sandbox falló por DevTools; ejecución autorizada fuera del sandbox completó la revisión. Durante preparación se corrigieron comprobaciones del script (nombre accesible de oferta y conversión a booleano de consulta DOM). El reviewer pidió recaptura porque reutilizar el bundle con un puerto nuevo dejaba las fotos apuntando al servidor anterior. Se corrigió el verificador para reutilizar el origen compilado y esperar `img.complete && naturalWidth > 0`; `node scripts/verify-redesign-ui.cjs --publication-design-only --reuse-bundle` volvió a completar las 38 capturas con fotos reales visibles. Esa matriz final sustituye la evidencia fotográfica inválida. Capturas web son auxiliares, no simulador nativo.

## EV-02 — Regresión

Desde Frontend: `npm.cmd test`: PASS, 15 suites/105 pruebas. Incluye formulario: cámara denegada, stock negativo, STATIC sin campos LIVE conservando borrador ante error y oferta provisional/programada. Después del ajuste de etiqueta accesible: `npm.cmd test -- --silent --runTestsByPath __tests__/publication-form.test.tsx`: PASS, cuatro pruebas. Servicios, payloads, seguridad y navegación se conservan. El cálculo de scroll del stock incluye su desplazamiento cuando precio/stock se apilan; las capturas comprueban foco y límites visibles a los cinco tamaños.

## EV-03 — Tipos, exportaciones y convergencia

Desde Frontend: `npx.cmd tsc --noEmit`: PASS. `npx.cmd expo export --platform android --platform ios --output-dir .local/publication-design-export --max-workers 2`: PASS ambos bundles Hermes. Desde raíz: `node scripts/check-sdd.mjs`: PASS. `git diff --check`: PASS con advertencias de normalización CRLF de archivos preexistentes.

Sin nuevas dependencias ni imágenes de producción. No se ejecuta detector HTML/CSS sobre React Native. Windows sin adb/emulator configurados: cámara física, teclado, gestos, lector y Dynamic Type reales pendientes; tampoco se añade tema oscuro al sistema claro vigente. El expediente 0034 permanece planificado y las casillas globales de aceptación física no cambian.

Revisión independiente fresca: **ship**, limitada a composición web auxiliar y lectura estática, tras abrir la matriz final de 38 PNG y referencia previa. El primer veredicto recapture se resolvió con corrección del servidor del fixture y carga efectiva de imágenes; ningún cambio de producción fue necesario. Informe en [review.md](review.md). Cotejo independiente del sistema vigente en [design-review.md](design-review.md): DESIGN.md y sidecar se conservan; drift preexistente se reporta sin reparación lateral.
