# 0034 — Verificación y convergencia

Estado: En verificación; implementación técnica aprobada, aceptación nativa pendiente | Fecha: 2026-11-21

## Entorno y evidencia actual

Windows/Node v24.13.0, Expo SDK 58. El diagnóstico del 2026-11-10 describía error al final y validación parcial; esta ejecución reemplaza ese comportamiento sin alterar el diseño global ni los contratos 0037. Helper de validación por tipo/dependencia, estados de foto/catálogos/carga/envío separados y alerta única fuera del scroll; controles e inputs tienen error/hint local.

- Frontend `npm.cmd test -- --watch=false`: 16 suites/124 pruebas PASS. Incluye envío único, fallo de upload, foto subida reutilizada, error general que persiste al escribir, recuperación de zona sin recargar categorías/publicación, corrección independiente de textos bloqueados y regresión de ofertas.
- `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- `node scripts/verify-redesign-ui.cjs --form-errors-only` y reejecución `--reuse-bundle`: 19 capturas auxiliares, cero excepciones/recursos ausentes, cuatro tamaños y texto ampliado. Chrome sin ventana con ejecución autorizada; ninguna conexión a API real del usuario. [visual.json](evidence/visual.json), [review.md](evidence/review.md).
- `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/export-0038 --max-workers 2`: ambos bundles PASS después de la corrección final del aviso; no es un APK ni aceptación nativa.
- Desde raíz: `node scripts/check-sdd.mjs` y `git diff --check`: PASS documental/whitespace.
- [Resumen compartido](../0038-filtro-palabras-publicaciones/evidence/summary.json): recuentos de suites/integraciones y huella de exportación final.

## Matriz de evidencia

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02/T-05 | EV-02/EV-05: alerta fuera del scroll con altura suficiente, visible tras desplazamiento real; capturas y Jest | Aprobado técnico/auxiliar |
| AC-02 | T-01/T-02/T-05 | EV-01/EV-02/EV-05: todos los campos, tipos, rangos y dependencias; errores en texto/controles y alerta única | Aprobado técnico |
| AC-03 | T-01/T-02/T-05 | EV-01/EV-02/EV-05: orden visual categoría antes de precio, foco tras layout, corrección dependiente y borrador; sin abrir hojas al navegar | Aprobado Jest/navegador; foco nativo pendiente |
| AC-04 | T-03/T-05 | EV-03/EV-05: permisos/upload/catálogos/envío/oferta en contexto, URL subida reutilizada y reintento específico sin duplicado | Aprobado técnico |
| AC-05 | T-04/T-05 | EV-04/EV-05: 124 pruebas, tipos/exports y capturas con texto ampliado; no múltiples alertas por campo | Parcial: teclado/lector/foco nativos pendientes |

## Convergencia

T-01..03 completas técnicamente. T-04 y T-05 conservan el recorrido nativo y cierre con esa evidencia; TASKS 5.4 permanece abierta. Los nuevos mensajes se anuncian mediante un único resumen; CustomInput mantiene comportamiento predeterminado en otros formularios y permite omitir anuncios individuales aquí. Ajuste de cabecera/orden documentado en decisiones y sistema de diseño. No se declara hardware, tema oscuro o piloto verificados por capturas web.
