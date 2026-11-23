# Verificación
| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 T-05 | EV-01 EV-04 | PASS técnico/auxiliar |
| AC-02 | T-02 T-05 | EV-02 EV-04 | PASS técnico/auxiliar |
| AC-03 | T-02 T-05 | EV-02 EV-04 | PASS técnico/auxiliar |
| AC-04 | T-03 T-05 | EV-03 EV-04 | PASS técnico/auxiliar |
| AC-05 | T-04 T-05 | EV-04 | PASS técnico/auxiliar |

Entorno: Windows, Expo SDK 58, referencias locales leídas como imágenes. Sin modificaciones a backend, base de datos o contratos de escritura. No se acredita hardware con capturas web.

## EV-01 — Filtros
`Frontend/__tests__/filter-sheet.test.tsx`: intersecciones por ambas dimensiones, total, ceros conocidos deshabilitados, ausencia de consultas cerrada, descarte de respuesta vieja, fallo sin inventar ceros y recuperación. `feed.test.tsx` conserva combinación AND, aplicar/cerrar/restablecer y eventos con datos de facetas explícitos. Conteos proceden de `listPublications(type, undefined, undefined, q)` existente sin paginación; se filtra expiración local y se reconsulta al cambiar el feed. Borrador no provoca consultas por cada selección; solo combina la colección real recibida. Cantidades también disponibles como ayuda accesible, cierre retorna foco al disparador.

## EV-02 — Detalles
`reservation-screen.test.tsx` pasa con la consulta adicional de categorías simulada: confirmación previa, Volver sin reservar, clave/reintento, precio actualizado, reservas independientes, vencimientos y contacto LIVE/STATIC sin reservar. Contenido visual separado de acciones. Capturas STATIC con ANUNCIO/Usado/Libros y LIVE con cierre/stock/zona/hora; GANGA compara precio vigente/anterior válido. Categoría fallida se omite sin inventarla; ubicación solo zona confirmada. Pie sin reserva en anuncios; sin botón Reportar no implementado.

## EV-03 — Cuenta
`account.test.tsx` pasa: datos reales, correo fijo, edición/normalización/cancelación, error/reintento, éxito, carga sin identidad inventada, logout y guardado con bloqueos. Encabezado extraído de Explorar y reutilizado, sin cambiar MarketplaceViewport. Teléfono se agrupa únicamente en presentación; el editor/payload conserva valor canónico. Capturas con vista normal/editor, carga/error y nombre/correo largos.

## EV-04 — Calidad y revisión Impeccable
Desde Frontend:
- `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- `npm.cmd test -- --watch=false`: 20 suites, 147 pruebas PASS.
- `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/surfaces-export --max-workers 2`: Android/iOS PASS.
- `node scripts/verify-redesign-ui.cjs --surfaces-only`: 34 capturas PASS a 320/390/430 y horizontal 844×390; filtros normal/selección/error, detalles normales/Ganga/foto ausente/texto largo, cuenta/editor/carga/error/texto largo. Simulación fontScale 1.5 auxiliar. Sin excepciones, recursos ausentes ni desbordamiento horizontal de documento/controles. `evidence/visual.json` y PNG finales.

Skill Impeccable: contexto de sesión conservado, craft-floor y pase polish sobre capturas y fuentes. Detectores de filter-sheet/publication-detail-content/account: `[]`. Resultado y correcciones en [review.md](review.md). No se cambió el sidecar antiguo ni se ejecutó flujo de rediseño abierto: la dirección fue fijada por DESIGN.md/refs.

`node scripts/check-sdd.mjs` y `git diff --check` cierran consistencia documental/formato. Teclado, lector, gestos, escalado real y apertura/retorno de WhatsApp requieren aceptación física; no se cierran 5.1–5.6 ni UAT por esta evidencia.
