# Verificación

Estado: PASS técnico y composición auxiliar; revisión física nativa separada. Entorno: Windows, Expo SDK 58, 2026-11-09.

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-04 | EV-01/02/03 | PASS técnico y composición auxiliar |
| AC-02 | T-02/T-03 | EV-01/02 | PASS código y composición auxiliar; fontScale físico separado |
| AC-03 | T-03/T-04 | EV-01/02/03 | PASS técnico; límites de hardware documentados |
| AC-04 | T-05 | EV-04 | PASS técnico; revisión visual en dispositivo pendiente |
| AC-05 | T-06 | EV-05 | PASS técnico; revisión visual en dispositivo pendiente |
| AC-06 | T-07 | EV-06 | PASS técnico y composición auxiliar; hardware separado |

## EV-01 — Sistema visual

Desde Frontend: `npx.cmd tsc --noEmit` y `npm.cmd test -- --silent`: PASS, 15 suites/96 pruebas. Se adaptaron expectativas antiguas de sombra a contorno y consultas por texto duplicado a botones de producto; el caso de recuperación de red verifica además que el destacado abre el mismo detalle real. Pruebas existentes cubren búsqueda/debounce/filtros, navegación protegida, confirmaciones e idempotencia, reservas, ventas, perfil, precios y alternativa de foto.

theme.js mantiene verde UABC, Inter, naranja Oferta y rojo destructivo. Card, CustomInput, MarketplaceShell, TypeSelector y PublicationPrice extienden el sistema a los módulos existentes. Ningún servicio, hook, API ni dato de usuario fue modificado. No se añadió dependencia.

## EV-02 — Composición

Desde Frontend: `node scripts/verify-redesign-ui.cjs` reconstruye el fixture aislado y genera 66 capturas en `.local/visual/`, con `result.json`: cero excepciones, recursos ausentes o desbordamientos horizontales. Chrome headless necesitó ejecución fuera del sandbox porque DevTools no respondía. Reutilizar un bundle construido para otro puerto produjo fotos fallidas en una exploración intermedia; se descartó esa evidencia y se reconstruyó en la misma ejecución/servidor. La ejecución final carga las fotografías correctamente.

Inspección directa y revisión independiente de ganga-feed-320/375/430/844, feed, search-results, filters, detail, reservations, sales, account, login y form-live. Incluye títulos largos, errores, vacío, confirmaciones, ofertas, búsqueda y movimiento reducido. Anchos 320/375/390/430 y horizontal 844; una columna en 320, dos en teléfonos habituales y tres en horizontal. Encabezado desplazable libera la zona de trabajo. Fórmula revisada para fontScale >1.2: una columna; no acreditada mediante Dynamic Type real.

El fixture usa contenido sintético y fotos de demostración existentes; algunas imágenes se repiten solo en ese fixture. La aplicación sigue consumiendo publicaciones/fotos reales de la API. El destacado usa el primer resultado con imagen y se oculta al buscar/filtrar/cargar/error; no cambia el orden del listado ni incorpora funciones de carrito/favoritos/calificaciones.

## EV-03 — Regresión y convergencia

Desde Frontend: `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/exports-marketplace --max-workers 2`: PASS, bundles locales de ambas plataformas. Desde raíz: `node scripts/check-sdd.mjs` y `git diff --check`: PASS.

Revisión independiente Impeccable: composición auxiliar sin defectos materiales; dos hallazgos resueltos (PRODUCT.md alineado con Oakory/0031 e icono Ionicons add para publicar). El verdict pass puntúa ambos resueltos y emite ship solo para esos ajustes y composición web auxiliar; el gate nativo mantiene recapture por falta de capturas nativas. No hay simulador iOS en este Windows ni AVD configurado. No se solicita aprobación de diseño adicional, porque la dirección y su aplicación fueron autorizadas explícitamente por el usuario.

Documenter independiente escribió DESIGN.md y .impeccable/design.json (schemaVersion 2, JSON válido, 11 vistas previas autocontenidas) cotejados con código. Contrato de dirección persistido en `.impeccable/surfaces/frontend-src-app-tabs-homepage-tsx.md`. Sin nuevos assets raster de producción ni detector web sobre React Native. docs04/09/10, PRODUCT.md, TASKS e índice sincronizados. No cambia la evidencia histórica de 0019/0020 ni se cierran 5.1–5.6.

La revisión web no acredita teclado, lector, gestos ni texto ampliado físicos.

## EV-04 — Etiqueta redundante en catálogo (2026-11-10)

Publisher_Card omite el nodo de estado para STATIC, sin reservar espacio; conserva título, precio, zona y Contacto directo. El selector y encabezado Catálogo no se modifican; LIVE y Oferta conservan sus estados. Inspección del JSX y, desde Frontend, `npx.cmd tsc --noEmit` y `npm.cmd test -- --silent --runTestsByPath __tests__/feed.test.tsx`: PASS, siete pruebas existentes. Sin nuevas pruebas para este cambio de texto reversible. Revisión visual en dispositivo pendiente; no se atribuyen capturas previas a este ajuste.

## EV-05 — Retirar Contacto directo (2026-11-10)

Tras la petición adicional, Publisher_Card renderiza la última fila de stock únicamente para LIVE. STATIC termina en la zona, sin leyenda ni nodo vacío. Inspección del JSX; desde Frontend, `npx.cmd tsc --noEmit` y `npm.cmd test -- --silent --runTestsByPath __tests__/feed.test.tsx`: PASS, siete pruebas existentes. Sin cambios al contacto desde detalle. Revisión visual física pendiente.

## EV-06 — Publicaciones normales blancas (2026-11-10)

homePage cambia el fondo del destacado a COLORS.white con contorno COLORS.border; aplica gangaSoft únicamente cuando featured.is_ganga_active. Publisher_Card ya usaba blanco para publicaciones normales y naranja suave en oferta y se conserva. Desde Frontend: `npx.cmd tsc --noEmit` y `npm.cmd test -- --silent --runTestsByPath __tests__/feed.test.tsx`: PASS, siete pruebas existentes; sin nuevas pruebas para el ajuste visual reversible.

Revisión con el fixture existente y copia local acotada del verificador (`node .local/verify-feed-white.cjs --feed-colors-only`): PASS, nueve capturas en `.local/visual/feed-white-{normal,ganga,catalog}-{320,375,430}.png` y `feed-white-result.json`. Comprueba fondo calculado blanco rgb(255,255,255) en normal/Catálogo y naranja suave rgb(255,241,228) en oferta, sin recursos ausentes, excepciones ni desbordamiento horizontal. Para reproducir con el verificador versionado: `node scripts/verify-redesign-ui.cjs`, revisar feed/ganga-feed y cambiar a Catálogo; los colores se deciden por is_ganga_active en homePage. Chrome headless ejecutado fuera del sandbox; inspección directa de normal/oferta a 320 y normal a 375/Catálogo a 430. Las capturas auxiliares no acreditan ejecución en hardware. Los dos intentos preliminares fallaron por ruta de la copia y rol del selector del verificador; corregidos antes del PASS final, sin cambios adicionales a producción.
