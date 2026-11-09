# 0026 — Verificación

Estado: Verificado (técnico y visual auxiliar) | Fecha: 2026-11-09

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-04, T-05 | EV-01 | PASS |
| AC-02 | T-02, T-04, T-05 | EV-02 | PASS |
| AC-03 | T-03, T-04, T-05 | EV-03 | PASS |
| AC-04 | T-04, T-05 | EV-04 | PASS técnico; dispositivo separado |

## EV-01 — Navegación y contraste

Cuatro destinos, una selección, tocar activo no apila ruta; fondo rgba(23,97,59,0.12), texto/icono primary e Ionicons person-outline en Cuenta. [Contraste](evidence/contrast.json): 6.20:1 sobre blanco. [54 capturas](evidence/visual-result.json) sin overflow, excepciones ni recursos faltantes; revisadas visualmente [Mi cuenta](evidence/account.png), [320 puntos y textos largos](evidence/account-long-320.png), [error](evidence/account-error.png) y [Explorar](evidence/feed.png). 320/390/430 y variantes 375/landscape/movimiento reducido. Datos de perfil en capturas son fixtures aislados, no datos reales.

## EV-02 — Perfil autorizado real

Backend `npm.cmd run build`, `npm.cmd test -- --runInBand` (7 suites/13 pruebas) y `npm.cmd run lint`: PASS. Pruebas de proyección select id/name/email/phone, propiedad derivada de CurrentUser y ruta protegida. `VERIFY_PUBLIC_ORIGIN=http://10.41.60.121:3000 node scripts/verify-account.cjs`: [HTTP real](evidence/profile-http.json), 200 propio, 401 anónimo/token inválido e ID en query incapaz de cambiar propietario. JWT temporal de 60s únicamente en loopback, sin persistir token o datos personales. LAN configurada en Expo responde 401 sin credenciales, acredita existencia de ruta y protección, no el recorrido autenticado del iPhone.

La revisión automática rechazó enviar JWT/perfil por HTTP a LAN; se sustituyó por esta comprobación sin credenciales y validación autenticada en loopback. Al reanudar no había API/Expo ni Docker activos. Docker recuperó PostgreSQL/Redis existentes y se inició la API compilada actual en 3000. No atribuir el 404 reportado a una causa histórica única: el contrato antes existía en código, pero el proceso/origen del teléfono no estaba verificado.

## EV-03 — Datos, recuperación y sesión

Frontend `node node_modules/typescript/bin/tsc --noEmit` y `node node_modules/jest/bin/jest.js --runInBand --json --outputFile=.local/navigation-account-0026-tests.json`: PASS, 14 suites/77 pruebas ([resultado](evidence/tests.json)). Incluye datos recibidos sin IDs/contraseña en UI, carga, error/reintento, logout fallido/pendiente y guardas. Errores 404/500 con Cannot GET /auth/me nunca se muestran; cerrar sesión sigue disponible. El interceptor invalida ante 401 de auth/me y reservations, pero no ante credenciales incorrectas de login/register. Fixture visual ahora reproduce el 404 técnico.

## EV-04 — Compatibilidad y convergencia

`node scripts/verify-redesign-ui.cjs`: PASS 54 capturas (pantallas reales con servicios aislados). `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir .local/navigation-account-0026-native --max-workers 2`: PASS, 47 assets, bundles Hermes iOS/Android; [metadatos](evidence/native-metadata.json). Backend `node node_modules/typescript/bin/tsc --noEmit`: PASS incluyendo scripts. Tipos generados de Router se regeneraron mediante utilidad del SDK 58, sin casts. Se añadieron aria-selected/aria-disabled explícitos por compatibilidad RN Web; el verificador selecciona controles de la ruta visible y no pantallas retenidas del Stack.

`node scripts/check-sdd.mjs` y `git diff --check`: PASS. Fuentes docs02/03/04/05/09/10, TASKS e índice sincronizadas; 0024 conserva evidencia histórica y señala sustitución. Sin migraciones, dependencias nuevas o commit. Datos nuevos de gangas pertenecen exclusivamente a 0027.

No se ejecutó logout del usuario real ni se comprobó en hardware VoiceOver, Dynamic Type, foco o navegación autenticada del iPhone. Las tareas 5.1–5.6 y UAT siguen abiertas. Expo LAN reiniciado en 8081 para la comprobación del usuario.
