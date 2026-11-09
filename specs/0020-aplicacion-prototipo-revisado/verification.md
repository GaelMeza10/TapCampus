# 0020 — Verificación

Estado: Verificado (técnico y visual web) | Fecha: 2026-11-05

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-03 | EV-01 | PASS |
| AC-02 | T-01/T-03 | EV-02 | PASS |
| AC-03 | T-02/T-03 | EV-03 | PASS |
| AC-04 | T-03/T-04 | EV-04 | PASS |

## EV-01 — Referencia, navegación y encabezados

Fuente: archivo Figma XvTMHHlXw8yfnd6x0v7Ulh, copias revisadas 78:292; contextos de alta fidelidad de 78:332, 80:284, 78:630, 78:310, 78:436 y 78:584. Implementación nativa con StyleSheet/Flex, componentes existentes e Inter local; no se incorpora React/Tailwind generado ni imágenes aplanadas de pantallas.

marketplace-shell.tsx usa los SVG locales aprobados de brújula/comprobante/bolsa, 24×24, tintado activo/inactivo, destinos y selección accesibles. Se sustituyen círculos. TypeSelector admite la etiqueta Con horario en ventas; ambas opciones visibles y filtro LIVE/STATIC existente conservado. PageHeader y autenticación sin subtítulos redundantes. Se conservan avisos funcionales y acciones reales de sesión/contacto.

Activos descargados desde Figma e incluidos por require en Frontend/assets/icons/marketplace. [Hashes](evidence/icon-hashes.json). La exportación de ambas plataformas incluye los tres SVG. Sin URL temporal de Figma en código de ejecución. La prueba de ventas existente comprueba selección explícita de Catálogo y continúa hasta marcar vendido con confirmación. Captura [ventas](evidence/sales.png).

## EV-02 — Tarjetas y adaptación

Publisher_Card.tsx aplica la misma estructura a todas las filas: foto API de 100×100 o fallback, estado/título/precio/zona/contexto, con título flexible y precio anterior solo cuando corresponde. Fallo de foto conserva información y acción; una URL nueva se vuelve a intentar (publisher-card.test.tsx). El detalle separa precio/stock y usa foto de 221 puntos; conserva desplazamiento, CTA inferior, vendedor y reservas reales.

31 capturas generadas por `node scripts/verify-redesign-ui.cjs`, usando pantallas reales, adapter Axios aislado y Chrome sin ventana. [Resultado completo](evidence/visual-result.json): anchos 320/390/430, cero excepciones, recursos ausentes o desbordamiento horizontal; controles visibles dentro del ancho y ausencia de subtítulos retirados. Muestras persistidas: [feed](evidence/feed.png), [título largo a 320](evidence/feed-long-320.png), [detalle a 430](evidence/detail-long-430.png), [formulario a 320](evidence/form-320.png).

Revisadas visualmente las muestras anteriores, acceso/registro, reserva confirmada, error por campo, envío, ventas normales/con ganga/finalizadas, catálogo y configuración de ganga. El primer recorrido detectó un TextInput fuera de su columna; se añadió minWidth:0 al grupo/entrada y el recorrido completo posterior pasó. El listado permanece virtualizado con FlatList y espacio inferior para alcanzar las últimas filas.

## EV-03 — Formularios y acciones

CustomInput comparte etiqueta, borde de error, mensaje debajo y accessibilityHint; errores generales del servidor usan InlineMessage. Registro atribuye errores de correo/teléfono/contraseña a su campo. Publicación muestra validación específica de título, descripción, stock y precio; conserva errores generales para foto/catálogos/horario/configuración. Campos, selector y acciones de publicación se bloquean durante envío; se conservan borradores y validaciones existentes. PrimaryButton muestra indicador y texto de envío, con estado accesible ocupado/deshabilitado. La confirmación crítica usa contenido desplazable y safe areas.

auth-screens.test.tsx comprueba campo correcto, conservación de valores, normalización, fallo real, doble envío bloqueado y reintento; no usa esperas artificiales. Las suites existentes conservan filtros provisionales, respuestas antiguas descartadas, privacidad, claves de reserva, precios fijados, estados y entregas tras finalizar. Capturas: [error de acceso](evidence/login-validation.png), [registro enviando](evidence/register-sending.png), [venta finalizada con entregas vigentes](evidence/sales-finished.png).

## EV-04 — Comandos y convergencia

Desde Frontend, Windows/Node/Expo SDK 58:

- `node node_modules/typescript/bin/tsc --noEmit`: PASS, salida 0.
- `npm.cmd test -- --silent --json --outputFile=.local/prototype-0020-tests.json`: 12 suites, 43 pruebas PASS. [Resumen persistido](evidence/tests.json).
- `node scripts/verify-redesign-ui.cjs`: PASS, 31 capturas. En entorno restringido Chrome no respondió a DevTools; se repitió con permiso fuera del entorno restringido. El servidor efímero solo sirve el fixture, no inicia ni modifica API/BD del usuario.
- `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir .local/prototype-0020-native --max-workers 2`: PASS, bundles Hermes iOS/Android y 46 activos referenciados. [Metadata](evidence/native-metadata.json).
- Desde raíz: `node scripts/check-sdd.mjs` y `git diff --check`: PASS, salida 0. Git solo avisa conversión de finales LF a CRLF.

Docs04/05, auditoría, trazabilidad, índice y TASKS 5.13 alineados. Sin cambios de backend, contratos, dependencias o migraciones. No se creó commit ni se modificaron archivos ajenos añadidos durante la pausa.

## Límites

Esta evidencia acredita implementación, pruebas automatizadas, revisión visual web y empaquetado de bundles; no instalación de APK/IPA. Teclado/cámara/WhatsApp en teléfono, lectores de pantalla, Dynamic Type y orientación horizontal requieren recorrido físico. No se declaran aprobados ni se cierran 5.1–5.6 o UAT. El fixture usa datos ilustrativos; las solicitudes de producción siguen utilizando API, autenticación y estados reales.
