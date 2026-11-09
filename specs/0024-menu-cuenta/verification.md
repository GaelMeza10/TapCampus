# 0024 — Verificación

Estado: Verificado técnico y visual auxiliar | Fecha: 2026-11-06

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-02, T-03 | EV-01 | PASS técnico y visual |
| AC-02 | T-01, T-02, T-03 | EV-02 | PASS automatizado |
| AC-03 | T-01, T-02, T-03, T-04 | EV-03, EV-04 | PASS técnico y visual auxiliar; foco/VoiceOver/Dynamic Type físicos pendientes |

## EV-01 — Organización y acceso

AccountMenu es la acción por defecto de PageHeader, conservando action personalizado. Los tres módulos principales lo usan: Cuenta con icono Ionicons/etiqueta, 44 puntos mínimos, abre Mi cuenta. Retirados useAuth y logout del footer de sales.tsx; la acción de publicar y las pestañas siguen iguales. No hay nuevos destinos, perfil editable o backend.

`account-menu.test.tsx` comprueba los tres encabezados, ausencia de Cerrar sesión hasta abrir, apertura/cierre sin logout y cierre solo por acción explícita. El recorrido visual comprueba que Cerrar sesión no esté en el listado de ventas antes de abrir Cuenta.

## EV-02 — Envío y navegación

Estado busy y candado síncrono evitan repetición; Sheet recibe dismissDisabled opcional, false por defecto, y bloquea botón, fondo y regreso del sistema durante logout. Error local recuperable mantiene la hoja. Pruebas de promesa pendiente, cierre bloqueado, error/reintento y éxito incluidas. AuthContext, SecureStore y guardas no se modificaron; `navigation.test.tsx` sigue verificando logout → login y protección de rutas. No se cerró la sesión real del usuario desde las herramientas.

## EV-03 — Verificación reproducible

Desde Frontend:

- `npm.cmd test -- --silent --json --outputFile=.local/account-menu-0024-tests.json`: PASS, 13 suites y 61 pruebas. [Resultados](evidence/tests.json).
- `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- `node scripts/verify-redesign-ui.cjs`: PASS, 45 capturas a 320/390/430, sin desbordamiento horizontal, controles fuera del ancho, recursos faltantes ni excepciones. [Resultado](evidence/visual-result.json). Fixture aislado, servidor/Chrome cerrados al acabar; Expo y API del usuario continúan activos.
- `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir .local/account-menu-0024-native --max-workers 2`: PASS, bundles Hermes y 46 activos. [Metadata](evidence/native-metadata.json). No es instalación nativa.

Revisadas visualmente [hoja Cuenta](evidence/account-menu.png), [encabezado pequeño](evidence/feed-long-320.png), [ventas](evidence/sales.png), cuenta desde reservas/ventas y hoja a 320/430. Conservados Inter, colores, áreas táctiles y navegación. Las capturas son web auxiliares, no prueba de VoiceOver o interacción física en iPhone.

Raíz: `node scripts/check-sdd.mjs` y `git diff --check` → PASS tras actualizar índice, TASKS, docs04/05, auditoría y trazabilidad. Revisado alcance del diff; solo avisos LF/CRLF. Sin cambios de API, dependencias, migraciones, datos o commit. Archivos/cambios anteriores preservados. Aceptación física/VoiceOver del menú por confirmar; las casillas globales 5.1–5.6 no se cierran por esta mejora.

## EV-04 — Refinamiento con Impeccable y ui-ux-pro-max

Petición explícita posterior del usuario de usar ambas skills. Impeccable polish: inspección independiente de código/render, sin snapshot de crítica aplicable a account-menu, detector HTML no aplicable a la app nativa. Context se había cargado una vez en esta sesión; no se repitió. No se cierra un snapshot que no se haya leído. Se conserva Operate, Inter y paleta aprobada; no rediseño ni ampliación de perfil.

ui-ux-pro-max: consulta ux «modal focus management» devuelve Focus States (All), stack «touch target accessibility» recomienda Pressable/áreas táctiles; pro-rules y quick-reference requieren 44 pt iOS/48 dp Android, estados y foco modal. La guía de stack referencia RN0.86; se contrastan cambios con tipos instalados RN0.88/Expo58, no se cambian dependencias por esa referencia.

Hallazgos corregidos: Sheet no dirigía explícitamente foco al encabezado ni ofrecía retorno al activador; Cuenta/cierre medían 44 también en Android; la hoja no respetaba movimiento reducido y el envío/error de logout no tenía anuncio explícito. Sheet comparte encabezado accesible, onShow/foco, retorno opcional por referencia, preferencia inicial/evento de movimiento reducido y objetivos Android 48. AccountMenu transmite su activador tipado y anuncia envío/error. AuthContext, logout, guardas, distribución y funciones permanecen iguales.

- `npm.cmd test -- --silent --json --outputFile=.local/account-menu-0024-polish-tests.json`: PASS, 13 suites/62 pruebas. Nueva prueba verifica encabezado semántico, animación none con preferencia reducida y anuncio del error sin cerrar. [Resultados](evidence/polish-tests.json).
- `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- `node scripts/verify-redesign-ui.cjs`: PASS, 47 capturas; mantiene tres módulos/320/390/430 y añade 375×812 y 844×390 con prefers-reduced-motion. Comprueba foco activo en Mi cuenta, retorno a Cuenta al cerrar y dos acciones visibles de al menos 44 sin recortes. [Resultados](evidence/polish-visual-result.json), [375](evidence/polish-account-375.png), [horizontal](evidence/polish-account-landscape.png). Muestras revisadas visualmente; evidencia web auxiliar, no Dynamic Type/VoiceOver nativo.
- `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir .local/account-menu-0024-polish-native --max-workers 2`: PASS, dos bundles Hermes y 46 activos; [metadata](evidence/polish-native-metadata.json). Metro recuperó automáticamente una caché ilegible mediante recorrido completo; exportación terminó con salida 0.

No se cerró la sesión real. Expo/API siguen activos, servidor/Chrome del fixture cerrados. Verificación física de foco/lector, texto ampliado y preferencias del sistema por confirmar. Check-sdd/diff → PASS tras esta actualización; solo avisos LF/CRLF. Se conservaron archivos y cambios anteriores.
