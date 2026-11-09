# Verificación

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-03 | EV-01 | PASS |
| AC-02 | T-02 | EV-02 | PASS |
| AC-03 | T-03/T-04 | EV-01/03 | PASS técnico y visual auxiliar |

## EV-01 — Textos y pruebas

Desde Frontend: `npm.cmd test`: 15 suites/96 pruebas PASS; `node node_modules/typescript/bin/tsc --noEmit`: PASS. Se adaptaron expectativas de formulario y ventas al nuevo vocabulario; contratos de ganga_min_price y evento ganga_activated conservados. apiMessage traduce textos heredados del servidor antes de mostrarlos; mantiene identificadores internos. Revisión de ocurrencias restantes: claves, acciones, nombres de componentes/tokens y contratos técnicos, sin etiquetas o instrucciones Ganga en JSX.

## EV-02 — Datos Demo

Desde Backend: `node scripts/rename-demo-offers.cjs`: 3 títulos actualizados, repetición 0. Comparación de todas las filas/columnas de publicaciones dentro de la transacción comprueba que solo cambiaron títulos de los tres IDs 27000000…001/002/003 con texto original exacto. SQL no toca tablas de usuarios, reservas, catálogos, precios, stock ni horarios. Snapshot resumido reproducible: Backend/.local/offer-titles-0030.json. Semilla seed-demo-gangas.ts usa en oferta para nuevas instalaciones; no se reejecutó el seed para modificar datos existentes.

## EV-03 — Visual, Metro y convergencia

`node scripts/verify-redesign-ui.cjs` (Chrome headless fuera del entorno restringido, fixture aislado): PASS, 66 capturas, sin excepciones, recursos ausentes ni desbordamiento horizontal. Incluye oferta a 320/375/430 y horizontal; texto ampliado nativo y VoiceOver siguen sin aceptación física. Inspección directa de ganga-feed-375.png y ganga-config.png confirma Oferta y Precio de oferta/Sin oferta; icono, colores y comparación intactos. Nombres históricos de capturas conservados.

No se ejecutaron exportaciones móviles simultáneas con Metro activo; cambio de texto sin dependencias, esquema o API nueva. TASKS/índice/docs02/04/05/06/09/10 y PRODUCT actualizados; evidencia histórica preservada. Convergencia y check-sdd desde raíz.

Metro dejó de responder en la comprobación posterior al trabajo visual. Reiniciado solo Expo con caché limpia, dos workers y --offline (LAN, sin consultas externas de CLI). Un intento con --lan y --offline fue rechazado por exclusión de argumentos; corregido antes de verificar. Proceso final 9264 activo. GET manifiesto iOS y launchAsset por localhost →200/200, 7,119,660 bytes; bundle incluye Oferta y Precio de oferta. [Resumen runtime](evidence/runtime.json). Esta prueba acredita entrega desde el equipo, no carga física en iPhone. Feed HTTP real →200, tres títulos en oferta y precios previo/actual intactos; [evidencia de transacción](evidence/demo-titles.json).
