# 0047 — Verificación

Estado: Verificación técnica/auxiliar aprobada; aceptación nativa y comprensión pendientes | Fecha local: 2026-11-22

## EV-00 — Línea base conservada

T-01: [baseline](evidence/baseline.json) de solo lectura: 12 categorías, seis por tipo, cinco zonas; reservas sin ubicación, sin evento de creación, duración escrita y logout directo. No se modifica esa observación histórica. El usuario aprobó el plan y sus decisiones el 2026-11-22. La evidencia de 207 pruebas/157 capturas de 0044 es histórica y no cierra este expediente.

## EV-01 — Instrumentación nativa, aceptación pendiente

T-03/T-04: el usuario reporta iPhone 14 Pro Max y 13 Pro Max, iOS 27.2.1 y Expo SDK 58 en Expo Go. No se obtuvo un runtime Hermes conectado ni una reproducción física medible. La versión exacta de la aplicación Expo Go está pendiente. Se implementaron trazas acotadas de viewport/escena/logo/tabs, insets, ventana/fontScale, avisos, scroll, foco y teclado; solo desarrollo nativo, sin perfiles/contactos/tokens ni telemetría externa. Colector de lectura: `node Frontend/scripts/collect-layout-diagnostics.cjs` desde Frontend como `node scripts/collect-layout-diagnostics.cjs 8081`. [Secuencia y límites](native-check.md).

**El usuario confirma después: «ya esta solucionado». Se registra como confirmación funcional y se detiene la investigación adicional por su petición de priorizar. No se obtuvieron mediciones comparativas ni se identificó la causa específica. El criterio formal de ambos modelos/±1 punto no se declara medido.** No se atribuye la causa ni se aplican offsets negativos o insets congelados. Web y export no demuestran corrección nativa. Por petición posterior del usuario, API y Expo los arranca él manualmente; los dos procesos de desarrollo iniciados durante esta sesión se detuvieron y se verificaron libres sus puertos. No se detienen procesos del usuario.

## EV-02 — Recogida y reservas autorizadas

T-05/T-06: [63 solicitudes HTTP y dos sockets reales](evidence/contracts-and-sockets.json), PostgreSQL/Redis aislados. Reservas nuevas copian zona/nombre bajo bloqueo de publicación; idempotencia conserva una sola reserva. Cambiar zona LIVE con reservas vigentes devuelve 409. Ocho carreras entre reservar y cambiar zona conservan el lugar que ganó el bloqueo. Lectura propia mantiene producto, precio fijado, plazo, vendedor/contacto y lugar con publicación agotada/no pública; ajeno rechazado. Históricos sin instantánea devuelven LEGACY_CURRENT y una ubicación de referencia explícita. Pruebas unitarias adicionales comprueban esa distinción.

PickupLocation se comparte entre confirmación, Mis reservas y tarjetas de comprador/vendedor. Capturas auxiliares de reserva confirmada, recogida e histórico a 320/390/430 puntos. PASS técnico/auxiliar; recorrido físico integrado pendiente en AC-10.

## EV-03 — Entrega por acordar y migración conservadora

T-05/T-06: [respaldo restaurado, ensayo y aplicación local](evidence/migration-local.json). Se preservaron las columnas/datos originales de seis tablas: 14 usuarios, cinco zonas, 12 categorías, 83 publicaciones, 39 reservas y cero reportes al migrar. No se inventaron instantáneas históricas. CHECK rechaza LIVE por acordar; relación Zone conserva onDelete Restrict explícito. [Infraestructura actual](evidence/infrastructure-current.json) verifica validate/status/diff sin divergencia, restauración, transición, precios con procedencia y constraints.

POST legado con zona sigue funcionando. ARRANGED exige STATIC y null; combinaciones incompatibles y query contradictoria devuelven 400. PATCH omitido conserva ubicación; cambio de modo/zona es conjunto. Filtro de zona concreta excluye por acordar, todos incluye ambos y la opción Entrega por acordar tiene conteos reales. Formularios/edición/tipos/card/detalle/ventas y facetas adaptados; fallo de zonas no obliga a una zona cuando STATIC ya eligió por acordar. [Contratos](evidence/contracts-and-sockets.json) y capturas auxiliares: PASS. Rollback funcional: desactivar nuevas escrituras ARRANGED y mantener lectores compatibles; no restaurar NOT NULL ni fabricar lugares.

## EV-04 — Creación, edición e inicio por Socket.io

T-07: [dos clientes reales](evidence/contracts-and-sockets.json) reciben eventos mínimos postcommit de creación/edición y disponibilidad futura. En loopback se midieron 31 ms para creación y 61 ms tras el inicio programado en esa ejecución; no son mediciones en dos teléfonos ni una promesa para cualquier red. Inicio durable, reprogramación que descarta trabajo antiguo, cola pausada con recuperación por conciliación y deduplicación por fecha persistida: PASS. Marcador privado omitido de respuestas públicas/propias. La migración evita anunciar todo el historial anterior.

Hook conserva consulta/filtros, agrupa ráfagas, combina avisos durante una petición, descarta respuestas antiguas en pantalla y recupera por REST al conectar/enfocar/volver del fondo. Feed conserva ancla al leer y vuelve al inicio ante altas si ya estaba arriba. Jest comprueba nuevas publicaciones sin navegación, filtro por acordar y stock cero. [Fase 3 aislada](evidence/phase3-current.json): 386 HTTP, dos sockets, 50 compradores por última unidad (1x201/49x409), idempotencia, commit/bloqueos, cancelación/entrega/vencimiento, jobs perdidos y reinicio: PASS. **Dos sesiones móviles y aceptación del ancla en teléfono pendientes.**

## EV-05 — Duración H:M

T-08: selector iOS con Stepper para horas y Picker de minutos 0..59, Host con ancho/alto acotados; controles incrementales accesibles en Android/web, sin teclado numérico de duración. 75 minutos conserva 1 h 15 min al editar. Conversión a entero, cero, límites del horario/reloj, más de 23 horas, límite de API, Guardar/cerrar, oferta activa y borrador/foto cubiertos por pruebas. El valor inválido se conserva con error, sin ajuste silencioso. Tipos y exports iOS/Android PASS; composición auxiliar en tres tamaños PASS. **Interacción del control nativo en Expo Go pendiente.**

## EV-06 — Productos y prevención de regresiones

T-02/T-09: DEC-03 aprobada; [investigación](research.md) explica el cambio. PUBLICATION_COPY, DESIGN.md, Explorar/Vender/filtros/formulario/detalle/Mis ventas, mensajes del servidor, accesibilidad, fixtures y sidecar opcional usan Productos/Producto. La acción de creación STATIC es Publicar producto. No cambia LIVE/STATIC en API. Guardrail rechaza Anuncios/Nuevo anuncio y frases con el término retirado, además de nombres previos y copias locales. Pruebas de router, copy, diseño y recorridos PASS. **Comprensión con cinco estudiantes pendiente; la investigación no sustituye UAT.**

## EV-07 — Catálogo y semilla aplicada

T-10: [ensayo aislado](evidence/isolated-seed.json), [aplicación local y repetición](evidence/local-seed.json), [GET del servidor real y del origen configurado para móvil](evidence/running-api.json): PASS. 26 categorías, 16 LIVE/10 STATIC; IDs de las doce originales conservados. Semilla completa: seis personas ficticias, 107 publicaciones (67 LIVE/40 STATIC), 24 reservas y 20 fotos locales. Se conservan las primeras 48 publicaciones/doce reservas de 0046; nuevas filas se agregan al final. Nuevo lote de recogida con identidades separadas, sin reiniciar fechas anteriores. Ocho productos con entrega por acordar confirmados por API. Imágenes de las cuatro familias nuevas revisadas visualmente y [fuentes](../../Backend/prisma/demo-images/SOURCES-0047.md) registradas. No son inventario ni contactos reales.

Repetir no cambia contraseñas, títulos editados, stock, relojes o reservas; conflictos de identidad/password revierten el intento. Reservas/ventas demo vencen normalmente: el seed no rejuvenece datos existentes para aparentar disponibilidad. Selector buscable y catálogo completo en fixture actualizado con API; sin tildes también encuentra Electrónica. Verificación física de sus pantallas en AC-10.

## EV-08 — Confirmación de cierre de sesión

T-11: Cuenta abre ConfirmationDialog compartido. Cancelar vuelve sin logout y conserva borrador; advierte cambios sin guardar. Confirmar bloquea repetición/navegación, muestra espera, conserva sesión y permite reintento al fallar. Ref restaura foco al cerrar. Tests de cancelación, error/reintento y operación pendiente PASS; no se modifica el interceptor 401 ni el cierre automático de AuthContext. Capturas de diálogo en tres tamaños PASS; lector/teclado físicos pendientes.

## EV-09 — Agotamiento sin pérdida de reservas

T-12: stock_updated=0 retira inmediatamente la tarjeta observada y muestra un aviso temporal de seis segundos sin desplazar la lista; no borra filas ni marca venta terminada por agotar stock. Reserva confirmada/recogida/contacto se conservan. Cancelación devuelve disponibilidad solo dentro de horario/estado válidos. HTTP/SQL/socket, Jest y regresión de fase 3 PASS; aceptación visual nativa dentro de AC-10.

## EV-10 — Regresión, incidencias y convergencia

T-02/T-13: [resumen unitario](evidence/unit-tests.json), [fase 2](evidence/phase2-current.json), [fase 3 aislada](evidence/phase3-current.json), [infraestructura](evidence/infrastructure-current.json) y reportes visuales bajo evidence/ui. Los comandos reproducibles se listan abajo. Los resultados y huellas se resumen en evidence/quality.json. Ninguna casilla nativa o UAT se cierra con esta evidencia.

Incidencias corregidas durante verificación: limpieza de la conexión Redis del primer verificador; drift de FK al hacer zona nullable (onDelete Restrict explícito, sin cambiar la política de borrado); namespace Redis propio en el verificador de infraestructura. El primer intento amplio de fase 3 pasó sus 386 solicitudes funcionales pero su guard de origen falló porque apareció una reserva concurrente en la base local. [Registro original](evidence/phase3-source-changed.json) conservado; no se revirtió ese dato. Se repitió con una referencia aislada con datos y su guard pasó. No se presenta aquel intento como PASS completo.

Comandos desde Backend: `npm test -- --runInBand`, `npm run build`, `npm run lint`, `npm run test:usability`, `npm run test:seed:delivery`, `node scripts/verify-delivery-seed.cjs --apply-local`, `node scripts/verify-pickup-migration.cjs --apply-local`, `npm run test:phase2`, `npm run test:phase3:isolated`, `npm run test:infra` (PG_TOOLS_CONTAINER=backend-postgres-1). Migración/aplicación de seed solo sobre el destino elegido; requieren conservar respaldo y datos.

Desde Frontend: `node node_modules/typescript/bin/tsc --noEmit`, `npm test -- --silent`, `npm run check:design`, `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/export-0047 --max-workers 2`; auxiliar `node scripts/verify-redesign-ui.cjs --consistency-only`, y después con --reuse-bundle los modos --surfaces-only, --adverse-only y --usability-only. El auxiliar usa datos/puerto propios y no es aceptación nativa. Desde raíz: `node scripts/check-sdd.mjs` y `git -c core.safecrlf=false diff --check`.

## Matriz de aceptación

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-03, T-04, T-13 | EV-01 | Usuario confirma resuelto; medición formal por modelo no ejecutada |
| AC-02 | T-01, T-02, T-05, T-06, T-13 | EV-02 | PASS técnico/auxiliar; integración física pendiente |
| AC-03 | T-01, T-02, T-05, T-06, T-13 | EV-03 | PASS técnico/auxiliar |
| AC-04 | T-01, T-07, T-13 | EV-04 | PASS técnico; dos sesiones móviles pendientes |
| AC-05 | T-01, T-08, T-13 | EV-05 | PASS técnico/auxiliar; picker nativo pendiente |
| AC-06 | T-01, T-02, T-09, T-13 | EV-06 | Código y guardrails PASS; comprensión con estudiantes pendiente |
| AC-07 | T-01, T-02, T-10, T-13 | EV-07 | PASS técnico/local/auxiliar; lectura física pendiente |
| AC-08 | T-01, T-11, T-13 | EV-08 | PASS técnico/auxiliar |
| AC-09 | T-12, T-13 | EV-09 | PASS técnico/auxiliar |
| AC-10 | T-02, T-13 | EV-10 | Regresión técnica PASS; convergencia nativa/UAT pendiente |

0047 no se declara Verificado. TASKS 5.36, 6.5 y 6.6 siguen abiertos. El usuario confirma resuelto el desplazamiento; no se inventan trazas ni verificaciones separadas por modelo. El MVP integrado/UAT no se declara terminado por esta ejecución.
