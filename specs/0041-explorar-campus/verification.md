# Verificación 0041

2026-11-21, Windows, Expo SDK 58. Evidencia de composición auxiliar web con datos aislados; ninguna mutación a la API/BD. Capturas en `evidence/`; no acreditan ejecución nativa.

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 T-05 | EV-01 EV-03 | PASS técnico y composición auxiliar |
| AC-02 | T-02 T-05 | EV-02 EV-03 | PASS |
| AC-03 | T-03 T-05 | EV-02 EV-03 | PASS |
| AC-04 | T-04 T-05 | EV-02 EV-03 | PASS técnico y revisión auxiliar |

## EV-01 — Tipos y empaquetado
Desde Frontend: `node node_modules/typescript/bin/tsc --noEmit` PASS. `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/explore-export --max-workers 2` PASS; fuente BricolageGrotesque_800ExtraBold.ttf empaquetada junto a Inter. Exportar no implica instalar/ejecutar en hardware.

## EV-02 — Comportamiento
Desde Frontend: `npm.cmd test -- --watch=false`: 17 suites / 140 pruebas PASS. Feed cubre búsqueda/debounce, filtros AND, carreras, eventos y recuperación; nuevos casos comprueban chips por tipo, Ganga sin duplicado y navegación sin mutación, anuncio sin reloj/stock y reserva no vencida más próxima con fallo de actualización recuperable. Pruebas de navegación actualizadas al color blanco activo.

## EV-03 — Revisión Impeccable y capturas
Desde Frontend: `node scripts/verify-redesign-ui.cjs --explore-only`: 22 capturas PASS, sin excepciones, recursos ausentes ni desbordamiento de documento; controles fuera de ancho se comprueban excepto hijos de scroll horizontal intencional. Anchos 320/390/430/844; LIVE y STATIC, cuadrícula tras desplazamiento, vacío, carga, error, foto ausente, texto largo y simulación fontScale 1.5. Resultado en `evidence/visual.json`. No es una prueba de VoiceOver/Dynamic Type nativos.

Aplicada skill Impeccable con contexto, craft-floor y pase polish: [review.md](review.md). Detector sobre explore-ui.tsx: `[]`. Se corrigieron ancho en columna única, ancho máximo de última fila incompleta, banner excesivamente alto y margen lateral del error. Comparación con refs conserva geometría/jerarquía y adopta colores y fuentes de DESIGN.md, que prevalece sobre colores amarillos del mock.

Convergencia: `node scripts/check-sdd.mjs` comprueba referencias. No se declara cierre de 5.2, UAT ni aceptación nativa. Nuevo/Usado no se implementa al faltar ese dato en API (DEC-03). No se incorporan raster de producto: fotos de API en producción; el fixture reutiliza fotografías locales de demostración y no define contenido real.

## EV-04 — Corrección directa del salto entre pestañas
Petición del usuario, sin plan adicional. AC-01/T-01: MarketplaceViewport aplica top/left/right una vez alrededor del navegador; screens no añaden su inset al adjuntarse. BottomNavigation usa insets del contenedor común. `marketplace-insets.test.tsx` simula insets locales 0/47 y comprueba ausencia de padding duplicado y bottom34 estable. Navegación real auxiliar repite siete cambios con top estable (`evidence/tabs-stability.json`, `tabs-stable.png`); exports Android/iOS PASS. Confirmación de la corrección en iPhone pendiente del usuario; no se acredita mediante web. La exclusión histórica de Nuevo/Usado de EV-03 se sustituye por 0042, conservando esa evidencia anterior.
