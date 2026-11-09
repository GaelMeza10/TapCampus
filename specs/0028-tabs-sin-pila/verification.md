# Verificación

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-03 | EV-01 | PASS técnico |
| AC-02 | T-02/T-03 | EV-01/02 | PASS técnico |
| AC-03 | T-03/T-04 | EV-01/02 | PASS técnico |

## EV-01 — Router real en memoria

2026-11-09, Windows, Expo SDK 58 instalado. Desde Frontend: `npm.cmd test -- --runTestsByPath __tests__/navigation.test.tsx`: 14/14 PASS. Layouts raíz y Tabs reales con barra MarketplaceShell; pantallas mínimas y sesión/almacenamiento simulados, sin API real.

Se pulsa la barra repetidamente y se verifica que la pila raíz conserva su longitud y la misma clave del grupo, cuyo estado es de tipo tab y sin rutas duplicadas. Un contador local conserva su valor al regresar. El activo no duplica navegación. Atrás tras Reservas→Ventas→Cuenta vuelve a Explorar. Detalle añade exactamente una pantalla y Atrás recupera origen. Ver mis reservas y guardar retornan al grupo existente, sin pantallas secundarias ni otro grupo; guardar conserva type STATIC en destino. Enlaces a cuatro destinos sin sesión redirigen a login; login con token, logout y 401 se comprueban con AuthProvider real.

La primera prueba detectó que navigate desde detalles/edición producía dos grupos Tabs con un detalle intermedio. Se corrigió usando dismissTo en esos retornos y se volvió a ejecutar: PASS. Entre pestañas permanece navigate.

## EV-02 — Compatibilidad y convergencia

2026-11-09, desde Frontend:

- `npm.cmd test`: 14 suites, 84 pruebas PASS, incluidas las 14 de navegación. La prueba adicional de ventas verifica cambio de parámetro en pantalla montada, selección visible y sincronización de URL al tocar el selector.
- `node node_modules/typescript/bin/tsc --noEmit`: exit 0.
- `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/exports-tabs --max-workers 2`: exit 0; bundles Android (1434 módulos) e iOS (1382 módulos), metadata y assets generados localmente.
- Desde raíz: `node scripts/check-sdd.mjs`: PASS; `git diff --check`: sin errores de whitespace.

T-04: índice, TASKS 5.20, arquitectura, flujos, auditoría y trazabilidad actualizados. Imports del fixture visual adaptados al layout real; no se ejecutaron nuevas capturas ni se acredita revisión visual física. Sin cambios a estilos, textos visibles, API o datos.

Límite: pruebas en memoria y exportaciones no acreditan gestos, botón Atrás físico, VoiceOver ni UAT en iPhone/Android. Las tareas globales 5.1–5.6 siguen abiertas.
