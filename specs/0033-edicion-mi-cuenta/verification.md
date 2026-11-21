# Verificación

Estado: PASS técnico y composición auxiliar; revisión independiente ship auxiliar, aceptación física separada. Fecha: 2026-11-10, Windows, Expo SDK 58/NestJS 12/Prisma 7.

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01/T-03 | EV-01 | PASS HTTP con repositorio aislado |
| AC-02 | T-01/T-03 | EV-01 | PASS normalización y serializer de reserva; sin prueba nueva en PostgreSQL |
| AC-03 | T-02/T-03 | EV-02/03 | PASS UI/regresión/composición auxiliar |
| AC-04 | T-02/T-03/T-04 | EV-02/03 | PASS técnico y revisión auxiliar, aceptación física separada |

## EV-01 — API propia y contacto

Desde Backend: `npm.cmd test -- --runInBand`: PASS, ocho suites/26 pruebas (13 nuevas en update-profile.spec.ts). Nest, ValidationPipe estricto, Passport/JWT, AuthController/AuthService/UsuariosService reales con repositorio Prisma en memoria. Comprueba normalización de nombre compuesto y +52, cambios parciales, mismo JWT válido tras PATCH, GET con datos actualizados, cuenta ajena/hash/email intactos; cuerpos vacíos/null/incorrectos y campos protegidos 400 sin update; sin JWT/inválido/cuenta eliminada 401.

La prueba consulta ReservationsService real con la relación actualizada del repositorio: una reserva previa devuelve el teléfono nuevo del vendedor y conserva precio. Inspección de PublicationsService.detail confirma consulta vigente del teléfono para STATIC; no se modifica su serializer. Mis reservas/Mis ventas/detalle ya usan useMarketplaceSync para reconsultar al recuperar foco; detalle relee también myReservations y lastConfirmed. No hay eventos públicos nuevos ni contactos expuestos a nuevos actores.

`npm.cmd run build` y `npm.cmd run lint` desde Backend: PASS. No hubo migraciones ni modificación de cuentas/BD del usuario. Esta evidencia prueba el contrato con repositorio aislado, no una escritura nueva en PostgreSQL ni el proceso API actualmente en ejecución.

## EV-02 — Editor y regresión

Desde Frontend: `npm.cmd test -- --silent`: PASS, 15 suites/103 pruebas. account.test.tsx prueba datos y correo en texto, formulario precargado, invalidación de nombre/teléfono, sin envío sin cambios, Cancelar descarta, fallo conserva borrador y reintento guarda perfil normalizado, bloqueo de doble envío/campos/cancelación/logout/navegación y envío parcial. Conserva pruebas de carga/error/logout y navegación. Servicio reutiliza el cliente con interceptor JWT/401 existente; sin token nuevo tras PATCH. `npx.cmd tsc --noEmit`: PASS, repetido tras modificar fixture.

## EV-03 — Composición y exportaciones

Desde Frontend: `node scripts/verify-redesign-ui.cjs --account-edit-only`: PASS, 15 PNG en `.local/visual/`, manifiesto `account-edit-result.json`, sin excepciones/recursos ausentes/desbordamiento horizontal. Editor con nombre/correo largos, acciones desplazadas y éxito a 320/375/430 y horizontal 844; error con borrador, reintento y guardado pendiente a 375. Fixture usa PATCH sobre perfil sintético en memoria; no llama a servicios/cuentas reales. Chrome ejecutado fuera del sandbox por limitación de DevTools ya comprobada en esta sesión.

`node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/exports-account-edit --max-workers 2`: PASS ambos bundles. Capturas son evidencia auxiliar web; teclado, foco/lectores y escala de texto físicos quedan pendientes. No hay nuevo tema oscuro ni cambios al sistema de tokens.

Reviewer fresco: **ship** solo composición auxiliar de los 15 originales, sin hallazgos materiales. Cinco secciones y límites en [review.md](review.md). No se aplicó detector HTML/CSS a RN. `node scripts/check-sdd.mjs` y `git diff --check`: PASS. Documenter fresco cotejó tokens, controles y manifiesto/capturas en [design-review.md](design-review.md); preservó DESIGN.md y sidecar sin regenerar ni reparar drift preexistente. Cierre técnico/auxiliar, sin atribuir aceptación física ni despliegue de API.
