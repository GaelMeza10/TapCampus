# 0025 — Verificación

Estado: Verificado técnico y visual auxiliar | Fecha: 2026-11-06

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-03, T-05 | EV-01 | PASS |
| AC-02 | T-01, T-03, T-05 | EV-02 | PASS |
| AC-03 | T-02, T-03, T-05 | EV-03 | PASS técnico/visual |
| AC-04 | T-02, T-03, T-05 | EV-04 | PASS |
| AC-05 | T-04, T-05 | EV-05 | PASS técnico, límites físicos documentados |

## EV-01/02 — Servidor y consulta real

`publications-search.spec.ts` verifica normalización, q vacío, arrays/null/números/longitud, intersección de tipo/zona/categoría con visibilidad y OR de título/descripción en modo insensitive. Comprueba escape de %, _ y barra inversa, orden ganga y proyección seller sin teléfono; consulta antigua sin q conserva sus condiciones.

API reconstruida y reiniciada para servir la ampliación. [GET real](evidence/real-smoke.json): 13 artículos STATIC disponibles; búsqueda en mayúsculas con espacios devuelve la publicación esperada, intersección de zona/categoría correcta, búsqueda imposible →200 vacío, espacios equivalen al listado original, >100/repetido →400, % literal sin coincidencias amplias y sin contactos públicos. Solo GET; no se modificaron inventario, reservas ni publicaciones.

## EV-03/04 — Cliente y UX

CustomInput compartido admite iconColor/trailingAction opcionales, defaults anteriores conservados. Home añade búsqueda siempre visible y limpieza accesible, conserva tipo/filtros y consulta servidor. Texto pendiente/aplicado separados, 300 ms de pausa cancelable, submit/limpiar inmediatos. Mientras cambie texto se ocultan filas anteriores; generación descarta respuestas antiguas. Estados de carga, error/reintento y vacío con recuperación sin perder texto/filtros. FlatList y eventos/reconexión conservados.

`feed.test.tsx`: combinación, submit, limpiar sin borrar filtros, pausa de 300 ms sin solicitud por letra, conservación al cambiar tipo, respuestas fuera de orden y fallo/reintento con consulta vigente. `marketplace-contracts.test.tsx`: q normalizado y omisión de texto vacío. Pruebas previas de sesión, reservas, ventas e imágenes siguen aprobadas.

## EV-05 — Comandos y capturas

- Frontend `npm.cmd test -- --silent --json --outputFile=.local/search-0025-tests.json`: 13 suites, 66 pruebas PASS; [resultados](evidence/tests.json).
- Frontend `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- Backend `npm.cmd run build`, `npm.cmd test -- --runInBand --silent` (7 suites/12 pruebas) y `npm.cmd run lint`: PASS.
- `node scripts/verify-redesign-ui.cjs`: PASS, 51 capturas, sin desbordamiento horizontal, controles fuera de ancho, recursos ausentes o excepciones. [Resultado](evidence/visual-result.json). Revisadas [barra](evidence/feed.png), [resultados](evidence/search-results.png), [320](evidence/search-results-320.png), [430](evidence/search-results-430.png) y [vacío](evidence/search-empty.png). Fixture usa búsqueda de texto aislada y comprueba limpieza; servidor/Chrome del fixture cerrados al terminar.
- Frontend `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir .local/search-0025-native --max-workers 2`: PASS, dos bundles Hermes/46 activos; [metadata](evidence/native-metadata.json). Metro recuperó una caché ilegible con recorrido completo y terminó con salida 0.
- Raíz: `node scripts/check-sdd.mjs` y `git diff --check` → PASS tras convergencia documental. Revisado diff de query, consulta, cliente y componentes; solo avisos LF/CRLF. Cambios/archivos previos preservados.

RF-05c/US-05c, contrato docs03, UI/flujos y referencia 0005 actualizados; alcance nuevo reconocido en auditoría. Sin paquetes, migraciones, cambios de reservas o commit. API y Expo quedan activos. Las capturas web no acreditan teclado ni VoiceOver nativos; confirmación de búsqueda en iPhone pendiente, sin cerrar 5.2 ni UAT. No se promete búsqueda sin acentos ni difusa.
