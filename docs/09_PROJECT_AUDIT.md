# Auditoría del proyecto y decisiones de producto

## Ejecución técnica de 0039 y sincronización de diseño — 2026-11-21

[0039](../specs/0039-contacto-live-sin-reserva/verification.md) amplía solo el detalle visible LIVE con sellerContact actual y añade contacto secundario sin reserva/UUID ni cambio de stock. STATIC conserva su flujo; feed/mine/eventos no incorporan teléfonos. Reservas autorizadas conservan teléfono/título cuando el detalle se agota/finaliza. Se mantienen permisos y buyerContact solo al vendedor relacionado mientras ACTIVE no vencida; terminal/vencida no lo exponen.

Nueva evidencia: 102 pruebas backend/134 frontend, tipos/build/lint, contratos fase5, 288 HTTP fase2 y 386 fase3 (674), hashes/recuentos originales idénticos, dos clientes Socket.io, 16 capturas auxiliares y exports Android/iOS PASS. Fallo de WhatsApp separado del error de carga; el botón Contactar permite reintento real. El verificador auxiliar intercepta el adaptador web de Expo, que utiliza location. Chrome requirió ejecución autorizada fuera del aislamiento. Sin migración, dependencias ni despliegue del proceso del usuario.

Por petición expresa se sincronizó .impeccable/design.json conservando DESIGN.md byte a byte; huella registrada en 0039/evidence/summary.json. T-01..03 completas y AC-01..04 técnicos aprobados. T-04/AC-05, TASKS 5.6/5.30 permanecen abiertos: ADB sin dispositivos; sin apertura/retorno nativos observados. Siguiente bloque 0040: aceptación integrada/entrega/UAT. Los diagnósticos siguientes conservan su fecha y alcance histórico.

## Ejecución técnica de 0034 y 0038 — 2026-11-21

[0034](../specs/0034-errores-formulario-publicacion/verification.md) implementa validación conjunta, errores junto a su origen, aviso persistente bajo el título y foco tras actualizar layout. Los reintentos conservan borrador/foto y solo recargan el catálogo fallido. Se corrigió además un colapso del aviso al enfocar, detectado en la revisión auxiliar; el verificador comprueba ahora altura y desplazamiento real.

[0038](../specs/0038-filtro-palabras-publicaciones/verification.md) aplica política v1 local a título/descripción al crear o enviar texto en PATCH de LIVE/STATIC. Coincide por palabras/frases completas sin cruzar campos, preserva ñ y no transforma el texto persistido. Respeta permisos/estado y permite editar stock/precio sin revisar texto histórico no enviado. Error 400 con code/fields; formulario conserva la foto ya subida y no repite upload al corregir.

Evidencia nueva: 102 pruebas backend (62 de política), 124 frontend, tipos completos/build/lint, 283 HTTP fase2 y 374 fase3 (657), hashes/recuentos originales idénticos, 19 capturas auxiliares en cuatro tamaños/texto ampliado y exports Android/iOS PASS. Sin migración ni dependencias nuevas. 0034 T-01..03 y 0038 T-01..04 completas técnicamente; teclado/lector/foco/cámara reales pendientes. TASKS 5.4/5.29 permanecen abiertas. Siguiente implementación: 0039; 0040 conserva aceptación integrada/entrega/UAT.

Los apartados siguientes conservan el diagnóstico y la evidencia de cada fecha; las afirmaciones de implementación pendiente en las entregas de planificación son históricas y quedan sustituidas por esta ejecución.

## Ejecución técnica de 0037 — 2026-11-21

[0037](../specs/0037-control-y-privacidad-ofertas/verification.md) implementa privacidad de configuración futura en feed/detalle, tipos públicos/propios, precio mínimo estricto, modos/retirada con nulls explícitos y compatibilidad de activa/legado. El worker valida también que exista reducción real; bloqueo y relectura impiden ejecutar configuración retirada/obsoleta. El test de perfil conserva su aserción y ya pasa el tipado completo. El formulario conserva foto/borrador y segundos/milisegundos del horario si no fue editado.

Nueva evidencia: 39 pruebas backend/112 frontend, tipos, build/lint backend, contratos fase5, 257 HTTP fase2/374 fase3 (631 total), dos clientes Socket.io, ambos órdenes y seis carreras retirada/activación/reserva, reinicio y conciliación con oferta retirada. Hashes y recuentos originales idénticos; sin migración/seed sobre datos reales. Exportaciones Android/iOS PASS y nueve capturas auxiliares a 320/390/430 revisadas. Artefactos en el expediente; no se reescriben logs históricos.

Incidencias de verificadores corregidas: recuento de migraciones hardcodeado en fase2 y origen PUBLIC_BASE_URL heredado de dotenv del hijo. Cada proceso de prueba fija ahora su origen loopback; las pruebas conservan el caso explícito de origen personalizado. Revisión Chrome restringida agotó DevTools; reejecución autorizada sin ventana PASS.

T-01..05 completas; AC-01..06 aprobados técnicamente. AC-07/T-06 y TASKS 5.28 permanecen abiertos para recorrido nativo, ya que adb no mostró dispositivo y no hay AVD configurado. No se declara APK, despliegue final ni MVP completo; 0034/0038/0039 mantienen su alcance separado.

## Planes del cierre MVP preparados — 2026-11-21

El usuario autoriza comenzar la corrección y pide preparar primero los planes. Se crean cuatro expedientes completos, sin modificar código funcional ni ejecutar migraciones/seed/despliegues:

| Expediente | Alcance | Estado |
| --- | --- | --- |
| [0037](../specs/0037-control-y-privacidad-ofertas/plan.md) | Corregir tipado del test de perfil como paso inicial; configuración privada, mínimo estricto, modos/retirada, jobs obsoletos y compatibilidad de oferta activa/precios reservados. | Planificado; T/EV funcionales pendientes. |
| [0038](../specs/0038-filtro-palabras-publicaciones/plan.md) | RF-15, política v1, creación/texto editado LIVE/STATIC y recuperación del formulario. | Planificado; lista exacta en policy.md, implementación pendiente. |
| [0039](../specs/0039-contacto-live-sin-reserva/plan.md) | Consulta al vendedor desde detalle LIVE visible, sin reserva ni exposición del comprador. | Planificado; nueva aceptación no hereda EV de ausencia de contacto. |
| [0040](../specs/0040-validacion-y-entrega-mvp/plan.md) | Regresión actual, recorridos nativos, concurrencia/reinicio, infraestructura persistente, instalable y UAT. | Planificado; recursos/dispositivos/participantes son dependencias de ejecución. |

Decisiones incorporadas al alcance vigente:

- RF-05 y RF-10 pasan de SHOULD a MUST según el núcleo indispensable del plan integral; no cambia su comportamiento implementado. RF-14/moderación permanece SHOULD separado.
- GAP-11 histórico queda sustituido como decisión de alcance: filtro RF-15 obligatorio, todavía sin implementación. El usuario indica «groserías, términos despectivos, etc., analízalo» y delega la selección. Política v1 pequeña con entradas exactas y casos negativos; no se presenta como lista oficial del campus.
- Contacto LIVE previo sustituye la restricción anterior del teléfono del vendedor. Conserva feed/eventos sin contactos y privacidad del comprador hasta reserva activa no vencida.
- La retirada de configuración es anterior al disparo; no se revierte una oferta ya aplicada, conservando 0006 DEC-02. No hay reparación masiva de configuraciones/precios históricos.
- Se reutiliza el plan 0034 para avisos/campos/borrador; su redacción ya no obliga a conservar restricciones de oferta que 0037 corrige. No se duplica el refactor del formulario.

Se sincronizan requisitos, arquitectura objetivo, flujos, historias, validación, índice, trazabilidad, TASKS y resúmenes. Los expedientes base explican qué contratos nuevos sustituyen los anteriores; los logs/EV históricos conservan fecha y alcance. Ninguna casilla funcional se cierra por redactar el plan.

Orden de ejecución: base técnica y 0037 → patrón 0034 + filtro 0038 → contacto 0039 → aceptación/entrega 0040. La revisión actual es documental: no se repiten las 26/105 pruebas ni se afirma corregido el TS2339.

Comprobaciones documentales 2026-11-21:

- Desde raíz, `node scripts/check-sdd.mjs`: PASS de estructura, identificadores y cobertura AC→T→EV prevista.
- `git diff --check -- README.md PRODUCT.md TASKS.md docs specs`: PASS; solo avisos de normalización LF/CRLF de Git, sin errores de whitespace.
- Inspección automatizada de los cuatro directorios nuevos: 21 archivos Markdown, sin espacios finales ni enlaces locales rotos en esos archivos; cada expediente contiene los cinco artefactos requeridos y 0038 añade policy.md.
- Revisión semántica: RF-15/US-12 y prioridades enlazados; contratos actuales distinguidos de históricos; 0034 coordinado; todas las tareas funcionales/EV nuevas permanecen pendientes. No es evidencia de aplicación funcionando.

## Contraste con el plan integral proporcionado por el usuario — 2026-11-16

**Dictamen: el núcleo está implementado, pero no se acredita cumplimiento completo del MVP del plan integral.** Esta revisión usa como referencia el texto entregado por el usuario en esta sesión, además de los RF/RNF internos. No cambia decisiones de producto ni convierte diferencias de alcance en decisiones aprobadas. Se inspeccionó el árbol de trabajo, incluidos cambios previos sin commit, y se ejecutaron las comprobaciones siguientes sin modificar código funcional ni datos.

### Comprobaciones ejecutadas en esta revisión

| ID | Comando / entorno | Resultado observado |
| --- | --- | --- |
| REV-MVP-01 | Raíz: `node scripts/check-sdd.mjs` | PASS de estructura e identificadores; no prueba cumplimiento semántico del plan. |
| REV-MVP-02 | Backend: `npm.cmd test -- --runInBand` | PASS: 8 suites, 26 pruebas. |
| REV-MVP-03 | Frontend: `npm.cmd test -- --watch=false` | PASS: 15 suites, 105 pruebas. |
| REV-MVP-04 | Frontend: `node node_modules/typescript/bin/tsc --noEmit` | PASS. |
| REV-MVP-05 | Backend: `node node_modules/typescript/bin/tsc --noEmit --incremental false` | FAIL TS2339 en `src/auth/update-profile.spec.ts:62`: acceso a `sellerContact` sin estrechar la unión de respuestas comprador/vendedor. Las pruebas Jest aprobadas no cierran esta comprobación. |
| REV-MVP-06 | Backend: `node node_modules/typescript/bin/tsc -p tsconfig.build.json --noEmit --incremental false` | PASS del tipado de producción, que excluye pruebas; no se ejecutó un nuevo build empaquetado. |
| REV-MVP-07 | Backend: `npm.cmd run lint` | PASS. |

Las pruebas reales de concurrencia, PostgreSQL, Redis, reinicio y dos clientes Socket.io se contrastaron con el código y con `specs/0001-reservas/evidence/phase3.json` (2026-10-05: 311 solicitudes, 16 grupos PASS; última pieza 1×201/49×409; reintentos 1×201/49×200). **Son evidencia histórica: no se repitió esa integración en esta revisión.** No hubo nuevo recorrido físico, piloto UAT ni comprobación de despliegue externo.

### Cobertura y diferencias frente al texto entregado

| Área del plan | Estado y evidencia inspeccionada | Pendiente / diferencia |
| --- | --- | --- |
| Autenticación institucional y cuatro campos | Implementada: RegisterDto, validador de dominio, UsuariosService, bcrypt y JWT con expiración. | Completar aceptación móvil de sesión y validaciones; la validación del dominio no comprueba propiedad del buzón, conforme al alcance sin verificación por email del propio plan. |
| LIVE/STATIC editables, imágenes, horario, venta estática y venta física | Implementadas en PublicationsService, DTO, uploads y pantallas de publicación/Mis ventas. | Cámara/galería/permisos y recorridos de creación/edición/venta con servicios reales pendientes de aceptación integrada. 0034 sigue como plan de mejora de errores visibles. |
| Reservas de 20 minutos, cancelación, entrega y cierre anticipado | Implementados: transacciones con FOR UPDATE, precio fijado, idempotencia, workers y conciliación; evidencia histórica real de fase 3. | Recorrido completo comprador/vendedor en dispositivo; no confundir casillas 5.1–5.6 abiertas con módulos ausentes. El plan del usuario incluye cancelación y cierre como indispensables aunque RF-05/RF-10 internos los clasifican SHOULD. |
| Zonas, categorías y tiempo real | Implementados: catálogos/filtros, gateway y useMarketplaceSync con reconsulta al conectar, recibir eventos y volver al primer plano. | Dos dispositivos reales y reconexión pendientes de aceptación. Categorías ya están implementadas aunque la tabla del plan las considera deseables. |
| Filtro de palabras prohibidas al crear | No se encontró validación de contenido ni catálogo de términos en los DTO/servicio de publicaciones o frontend. GAP-11 histórico lo había excluido del MUST interno. | **Faltante del MVP del plan integral**, que sí lo enumera como indispensable. Definir requisito, términos y criterios antes de implementarlo; conservar el borrador al rechazar. |
| Oferta manual/programada y prioridad visual | Activación instantánea, workers, distintivo y orden del feed implementados. | Cumplimiento parcial de las reglas detalladas: ver hallazgos siguientes. |
| WhatsApp | STATIC directo y LIVE tras reserva; comprador/vendedor relacionados reciben contacto autorizado. | El plan permite contacto al vendedor LIVE antes de reservar; `PublicationsService.detail` solo añade sellerContact para STATIC y la pantalla LIVE no ofrece ese contacto previo. Es una diferencia de producto, no un fallo respecto al contrato interno actual. |
| Reportes y moderación | Modelo/flag presentes; no se encontraron rutas, servicio de reportes ni revisión operativa. | Opcional según la tabla de prioridades del plan y RF-14 SHOULD. El texto también dice que el rol simple cubre el MVP: aclarar esta ambigüedad antes de presentar toda la sección 4 como completada. |
| Entrega y validación final | TASKS 6.2/6.3 abiertas; sin eas.json ni APK/AAB/IPA en los archivos del proyecto inspeccionados. | No hay evidencia de entrega instalable, despliegue final o UAT completo. Un export JS no equivale a un instalador. No se descarta un artefacto o despliegue fuera del repositorio. |

### Hallazgos concretos en precio de oferta

1. **Configuración futura expuesta al comprador.** `Backend/src/publications/publication.select.ts:22` incluye `ganga_min_price`, `ganga_activation_mode` y `ganga_minutes_before`; `PublicationsService.list/detail` usan esa misma proyección y `publicationResponse` la devuelve. Aunque la UI no los muestre, la respuesta permite conocer si hay oferta programada, su precio y su umbral antes de activarse. Contradice la incertidumbre que fundamenta la innovación en el plan. Separar datos públicos de configuración del propietario.
2. **Cambio de modo y retirada restringidos.** `Frontend/src/app/publication/edit.tsx:130` y `saveConfig` bloquean quitar una oferta configurada y pasar de SCHEDULED a MANUAL. El plan permite cambiar entre modos mientras la publicación está activa y describe control sobre desactivar la configuración. La retirada backend tampoco está definida en el DTO actual. Resolver la regla compartida y probar reprogramación/invalidación de trabajos.
3. **Precio mínimo igual al normal permitido.** `PublicationsService.validate` rechaza solo `.gt(...)`, y el formulario también compara con `>`; por tanto admiten igualdad. El plan exige precio mínimo menor al normal. Requiere validación estricta en ambas capas.

### Orden recomendado para el cierre

1. Reconciliar el alcance interno con el plan entregado: filtro obligatorio, contacto LIVE previo, control y confidencialidad de configuración de ofertas; registrar la prioridad definitiva de moderación.
2. Implementar los faltantes acordados con AC→T→EV y corregir el error de tipado de la prueba de perfil. Mantener abierta la aceptación pendiente.
3. Verificar ambos roles en dispositivos contra API/PostgreSQL/Redis/Socket.io: foto, reserva, cancelación, entrega, cierre con reservas previas, oferta manual/programada, WhatsApp y reconexión. Registrar evidencia por criterio.
4. Completar la distribución requerida para la entrega y la validación de usuarios definida en docs07; distinguir una demostración local del piloto publicado.

No se marcaron nuevas tareas como completadas ni se reescribió evidencia histórica.

## Nueva publicación con foto protagonista — 2026-11-10

[0036](../specs/0036-diseno-nueva-publicacion/verification.md) refina la ruta compartida crear/editar con foto amplia, secciones abiertas y selectores reconocibles. Elección visual confirmada por el usuario; mantiene reglas, payloads y validación existente. 105 pruebas, tipos, 38 capturas finales con fotografías visibles y exports Android/iOS PASS; revisión independiente ship auxiliar y cotejo del sistema. No implementa ni cierra el plan 0034; aceptación física separada.

## Rediseño de Mi cuenta — 2026-11-10

[0035](../specs/0035-diseno-mi-cuenta/verification.md) reemplaza la tarjeta envolvente y el gran botón rojo de 0033 por identidad abierta con iniciales/nombre reales, contacto agrupado y cierre discreto. Editor, correo fijo, sesión y API conservados; campos/editor bloqueados también durante logout. Estados propios de carga/error y encabezado desplazable. Tipos, 105 pruebas, 29 capturas y exports Android/iOS PASS; revisión independiente ship auxiliar, aceptación física separada.

## Edición de nombre y teléfono aprobada — 2026-11-10

[0033](../specs/0033-edicion-mi-cuenta/verification.md) amplía explícitamente RF-02 y la cuenta en lectura de 0026: editor propio, correo institucional fijo, validación/guardado seguro y contacto vigente tras nuevas consultas. Sustituye las exclusiones históricas de edición de nombre/teléfono; correo/contraseña, reputación y push conservan su alcance separado. 103 pruebas frontend/26 backend, tipos/build/lint, 15 capturas auxiliares y bundles Android/iOS PASS; revisión independiente ship auxiliar y cotejo documental completados. Sin migración, escritura en cuentas reales ni reinicio del proceso API; aceptación física separada.

## Plan de errores visibles en Nueva publicación — 2026-11-10

[0034](../specs/0034-errores-formulario-publicacion/plan.md) documenta el aviso global al final del ScrollView y la cobertura parcial de mensajes/foco por campo en `publication/edit.tsx`. Propone aviso visible bajo el encabezado, mensajes específicos y navegación al primer error, con recuperación por origen y borrador conservado. Estado Planificado por petición del usuario; sin modificar implementación ni cerrar TASKS 5.4.

## Mis reservas con prioridad de recogida — 2026-11-10

[0032](../specs/0032-diseno-mis-reservas/verification.md) refina el módulo del comprador con Por recoger/Anteriores, foto y precio reservado destacados, plazo sereno y estados distintos. Sustituye en esa pantalla la composición de 0023; vendedor y detalle la conservan. 100 pruebas frontend, tipos, 22 capturas auxiliares y bundles Android/iOS PASS; revisión independiente ship solo para composición auxiliar. Sin cambios a API, datos ni reglas; aceptación física y TASKS 5.3 siguen separados.

## Estilo fotográfico aprobado — 2026-11-09

[0031](../specs/0031-estilo-marketplace/verification.md) reemplaza el fondo beige y las filas anteriores por superficies casi blancas y tarjetas fotográficas adaptables, según referencia Oakory y autorización explícita del usuario. Mantiene verde UABC, Inter, ofertas naranjas y navegación/contratos. Esta decisión resuelve la discrepancia con la composición histórica 0019/0020; docs04 y PRODUCT.md reflejan la nueva autoridad. Capturas Chrome son evidencia auxiliar; aceptación física sigue separada.

## Oferta como término visible — 2026-11-09

[0030](../specs/0030-textos-oferta/verification.md) sustituye Ganga por Oferta en comprador y vendedor, incluye validación y confirmaciones; adapta mensajes heredados del servidor y renombra solo los tres títulos Demo exactos de 0027. Mantiene naranja, ahorro y contratos internos. La evidencia histórica usa el vocabulario de su fecha; no se reescribe para aparentar nuevas pruebas.

## Presentación de gangas — 2026-11-09

[0029](../specs/0029-presentacion-gangas/verification.md) aplica la propuesta ui-ux-pro-max aprobada: actual/anterior tachado/ahorro en feed, detalle y ventas; etiqueta con icono y superficies naranja. Sustituye la presentación dispersa de «Antes» debajo del stock y el orden invertido en detalle/ventas. Sin cambio a activación, inventario o precio fijado de reservas. Evidencia y límites en el expediente; no cierra UAT de 0006.

## Pestañas principales sin apilamiento — 2026-11-09

[0028](../specs/0028-tabs-sin-pila/verification.md) corrige el modelo de navegación de 0026: la barra ya usaba navigate, pero sus destinos eran pantallas Stack. Ahora pertenecen a Tabs protegidas; detalles/formularios conservan pila y retornan con dismissTo sin crear otro grupo. Estado local y URLs conservados; Atrás desde pestañas vuelve a Explorar. 14 pruebas de navegación, 84 frontend en total, tipos, bundles Android/iOS y check-sdd PASS. Sin nueva evidencia física ni cierre de 5.1–5.6.

## Mi cuenta y gangas locales — 2026-11-09

[0026](../specs/0026-navegacion-y-mi-cuenta/verification.md) sustituye la hoja de 0024 por la cuarta pestaña Cuenta con datos registrados. Selección suavizada según petición, fondo verde al 12 % y texto/icono verde oscuro (6.20:1); icono person-outline instalado. La UI no expone Cannot GET /auth/me y recupera con Reintentar. API actual arrancada: perfil 200 en loopback y ruta LAN 401 anónima. 77 pruebas frontend/13 backend, 54 capturas, tipos/build/lint y bundles iOS/Android PASS. No se declara reproducido/resuelto en el iPhone hasta confirmación física; la causa histórica exacta del 404 no se pudo verificar.

[0027](../specs/0027-gangas-demo/verification.md) agrega tres gangas Demo locales, fotos existentes y descuentos reales en fixtures: seed 3→0, hashes de datos previos intactos, GET feed/fotos 200. Sin cambios de inventario previo ni nuevas funciones. Aceptación de fase 5 y despliegue siguen abiertos.

## Búsqueda incorporada al alcance e implementada — 2026-11-06

El usuario identifica la ausencia de barra como crucial y solicita resolverla. RF-05c/US-05c ampliados en [0025](../specs/0025-busqueda-publicaciones/verification.md): búsqueda servidor por título/descripción, combinada con tipo/zona/categoría, con barra visible, limpiar, pausa de escritura y recuperación. 66 pruebas frontend, 12 backend, tipos/build/lint/exports, GET reales y 51 capturas aprobados. API actualizada sin modificar datos. La revisión anterior que indicaba ausencia de buscador corresponde al estado previo a esta petición; ya no es un faltante de implementación. Teclado/lector y aceptación física siguen separados.

## Revisión de alcance y pendientes reales — 2026-11-06

Revisión de requisitos RF/RNF, historias, TASKS, expedientes y código actual (no solo casillas). No se modificó funcionalidad ni se repitieron operaciones de reservas/pruebas de estrés. `node scripts/check-sdd.mjs` PASS; los resultados funcionales citados son evidencia existente, no una nueva ejecución completa de QA.

| Área | Estado observado | Pendiente real |
| --- | --- | --- |
| MVP obligatorio | Hay código para registro/login/sesión, LIVE/STATIC con fotos, filtros de zona/categoría, reservas independientes de 20 minutos/precio fijado, cancelación/entrega, venta física, ganga manual/programada, eventos/reconexión y WhatsApp condicionado. No se detectó otro módulo MUST completamente ausente en esta revisión. | Aceptación integrada móvil de 5.1–5.6; no declarar MVP terminado solo por existencia de código. |
| Validación móvil | Registro y apertura/Volver del modal cuentan con confirmaciones puntuales del usuario. Automatización reciente: frontend 62 pruebas, backend 10, exportaciones móviles y capturas auxiliares. | Recorridos comprador/vendedor completos contra servicios reales, cámara/galería/permisos, WhatsApp en teléfono, dos dispositivos/reconexión, VoiceOver/texto ampliado y piloto UAT de docs07. |
| Reportes/moderación | RF-14 SHOULD no implementado: hay modelo Report/flag, pero no módulo/rutas ni interfaz de reporte/revisión. | Si se incluye: cerrar 0009 DEC-01/02, unicidad de reportantes, conteo/ocultamiento y revisión. Opcional; no convertirlo en bloqueo MUST. |
| Aviso y términos del registro | register.tsx exige marcar aceptación, pero el texto solo alterna el checkbox. No se encontró enlace/pantalla/recurso del proyecto para consultar esos documentos. | Completar acceso a los textos suministrados/aprobados por el responsable; no inventar su contenido. Es una terminación pendiente de la UI existente, no una conclusión legal. |
| Producción/distribución | TASKS 6.2/6.3 abiertos. No se encontró eas.json, APK/AAB/IPA ni evidencia de despliegue final en el repositorio. app.json conserva nombre AM_PF_Meza_376163 y no declara package/bundleIdentifier. | Configurar entorno público persistente y build/distribución; ajustar identidad e identificadores del paquete. Exportar JS para iOS/Android no equivale a entregar app instalable. |
| Alcance adicional | Feed implementa filtros, no búsqueda por texto. Perfil editable, reputación y push están fuera de los RF/RNF actuales; chat propio, pagos y GPS tampoco son módulos pendientes del MVP aprobado. | Acordar requisitos nuevos si se desean; no agregarlos silenciosamente al backlog obligatorio. |

Las tareas 5.1–5.6 y algunas T de 0001–0008 mezclan implementación e integración/aceptación: que sigan abiertas no significa que falten sus pantallas o endpoints. Mantenerlas abiertas hasta adjuntar evidencia reproducible. Prioridad: cerrar pruebas de ambos roles y la consulta de documentos del registro; después preparar entrega y despliegue. La moderación se decide aparte. Esta revisión no certifica ausencia de todos los bugs ni sustituye el piloto de usuarios.

## Sesión separada de Mis ventas — 2026-11-06

Refinamiento solicitado con Impeccable y ui-ux-pro-max en 0024 EV-04: foco/retorno de hoja, anuncios, 48 dp Android y movimiento reducido. 62 pruebas, tipos, exports y 47 capturas incluyendo 375/horizontal aprobados. Sin cambio de autenticación o sesión real; aceptación física de lector/foco pendiente.

[0024](../specs/0024-menu-cuenta/verification.md) corrige logout dentro del listado de ventas. Cuenta aparece consistentemente en los tres encabezados y abre la hoja de sesión. Sin nuevas pestañas o funciones de perfil, AuthContext/guardas conservados. 61 pruebas, tipos, 45 capturas, exports móviles y convergencia aprobados. Sin cierre de sesión real del usuario ni aceptación física afirmada.

## Foto del producto en reservas — 2026-11-06

[0023](../specs/0023-fotos-en-reservas/verification.md) corrige que las reservas solo mostraban texto: añade publicationImageUrl a proyecciones autorizadas y miniatura compartida con alternativa al fallo, sin consultas al detalle público. 56 pruebas frontend, 10 backend, tipos/build/lint, 40 capturas y exportaciones móviles aprobados. Serializer/DB reales e imagen HTTP 200 verificados en solo lectura; API reiniciada para iPhone. La confirmación física de la foto sigue pendiente, sin afirmar cierre de 5.3.

## Confirmación de apartado pendiente — 2026-11-06

[0022](../specs/0022-confirmacion-apartado/verification.md) incorpora ConfirmationDialog antes del POST en primer apartado y otra unidad, conservando privacidad, 20 minutos e idempotencia. 54 pruebas, tipos, 38 capturas y exportaciones móviles aprobados. El usuario confirma apertura y Volver sin crear reserva en iPhone. VoiceOver, texto ampliado y retorno de foco nativos pendientes; la feature sigue en verificación.

## Pulido con Impeccable aplicado al código — 2026-11-06

[0021](../specs/0021-impeccable-init-critique-polish/verification.md): contexto confirmado para comprador/vendedor con igual prioridad. Crítica provisional 27/40 de código y evidencia auxiliar, sin acreditación de hardware. Corregidos en React Native el campo inválido fuera de vista (foco/desplazamiento y borrador conservado) y la alternativa de foto fallida/ausente compartida entre listado/detalle. Tipos, 44 pruebas, exportaciones Android/iOS y 33 capturas web a 320/390/430 puntos aprobados; convergencia documental y check-sdd aprobados. Sin nuevas ediciones Figma. Teclado, lector de pantalla y aceptación integrada siguen pendientes en dispositivo; 5.1–5.6 permanecen abiertas.

## Aplicación de las copias revisadas a Expo — 2026-11-05

[0020](../specs/0020-aplicacion-prototipo-revisado/verification.md) aplica 0017/0018/0019: SVG locales en navegación, selector explícito Con horario/Catálogo, encabezados compactos, tarjetas uniformes y errores por campo con bloqueo durante envío. Servicios, contratos, privacidad y reglas de reservas conservados. Tipos, 43 pruebas y exportaciones Android/iOS aprobados; 31 capturas web a 320/390/430 puntos sin desbordamiento horizontal, excepciones ni recursos faltantes. La ejecución de cámara/teclado/WhatsApp y la aceptación integrada en teléfono siguen separadas; 5.1–5.6 conservan su estado.

## Auditoría UX Figma sobre copias — 2026-11-05

[0019](../specs/0019-auditoria-ux-figma/verification.md) conserva las tres páginas originales y aplica correcciones a copias identificadas con «Revisión UX 05 nov». Revisión de 47 pantallas, ocho estados de formulario añadidos, tarjetas/campos/barra inferior reutilizables y contenido adaptable. Auditoría: 416 destinos internos válidos, cero controles conectados menores de 44 puntos, componentes independientes de originales, solo Inter. Muestras de 320/430 puntos revisadas. Verificación de diseño/estructura; no acredita reproductor completo, WhatsApp, cámara, selectores nativos o API. Expo conserva su estado anterior.

## Implementación del prototipo — 2026-11-04

[0016](../specs/0016-implementacion-figma/verification.md) aplica el diseño aprobado a las pantallas Expo conservando servicios, JWT, privacidad y reservas. Fuente visual alineada en docs04, Inter local, navegación inferior, selector/FAB por tipo, filtros con borrador/aplicación, cuatro estados y protección contra respuestas antiguas. Formularios incluyen descripción, elección de horario nativa y ganga; ventas muestran reservas por unidad y respetan cierre/vencimiento.

Se añadió price_before_ganga nullable, capturado bajo bloqueo al activar, con respaldo anterior y migración local aditiva. Datos históricos sin procedencia quedan NULL. Prisma al día; integración aislada de 311 solicitudes/16 grupos PASS, 40 pruebas frontend, 9 backend, tsc/lint, 18 capturas y bundles iOS/Android aprobados. Los 24 productos y dos reservas originales se conservaron. La prueba física de teclado/cámara/WhatsApp en iPhone no se realizó; 5.1–5.6 mantienen su aceptación integrada.

## Prototipo UX — 2026-11-04

[0015](../specs/0015-mejoras-prototipo-ux/verification.md) verifica ocho mejoras autorizadas en Figma: descripciones y desplazamiento, acciones por estado, catálogos reales, relojes diferenciados, reservas independientes, configuración de ganga/precios fijos, gestión de artículos y estados con navegación. Evidencia estructural y capturas revisadas; no sustituye implementación Expo ni UAT. TASKS 5.7 completa; 5.1–5.6 conservan su aceptación móvil.

Fecha de corte: 2026-10-05; se conserva la evidencia histórica del 2026-10-01/04. Esta auditoría distingue **documentado**, **implementado** y **verificado**. Una referencia a código prueba que existe una pieza, no que el flujo completo funciona. Los hallazgos abiertos se convierten en decisiones o tareas antes de declarar listo el feature afectado.

## Migración Expo SDK 58 — 2026-11-03

0013 actualiza Expo 58.0.23, React 19.3.0, React Native 0.88.1, Router 58.0.30 y Jest 30.5.2 con el mapa oficial. Se corrigieron cuatro incompatibilidades de tipos (StatusBar y ListEmptyComponent). Instalación limpia sin peers forzados, expo install --check, Doctor 20/20, tsc, 32 pruebas y exportación Android/iOS/web aprobados. TASKS 4.4 cerrada; compilación y ejecución nativa siguen en fase 5/6.3.

## Estado de adopción

Corrección móvil 2026-11-03 (0014): Expo Go abre por túnel, pero la API seguía configurada con IP LAN y Axios sin timeout. Se configuró un túnel temporal adicional para API e imágenes, se acotó la espera a 15 segundos y se resolvieron URLs de uploads en el origen actual sin mutar la BD. LIVE/STATIC/PNG/Socket.io HTTPS y 35 pruebas aprobados; el usuario confirmó productos visibles en iPhone (EV-04). Esto cierra 0014 y conserva la aceptación restante de fase 5.2.

| Elemento del proceso | Antes de esta revisión | Estado documental actual |
| --- | --- | --- |
| Visión, requisitos, arquitectura, UX, flujos, historias y QA | Presentes en `docs/01` a `docs/07` | Conservados como fuentes de dominio. |
| Constitución y reglas de cambio | No formalizadas | `.specify/memory/constitution.md`. |
| Ciclo con puertas de calidad | No formalizado | `docs/08_DEVELOPMENT_WORKFLOW.md`. |
| Especificación, plan, tareas y evidencia por feature | No existían | Plantillas y ocho expedientes `specs/0001`–`0008` cubren todos los RF/RNF MUST; `0009` documenta el SHOULD de reportes. Las decisiones del MVP están resueltas. |
| Trazabilidad y convergencia | Solo listas generales | IDs `RF/RNF/US → AC → T → EV`, índice y comprobador `scripts/check-sdd.mjs`. |
| Cobertura global de requisitos | No había matriz completa | `docs/10_TRACEABILITY.md` registra todos los RF/RNF y evidencia faltante. |

**Esto completa la infraestructura documental del método. No implica que el MVP esté implementado ni verificado.**

## Hallazgos de producto y contratos

| ID | Evidencia | Consecuencia / decisión necesaria | Estado |
| --- | --- | --- | --- |
| GAP-01 | Al inicio, `README.md` permitía contacto de venta en vivo antes de reservar; RF-07 lo exige después. README ya describía contacto directo para `STATIC`. | Se sincronizaron RF-06/RF-13, arquitectura, flujo estático y 0008: `LIVE` tras reserva; `STATIC` directo sin reserva. | Resuelto documentalmente. |
| GAP-02 | El resumen del README y la matriz de `docs/02_REQUIREMENTS.md` contradecían las etiquetas `MUST/SHOULD` de los requisitos individuales. | Se alinearon resumen y matriz con las etiquetas existentes; cualquier cambio futuro de prioridad requiere modificar el RF/RNF. | Resuelto documentalmente. |
| GAP-03 | RF-06 dice «Vendido» y `PublicationStatus` solo tiene `FINISHED`. | STATIC ACTIVE → FINISHED por sold, con propiedad y transición concurrente única. | Resuelto/verificado backend 0004 EV-06; UI pendiente. |
| GAP-04 | RF-14 exige tres denunciantes distintos y `Report` no tiene unicidad `(reporter_id, publication_id)`. | Arquitectura y `TASKS.md` 6.4 registran restricción/migración para el SHOULD antes de activarlo. | Diseño resuelto; código pendiente si se incluye. |
| GAP-05 | Arquitectura/esquema usan User/UUID; auth/usuarios de la línea base usaban prisma.usuario y campos españoles. | Backend y guards/CurrentUser comprobados, registro/login/JWT sobre PostgreSQL aislado. | Resuelto/verificado backend 0002 EV-08; cliente móvil pendiente. |
| GAP-06 | `docs/03_ARCHITECTURE.md` usa `stock_updated`; `RNF-02` decía `stock_actualizado`. | Se usa `stock_updated`, según el diccionario explícito de eventos de arquitectura. | Resuelto en requisitos. |
| GAP-07 | `docs/06_USER_STORIES_AND_TASKS.md` decía `/register`, `/login` y `AsyncStorage`; el contrato y el código actuales usan `/auth/*` y `expo-secure-store`. | Se actualizan las referencias de historias/tareas a los contratos observados; la compilación backend sigue pendiente. | Resuelto documentalmente. |
| GAP-08 | Arquitectura exigía cinco zonas; seed previo insertaba siete y alias distintos. | Seed transaccional exacto, alias/remapeos y referencias comprobados en 0010 EV-05 / 0005 EV-05. | Resuelto y verificado en PostgreSQL local y fixtures. |
| GAP-09 | TASKS marcaba infraestructura completa sin evidencia en la línea base. | Ahora 1.1–1.4 se cierran con 0010 EV-01..05, resumen reproducible y respaldo/restore. | Resuelto y verificado el 2026-10-04. |
| GAP-10 | RF-04 oculta stock cero y RF-09 lo devuelve; README dice que vuelve al feed. | RF-04/RF-09 y 0001/0003 fijan retorno si sigue `ACTIVE` y dentro de horario; `FINISHED` no se reactiva. | Resuelto documentalmente. |
| GAP-11 | README listaba filtro de palabras clave como indispensable, pero no existe RF. | Se aclaró como idea fuera del MVP comprometido; necesita requisito si se decide incluir. | Fuera de alcance MUST actual. |
| GAP-12 | La migración 20260929232323_sdd_architecture conserva DROP TABLE; estaba aplicada localmente desde 2026-09-29. | Mantener checksum; ruta complementaria segura con archivo íntegro, UUID y precios con procedencia; respaldo real y ensayo antiguo poblado aprobados en 0010 EV-04. | Resuelto para fase 1 local; otros entornos requieren inventario/respaldo/ensayo propios. |
| GAP-13 | Seed previo tenía errores de imports .ts/tipos pg y ejecución no comprobada. | Imports sin extensión, adapter directo, generador CommonJS y ts-node local; tsc y seed repetido aprobados. | Resuelto, 0010 EV-01/05. |
| GAP-14 | Faltaba plantilla de entorno y prueba funcional de conexión. | Plantilla con CORS_ORIGINS; PostgreSQL/Prisma conectaron realmente. | Resuelto para fase 1, 0010 EV-02. Redis verificado en fase 3, 0001 EV-06. |
| GAP-15 | Stock no negativo carecía de CHECK. | Migración aditiva y SQLSTATE 23514 para stock -1; NULL en STATIC válido. | Resuelto y verificado, 0010 EV-03. |
| GAP-16 | README tenía nombres/estados españoles, `stockReservado` y categorías «Otros» ausentes del modelo actual. | Resumen de modelo y categorías alineado a arquitectura/esquema; el comportamiento de negocio se conserva en requisitos. | Resuelto documentalmente. |
| GAP-17 | Reservation carecía de precio e idempotencia. | Columnas NOT NULL, Decimal(10,2), UUID, unicidad comprador/clave e índice de fecha migrados; precios históricos solo con evidencia, múltiples reservas permitidas. | Esquema verificado, 0010 EV-03/04 y 0001 EV-10; API/reintentos verificados en 0001 EV-01/02/09. |
| GAP-18 | Las reglas de reserva repetida, fin horario y formato de teléfono no tenían respuesta única. | Decisiones del usuario del 2026-10-01 incorporadas a RF-02/04/07/08/12/13, expedientes y trazabilidad. | Backend verificado en 0001/0006/0008; móvil pendiente. |
| GAP-19 | RF-14 tenía historia y tarea global, pero ningún criterio `AC` ni evidencia `EV` en la trazabilidad. | Se creó 0009 con AC/T/EV planificados. El flujo de revisión del moderador y la validez de reportes requieren DEC-01/02 si se incluye este SHOULD. | Cobertura documental creada; decisión opcional pendiente. |
| GAP-20 | El 2026-10-19, las vistas móviles de comprador, detalle y vendedor muestran UUID de reserva y enums como `ACTIVE`; Mis Ventas también expone ID, tipo y estado técnicos de publicación. | 0001 AC-11..13/DEC-04..05/T-12/13 → EV-12/13: etiquetas y fechas en español, referencias por unidad y acciones con ID interno. | Corregido y probado en Jest; EV-14/recorrido en dispositivo pendiente. |

## Revisión backend fase 2 — 2026-10-05

Git inicial limpio; se conservaron historial/migraciones y catálogos de fase 1. Contenedor PostgreSQL local existente iniciado. Inventario/status/diff confirman cuatro migraciones, CHECK stock, cinco zonas/ocho categorías y cero filas de negocio en original. Fase 2 completa: auth Passport JWT/guard/CurrentUser; uploads autenticado/estático; creación y edición estricta LIVE/STATIC; listado/detalle con filtros AND y privacidad; sold STATIC y physical-sale LIVE bajo bloqueo de fila; endpoints de catálogos. No DELETE. Configuración ganga se valida/guarda como dependencia mínima; no activa ni encola.

Build, tsc, lint, 5 suites/9 unitarias, 1 E2E existente y suite HTTP/SQL `npm run test:phase2` aprobaron con salida 0. Prisma status/diff sin diferencias y SDD correcto. [0003 verification](../specs/0003-publicaciones-en-vivo/verification.md) registra comandos/entorno/incidencias y [phase2.json](../specs/0003-publicaciones-en-vivo/evidence/phase2.json) diez grupos PASS. BD aislada nueva con migraciones y seed existente ejecutado dos veces; hashes/recuentos de original idénticos antes/después. 25 ventas físicas concurrentes sobre última pieza: 1×200/24×409, stock cero y reservas intactas. sold concurrente: 200/409. Bloqueo SQL compartido con edición/venta física probado; carrera HTTP con reservas permanece pendiente de fase 3.

2.1–2.7 cerradas con 0002 EV-08, 0003 EV-08..10, 0004 EV-06 y 0005 EV-06. Los expedientes 0002–0005 permanecen En implementación por móvil, eventos, expiración persistente y reservas; no se declara el MVP ni esos expedientes Verificados completos. No hay bloqueo de fase 2 en entorno local. npm advirtió engines del CLI bajo Node 24.13, sin fallo de build/pruebas; no se cambiaron versiones del lock. Ejecutor corregido tras timeout en frío y doble espera de cierre, ejecución final salida 0.

Tras aquel corte seguía fase 3, ya verificada en la revisión siguiente; pantallas/Linking corresponden a fases 4–5.

## Evidencia histórica de la revisión del 2026-10-01

- `npm run build` en `Backend/` (revisión inicial): **falló** por tres referencias a `prisma.usuario` ausentes en el cliente generado.
- `npx tsc --noEmit --incremental false` en `Backend/` (esta revisión): **falló** por esos tres TS2339 y tres errores del seed (dos TS5097 y un TS7016).
- `npx tsc --noEmit` en `Frontend/`: **aprobó**. Esto solo comprueba tipos, no comportamiento móvil.
- No se ejecutaron migraciones, seed ni pruebas contra una base de datos real. Ningún `EV` de los expedientes se considera aprobado.
- Se inspeccionaron el esquema Prisma, auth, cliente HTTP, flujo de registro e inicio de sesión y documentación. La presencia de módulos/pantallas se registra como **implementación parcial**.

## Revisión frontend fase 4 — 2026-10-13

Se corrigió la redirección global que sacaba al usuario de registro y podía reemplazar rutas repetidamente. Expo Router SDK 57 usa guardas para login/registro/home y `index` como ancla tras hidratar SecureStore. `theme.js` se movió fuera de `src/app` porque la primera exportación lo exponía como `/styles/theme`; la exportación final contiene solo las cuatro rutas de pantalla y rutas internas de Expo. Los tres componentes compartidos se aplicaron a autenticación y la tarjeta de muestra.

`Frontend` tsc y 2 suites/9 pruebas aprobaron; `Backend` build y prueba Axios con `ReservationsController`/`JwtAuthGuard` reales en memoria aprobaron Bearer presente/ausente y 401. No se inició la app ni el backend ni se ocuparon puertos por indicación del usuario. 4.1–4.3 están verificadas en 0011 EV-01..04 y 0002 EV-09. El recorrido manual en dispositivo y la integración de formularios completos con BD son alcance de 5.1.

## Avance frontend fase 5 — 2026-10-13

Git estaba limpio antes de editar. Se detectaron dos contratos ausentes para completar Mis Ventas y reservas tras agotarse el stock: `GET /publications/mine` autenticado y `publicationTitle` en respuestas autorizadas de reserva. Se actualizaron 0003 y 0001 (spec → plan → tasks) y arquitectura antes del código. El backend ahora entrega publicaciones propias incluidas FINISHED y título de reserva sin exponer teléfono en el feed. `Backend/npm run test:phase5-contracts` comprobó JWT de dos vendedores, 401 anónimo, estado terminal y proyección de reserva en Nest en memoria.

Se reemplazó el feed de muestra por consultas API con filtros, `FlatList` y Socket.io; se añadieron detalle/reservas independientes, formulario ImagePicker, Mis Ventas y WhatsApp condicionado. `Frontend/npx tsc --noEmit`, exportación web Expo Router y 8 suites/25 pruebas pasaron; `Backend/npm run build` pasó. El estudio real de cámara, permisos, navegación y enlace WhatsApp en Android/iOS, así como los flujos completos contra PostgreSQL/Redis/Socket.io, no se ejecutó. Sigue vigente la instrucción previa de no iniciar app/backend ni usar puertos de aplicación; no se marcan 5.1–5.6 como terminadas. EV-11/10/11/07/07/07/06/06 de 0001–0008 separan evidencia simulada de la pendiente.

## Orden recomendado para cerrar la deuda

Actualización 2026-10-04: fase 1 implementada y verificada. Build, tsc, validate/status/diff, seed doble, 9 pruebas unitarias, 1 E2E y ensayo integral de infraestructura aprobaron. Inventario real: 7→5 zonas, 8 categorías reconciliadas, 3→4 migraciones y cero filas de negocio antes/después. Respaldo real restaurado con hashes idénticos; fixtures antiguos/modernos migrados y recuperados sin deducir precios. Detalles en [0010 verification](../specs/0010-infraestructura-y-base-de-datos/verification.md). Los criterios HTTP/móviles de reservas y catálogos conservan su verificación pendiente.

La recomendación histórica del 2026-10-04 era completar guards y endpoints/filtros; ya se verificaron en fase 2. Cliente móvil sigue pendiente. La secuencia inicial siguiente se conserva como referencia histórica, con fases 1/2 comprobadas.

1. Inspeccionar datos existentes antes de migraciones y seed; resolver GAP-12/13/15 y la migración planificada de GAP-17 durante implementación. GAP-14 solo requiere comprobar ejecución.
2. Corregir contrato de autenticación según 0002 y verificar compilación/integración; después implementar catálogos, publicaciones, reservas, ganga, eventos y contacto según dependencias.
3. Repetir convergencia por feature, registrar `EV` reales y actualizar esta auditoría con fecha y pruebas.

## Ampliación de publicaciones de demostración — 2026-11-03

0012 se reabrió y cerró para pasar de ocho a veinticuatro ejemplos. Los dieciséis nuevos tienen descripciones, precios, ubicaciones y fotografías ilustrativas por producto; los ocho UUID históricos se conservan. Docker Desktop se inició tras comprobar que estaba detenido. `verify-demo-seed.cjs`, tsc, build, lint, Prisma validate y check-sdd aprobaron. En PostgreSQL local, el seed creó 16 filas y luego 0; SQL confirmó 12 LIVE/12 STATIC y dos nuevas por categoría. Nest en memoria mostró los ocho LIVE y ocho STATIC nuevos en el feed y sirvió un PNG por HTTP 200. Usuarios, reservas y catálogos conservaron sus hashes. EV-04..07 y TASKS 1.5 quedan cerradas; el dispositivo móvil sigue en fase 5.

## Decisiones de producto cerradas

1. **Precio:** se fija al reservar; ganga o edición posterior solo afectan nuevas reservas (0001 DEC-02; 0006 DEC-01).
2. **Reservas repetidas:** un comprador puede tener varias reservas activas de la misma publicación. Reintentar con la misma clave devuelve la existente sin nuevo descuento (0001 DEC-03).
3. **Fin del horario:** el vendedor puede confirmar la reserva previa durante sus propios 20 minutos; no se aceptan nuevas (0003 DEC-02).
4. **Teléfonos:** se aceptan diez dígitos mexicanos con o sin `+52`, de cualquier región; se guardan en formato `+52XXXXXXXXXX` (0002 DEC-03; 0008 DEC-01).

No quedan decisiones de negocio imprescindibles abiertas en los ocho expedientes `MUST`. En 0009 siguen abiertas dos decisiones opcionales sobre moderación; no bloquean el MVP. Permanecen dependencias técnicas y pruebas sin ejecutar.

## Revisión backend fase 3 — 2026-10-05

Git inicial limpio. Fases 1/2 revalidadas: cuatro migraciones/diff vacío, seed doble/catálogos 5/8 y auth/JWT/uploads/publicaciones/permisos/stock reales con test:phase2. Original intacta. Dependencia mínima resuelta: Redis 7.4.11 volumen/AOF/noeviction y paquetes BullMQ/Socket.io, sin migraciones nuevas.

Reservas JWT/consultas/precio fijo/20 min/idempotencia, transacciones SELECT FOR UPDATE, confirmación vendedor/cancelación comprador, fin persistente/cierre, tres workers/conciliación, gateway sin contactos y ganga manual/programada/reprogramada/prioridad REST implementados. Jobs releen BD; eventos tras commit, sin doble transición/stock.

Build/tsc/lint, 9 unitarias/1 E2E, fase 2, fase 3 y check-sdd aprobados. [0001 verification](../specs/0001-reservas/verification.md) y [phase3.json](../specs/0001-reservas/evidence/phase3.json): 311 HTTP/16 PASS; 50 claves distintas 1×201/49×409, misma clave 1×201/49×200/un ID; carreras de resolución/venta, worker detenido/reiniciado con Redis persistente, jobs perdidos/duplicados, fin/ganga/dos clientes/reconexión+REST. Aceleración solo de timestamps de fixtures, plazo de producción fijo.

3.1–3.6 y 6.1 completos con AC→T→EV. Móvil/Linking/UAT siguen pendientes; sin bloqueo backend local, MVP completo no declarado. Incidencias de verificador (Queue.client ausente, pg UTC e imagen tras nuevo puerto) corregidas antes del ensayo final. Advertencias engines CLI Node 24.13 sin fallar. Se retomó convergencia tras interrupción del turno; phase3.json confirmó PASS.
