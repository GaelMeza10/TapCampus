# Revisión de consistencia — 2026-11-22

Resultado: corregidas las diferencias encontradas en las fuentes y la composición auxiliar revisada. **207 pruebas aprobadas en 25 suites; 157 capturas auxiliares; cero excepciones JavaScript y recursos ausentes en esas pasadas.** No se declara aceptación en teléfono.

Autoridad: `DESIGN.md`, por encima de los skills. Se aplicaron los criterios de Impeccable para una interfaz de operación y su revisión nativa de fuente, junto con expo-design-system para compartir tokens y componentes. No se creó una especificación ni un plan nuevos. [Resumen, versiones y huellas de los archivos comprobados](consistency-evidence/summary.json).

## Qué falló en la revisión anterior

Se habían comprobado composición y rutas aisladas, pero quedaban etiquetas locales en otras superficies, pruebas que aceptaban nombres antiguos y documentación auxiliar de otra versión. Encontrar el formulario correcto con un parámetro fijo no demostraba el recorrido completo desde Vender ni la continuidad al editar y volver.

Además, el verificador visual esperaba textos que podían existir en el documento anterior o en pantallas montadas pero inactivas. Las capturas podían adelantarse a la navegación. La nueva ejecución espera un documento nuevo, contenido activo y carga de imágenes; verifica también que la pestaña seleccionada corresponda a la ruta. Los escenarios de texto ampliado se colocan al inicio tras aplicar la ampliación, evitando el anclaje de desplazamiento producido por esa modificación auxiliar del DOM.

## Hallazgos y correcciones

| Hallazgo | Corrección comprobada |
| --- | --- |
| Nombres distintos entre Explorar, Vender, Mis ventas y detalle | `PUBLICATION_COPY` comparte Ahora en el campus/Anuncios y las insignias correspondientes. ANUNCIO es la forma singular del detalle. El selector no acepta alias locales. |
| Insignias GANGA/Oferta para el mismo estado | Una insignia compartida GANGA. Precio de oferta conserva su significado como configuración; se documenta esa distinción. |
| Tarjeta anterior con presentación propia; precio, stock y cierre duplicados | `Publisher_Card` reutiliza `ExploreCard`. Precio, ahorro, stock y cierre comparten componentes con el detalle. Un stock ausente se muestra como desconocido, sin inventar cero; el cierre vencido tiene el mismo texto. |
| Tipo inicial conservado al cambiar los parámetros del formulario | El formulario toma el tipo recibido y normaliza parámetros repetidos. Vender entra al formulario sin volver a pedirlo; edición usa el dato del servidor. Pruebas con navegación real cubren ambos tipos y el retorno a Mis ventas. |
| Marcar vendido/Marcar vendida en una misma acción | Botón y confirmación comparten `soldAction`; la descripción se refiere explícitamente al artículo como vendido. La prueba confirma dentro del diálogo antes de invocar la operación. |
| Glifos usados como iconos | Regreso al producto y confirmación usan Ionicons. Se conservan los assets geométricos previstos por el diseño. |
| Selector compacto con una altura de línea diferente | `TYPE.controlCompact` fija Inter 13/19 en el selector y botones compactos. Se contrasta con el encabezado normativo de DESIGN.md. |
| Fuentes de plantilla en CSS e índice de Impeccable anterior | CSS usa los alias de Inter/Bricolage; se retiraron las alternativas de plantilla. El índice auxiliar conserva su esquema y refleja navegación verde, selectores, tarjeta y narrativa vigentes. DESIGN.md se conservó byte a byte durante esa sincronización. |
| Documentos activos con nombres y paleta anteriores | PRODUCT.md y las guías de UX/flujos remiten al diseño vigente; el historial queda identificado como histórico. |
| Fotos repetidas y detalle incorrecto en datos del verificador | Brownie y galletas reciben sus fotografías/categorías correspondientes. El adaptador devuelve la publicación solicitada; se recorre el destacado hasta su detalle. No se cambió la BD real. |

## Prevención incorporada

`npm run check:design` comprueba las **51 fuentes JS/TS/TSX/CSS** actuales. Lee el encabezado normativo de DESIGN.md y contrasta colores, espaciado, radios y tipografía con theme.js; valida el vocabulario compartido y detecta etiquetas anteriores o copiadas localmente. Revisa fuentes/colores locales, glifos de acción, alias del selector, glass fuera de tabs y SafeAreaView adicionales en pantallas de tabs. Si existe el índice local de Impeccable, comprueba también sus colores y previsualizaciones de selector/navegación.

La comprobación se ejecuta automáticamente antes de `npm test` y también dentro de Jest. Hay contraejemplos que demuestran que rechaza regresiones de nombres, tokens, fuentes CSS, colores, materiales, áreas seguras y el índice auxiliar. Las pruebas de navegación y presentación comparan los recorridos y la misma publicación entre superficies. Estas comprobaciones cubren reglas concretas; una superficie nueva sigue necesitando revisión visual y su incorporación a los recorridos.

## Evidencia ejecutada

| Área | Evidencia y alcance |
| --- | --- |
| Fuentes y terminología | Comprobador de DESIGN.md y 207 pruebas/25 suites PASS. Tipos frontend, check-sdd y diff --check PASS. |
| Navegación y adaptación | [62 capturas](consistency-evidence/consistency.json): entradas de pantalla, ambos tipos, creación, destacado/detalle, estados y texto ampliado; doce cambios de pestaña con barra única y geometría estable. |
| Filtros, detalle y cuenta | [34 capturas](consistency-evidence/surfaces.json), con selección, edición, carga/error y texto largo. |
| Estados adversos | [61 casos/capturas](consistency-evidence/adverse-result.json): errores HTTP/red simulados, datos inválidos/extremos, fallos parciales, recuperación y texto ampliado; 61 PASS/0 FAIL. |
| Impeccable auxiliar | [Sincronización y hash de DESIGN.md](consistency-evidence/sidecar-sync.json); colores y nombres del índice incluidos en el comprobador. |

Tamaños auxiliares: 320×844, 390×844, 430×932 y 844×390; los casos adversos incluyen también 430×844. El tamaño horizontal es una prueba de estrés de composición, no un cambio de la orientación portrait del producto. Texto ampliado hasta 1.5 en los escenarios indicados. Se revisaron manualmente entradas de pantalla y escenarios estrechos/ampliados seleccionados; se conservan 19 capturas seleccionadas junto a los informes automáticos.

Ejemplos: [Explorar](consistency-evidence/consistent-explore-320.png), [Mis ventas](consistency-evidence/consistent-sales-320.png), [Anuncios propios](consistency-evidence/consistent-sales-static-320.png), [Reservas](consistency-evidence/consistent-reservations-320.png), [detalle del destacado](consistency-evidence/consistent-featured-detail.png), [Filtros](consistency-evidence/surfaces-filters-320.png), [Mi cuenta](consistency-evidence/consistent-account-320.png), [formulario LIVE](consistency-evidence/consistent-form-live-320.png), [formulario STATIC](consistency-evidence/consistent-form-static-320.png), [errores ampliados](consistency-evidence/adverse-errors-large.png).

Reproducción desde Frontend:

```powershell
npm.cmd run check:design
npm.cmd test -- --silent
node node_modules/typescript/bin/tsc --noEmit
node scripts/verify-redesign-ui.cjs --consistency-only
node scripts/verify-redesign-ui.cjs --surfaces-only --reuse-bundle
node scripts/verify-redesign-ui.cjs --adverse-only --reuse-bundle
```

Los verificadores necesitan Chrome local y crean su propio servidor/perfil temporales. En esta sesión Chrome requirió ejecución autorizada fuera del aislamiento para responder a DevTools; se ejecutó sin ventana. El adaptador de QA está aislado y las fotos locales solo se leen. No se ejecutaron migraciones, seed ni escrituras en la base real; se conservaron los servidores del usuario.

## Límites de la conclusión

Se revisaron fuente, tokens, comportamiento bajo mocks y composición/interacciones web auxiliares. Esto no certifica VoiceOver/TalkBack, teclado/IME, permisos reales, gestos, representación del selector de horario, material glass ni apertura/retorno de WhatsApp en teléfono. Tampoco se midieron FPS, memoria o arranque en hardware. Las listas usan los componentes virtualizados existentes; no se atribuye una mejora de rendimiento medida a esta revisión.

La aceptación nativa de 0044/0040, el instalable, despliegue y UAT conservan sus puertas separadas. No se cierra una casilla global de aceptación con estas capturas ni se promete ausencia absoluta de futuras inconsistencias.
