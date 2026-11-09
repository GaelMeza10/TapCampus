# Matriz de trazabilidad de TapCampus

Búsqueda 2026-11-06: [0025](../specs/0025-busqueda-publicaciones/verification.md), RF-05c/RNF-03 → US-05c → AC-01..05 → T-01..05 → EV-01..05 (TASKS 5.18). Texto servidor y filtros AND, 66 pruebas frontend/12 backend, 51 capturas, GET real y exports aprobados. Aceptación física de 5.2 separada.

Ampliación de calidad 0024: AC-03 → T-04 → EV-04, revisión Impeccable/ui-ux-pro-max con foco, anuncios, objetivos Android y movimiento reducido; 62 pruebas/47 capturas/exports aprobados. La comprobación web de foco no sustituye la nativa.

Gestión de sesión 2026-11-06: [0024](../specs/0024-menu-cuenta/verification.md), RF-01/02 → US-01/02 → AC-01..03 → T-01..03 → EV-01..03 (TASKS 5.17). Logout reubicado a Cuenta global; 61 pruebas, tipos, 45 capturas, bundles móviles y convergencia PASS. Aceptación física por separado.

Fotos en reservas 2026-11-06: [0023](../specs/0023-fotos-en-reservas/verification.md), RF-07/13 → US-06/09 → AC-01..03 → T-01..03 → EV-01..03 (TASKS 5.16). Proyección autorizada aditiva y miniatura; pruebas técnicas, capturas auxiliares y datos existentes verificados. Confirmación física pendiente, sin cerrar aceptación integrada de 5.3.

Confirmación de apartado 2026-11-06: [0022](../specs/0022-confirmacion-apartado/verification.md), RF-07/13 y RNF-01/02 → US-06/09 → AC-01..05 → T-01..06 → EV-01..06 (TASKS 5.15). Modal implementado, 54 pruebas, tipos, 38 capturas y bundles móviles aprobados; usuario confirma apertura/Volver en iPhone. AC-05 nativo específico pendiente; no se modifica evidencia histórica de 0001.

Pulido en código 2026-11-06: [0021](../specs/0021-impeccable-init-critique-polish/verification.md), RF-03/05c/06/07/08/13 → US-03/04/05c/06/07/09/11 → AC-01..04 → T-01..04 → EV-01..04 (TASKS 5.14). Contexto y crítica, recuperación de campos inválidos y alternativa compartida de fotografía; 44 pruebas, tipos, 33 capturas auxiliares y exportaciones Android/iOS. Convergencia documental y check-sdd aprobados. No acredita teclado/foco nativos ni cierra la aceptación integrada de 5.1–5.6.

Aplicación del prototipo 2026-11-05: [0020](../specs/0020-aplicacion-prototipo-revisado/verification.md), RF-01/02/03/05c/06/07/08/11/12/13 y RNF-03 → US-01/02/03/04/05/05c/06/07/09/11 → AC-01..04 → T-01..04 → EV-01..04. Navegación, tarjetas, encabezados y formularios aplicados a Expo; verificación técnica/visual web, sin sustituir aceptación física de 5.1–5.6.

Auditoría de diseño 2026-11-05: [0019](../specs/0019-auditoria-ux-figma/verification.md), RF-04/07/13 y RNF-01 → US-01/02/05c/06/09/11 → AC-01..04 → T-01..04 → EV-01..05. Tres páginas copiadas, 47 pantallas revisadas y ocho estados, componentes compartidos y 416 destinos inspeccionados. Evidencia de diseño/estructura; no sustituye recorrido completo del reproductor ni aceptación móvil de 5.1–5.6.

Fecha: 2026-10-19. Esta matriz cubre **todos los requisitos identificados** en `02_REQUIREMENTS.md`. `TASKS.md` aporta tareas globales; solo `specs/` aporta `AC → T → EV`. Fases 1/2/3 backend y fase 4 arquitectura verificadas; fase 5 implementada con pruebas en memoria, aceptación de dispositivo e integración real pendiente. La presentación de reservas AC-11..13 tiene EV-12/13 automatizadas; EV-14 requiere recorrido móvil.

| Requisito | Historia | Tarea global | Feature / criterio | Evidencia y estado |
| --- | --- | --- | --- | --- |
| RF-01 Registro UABC | US-01 | 1.1–1.3, 2.1, 4.1–4.3, 5.1 | [0002](../specs/0002-autenticacion/spec.md) AC-01/02/03/05/06; [0010](../specs/0010-infraestructura-y-base-de-datos/spec.md) AC-01/02/04; [0011](../specs/0011-arquitectura-visual-movil/spec.md) AC-01/02/03 | 0010 EV-01/02/04 y 0002 EV-08 backend; 0002 EV-09 interceptor/JWT/401 y 0011 EV-01..04 arquitectura móvil aprobados. Formularios completos con backend/BD de 5.1 pendientes. |
| RF-02 Perfil obligatorio | US-01 | 1.3, 2.1, 4.2, 5.1 | 0002 AC-02/03, [0011](../specs/0011-arquitectura-visual-movil/spec.md) AC-02/03, [0008](../specs/0008-contacto-whatsapp/spec.md) AC-05 y 0010 AC-04; teléfono mexicano con o sin +52 | 0010 EV-04 y 0002 EV-08 backend; 0011 EV-02/03 componentes/formulario base aprobados. Registro completo de 5.1 y 0008 Linking pendientes. |
| RF-03 Publicación en vivo | US-03 | 1.3, 2.3, 2.4, 5.4 | [0003](../specs/0003-publicaciones-en-vivo/spec.md) AC-01/02/03/06; 0010 AC-03/04 | 0010 EV-03/04 y 0003 EV-08/09/10 backend aprobadas, T-02/T-03/T-08 completas; UI/temporizador pendientes. |
| RF-04 Expirar por tiempo/stock | US-03, US-08 | 2.4, 3.5, 5.2 | 0003 AC-03/04; [0001](../specs/0001-reservas/spec.md) AC-08 | 0003 T-04/T-09 → EV-04 y 0001 T-05/T-08 → EV-08 aprobadas: fin persistente/evento/reposición vigente; móvil pendiente. |
| RF-05 Cierre anticipado [SHOULD] | US-05d | 5.5 | 0003 AC-07; 0001 AC-07 | 0003 T-09 → EV-07 y 0001 T-04/T-08 → EV-07 aprobadas: cierre conserva reservas; UI pendiente. |
| RF-05b Venta física | US-05b | 2.6, 5.5 | 0003 AC-05/06 | 0003 T-05/T-09 → EV-05/10 aprobadas: carrera HTTP reserva/venta y eventos; UI pendiente. |
| RF-05c Filtros | US-05c | 1.4, 2.5, 2.7, 5.2 | [0005](../specs/0005-catalogos-y-filtros/spec.md) AC-01/02/03/04; 0010 AC-05 | 0005 T-02/T-03/T-06 → EV-06 aprobada HTTP catálogos exactos/filtros AND/errores. 0010 EV-05 seed aprobado; UI AC-04 pendiente. |
| RF-06 Catálogo estático | US-04, US-11 | 2.4, 2.6, 5.2, 5.4, 5.6 | [0004](../specs/0004-catalogo-estatico/spec.md) AC-01/02/03/04/05 | 0004 T-01/T-02/T-03/T-06 → EV-06 aprobada HTTP sin horario/stock, contacto directo y sold concurrente 200/409. Móvil pendiente. |

| RF-07 Reserva temporal | US-06 | 1.3, 3.1, 5.3, 6.1 | 0001 AC-01/02/03/09/11/13; 0008 AC-01; 0010 AC-03/04 (precio, clave y migración) | 0001 T-03/T-08 → EV-01/02/03/09 aprobadas: plazo/precio/JWT/50 claves/varias reservas/retry. 0008 EV-01 privacidad API; 0001 T-12/13 → EV-12/13 presentación probada en Jest; T-14/EV-14 móvil pendiente. |
| RF-08 Confirmar entrega | US-07 | 3.2, 5.5 | 0001 AC-04/12/13; también después de `end_time` dentro de sus 20 minutos | 0001 T-04/T-08 → EV-04 aprobada: vendedor, tras end_time dentro del plazo, terminales/carrera; T-12/13 → EV-12/13 presentación probada en Jest; T-14/EV-14 móvil pendiente. |
| RF-09 Expiración de reserva | US-08 | 1.3, 3.3, 3.4 | 0001 AC-06/08; 0010 AC-03/04 (datos de reserva) | 0001 T-05/T-08 → EV-06/08 aprobadas: Redis/BullMQ, reinicio real, jobs perdidos/duplicados, conciliación/devolución única. |
| RF-10 Cancelación [SHOULD] | US-07b | 3.2, 5.3 | 0001 AC-05/08/11/13 | 0001 T-04/T-08 → EV-05/08 aprobadas: comprador/stock único/feed/carreras; T-12/13 → EV-12/13 presentación probada en Jest; T-14/EV-14 móvil pendiente. |
| RF-11 Configurar ganga | US-05 | 2.4, 3.6, 5.4 | [0006](../specs/0006-precio-ganga/spec.md) AC-01/02/05 | 0006 T-02/T-04/T-07 → EV-01/02/05 aprobadas: configuración/encolado/reprogramación; formulario móvil pendiente. |
| RF-12 Activar ganga | US-05 | 3.5, 3.6, 5.2, 5.5 | 0006 AC-03/04/06; [0007](../specs/0007-tiempo-real/spec.md) AC-03; precio previo inmutable | 0006 T-03/T-04/T-07 → EV-03/04/06 y 0007 T-02/T-05 → EV-03 aprobadas: activación/evento/precio previo fijo; UI pendiente. |
| RF-13 WhatsApp | US-09, US-11 | 5.3, 5.6 | 0008 AC-01/02/03/04/05 | 0008 T-01/T-02/T-05 → EV-01/02/03/05 aprobadas API: LIVE protegido/STATIC directo/comprador activo/normalización; EV-04 URL/Linking pendiente. |
| RF-14 Ocultamiento [SHOULD] | US-10 | 6.4 | [0009](../specs/0009-reportes-y-moderacion/spec.md) AC-01/02/03 | 0009 EV-01/02/03 planificadas; DEC-01/02 abiertas, opcional y sin ejecutar. |
| RNF-01 Concurrencia | US-06, US-05b | 1.2, 1.3, 3.1, 6.1 | 0001 AC-02; 0003 AC-05; 0010 AC-02/03 | 0001 T-03/T-08 → EV-02: 50 claves 1×201/49×409; EV-09 misma clave 1×201/49×200/un ID. 0003 EV-05 carrera HTTP aprobada. |
| RNF-02 Tiempo real | US-03, US-05, US-06 | 3.5, 5.2 | 0007 AC-01/02/03/04/05 | 0007 T-01/T-02/T-05 → EV-01..05 aprobadas gateway: dos clientes/stock/fin/ganga/postcommit/reconexión+REST; móvil pendiente. |
| RNF-03 Sin GPS ni pagos | US-03, US-04, US-05c | Restricción en 2.4, 2.5, 5.2 | 0005 AC-04; alcance de 0001–0008 | 0005 EV-04 planificada; revisión transversal sin ejecutar. |

La [demo 0012](../specs/0012-publicaciones-demo/spec.md) aporta datos locales para recorrer RF-03 y RF-06 en el feed; 0012 EV-01..03 verifica ocho filas, PNG y listados HTTP. No sustituye la aceptación móvil de 0003/0004.

## Cómo mantenerla

La implementación visual de RF-01..13 y RNF-01/02/03 se registra en [0016](../specs/0016-implementacion-figma/spec.md), AC-01..10 → T-01..09 → EV-01..10 (TASKS 5.8). Cubre regresión, ampliación nullable de precio previo, compilación móvil y revisión visual automatizada; no sustituye recorridos físicos de los expedientes originales ni UAT.

Evolución Figma 2026-11-05: [0017](../specs/0017-iconos-navegacion/spec.md) RF-05c/06/07, US-05c/04/06 → AC-01..03 → T-01..03 → EV-01..03 (TASKS 5.9), iconos semánticos en 17 barras. [0018](../specs/0018-selector-mis-ventas/spec.md) RF-03/06/08, US-03/04/07 → AC-01..03 → T-01..03 → EV-01..03 (TASKS 5.10), selector explícito en siete estados de Mis ventas. Ambos verificados solo en prototipo, sin atribuir implementación Expo ni UAT.

La representación visual de RF-03/04/05/05b/05c/06/07/08/11/12/13 y RNF-02/03 se revisó en [0015](../specs/0015-mejoras-prototipo-ux/spec.md), AC-01..08 → T-01..09 → EV-01..09. TASKS 5.7 corresponde solo al prototipo Figma; no reemplaza evidencia móvil/API de los expedientes existentes.

La corrección de conexión móvil para RF-05c/RF-06 y RNF-02 se registra en [0014](../specs/0014-conectividad-movil/spec.md): AC-01..03 → T-01..04 → EV-01..04. Transporte HTTPS y pruebas aprobados; el usuario confirmó productos visibles en iPhone. TASKS 5.2 conserva el resto de la aceptación integrada.

El mantenimiento de compatibilidad de RF-01/RF-02 y US-01/US-02 al migrar el frontend se registra en [0013 Expo SDK 58](../specs/0013-expo-sdk-58/spec.md), TASKS 4.4 y sus AC-01..03; no sustituye la aceptación móvil de fase 5.

### Evidencia adicional de fase 5

RF-01/02 → 0002 AC-01..06/T-04/05/EV-10: formularios y sesión compilados; registro/login real en dispositivo pendiente. RF-03/04/05/05b → 0003 AC-01..08/T-06/07/10/EV-11: `mine` JWT aislado, formulario/feed/Mis Ventas; cámara y API reales pendientes. RF-05c/RNF-03 → 0005 AC-02/04/T-04/05/EV-07: filtros sin GPS simulados. RF-06 → 0004 AC-01..04/T-04/05/EV-07: STATIC UI implementada. RF-07/08/10 → 0001 AC-01/03/04/05/07/08/09/10/T-06/07/11/EV-11: reservas por ID, reintento/clave nueva y confirmación/cancelación UI; integración real pendiente. RF-11/12 → 0006 AC-01..06/T-05/06/EV-07: controles ganga UI. RNF-02 → 0007 AC-01..04/T-03/04/EV-06: listeners y reconsulta simulados. RF-13 → 0008 AC-01..05/T-03/04/EV-06: URL/fallo simulados; Linking real pendiente. Ninguna casilla 5.1–5.6 se cierra sin evidencia en dispositivo/API real.

Al verificar un feature, enlazar sus `EV` reales y resultado. Si un requisito comparte features, conservar exactamente qué parte cubre cada uno. Una evidencia planificada jamás se registra como aprobada. El estado del producto solo puede declararse completo cuando todas las filas `MUST` tienen evidencia aprobada y los `SHOULD` incluidos en el alcance acordado también la tienen.

## Revisiones 2026-11-09

RF-01/02 → US-01/02 → TASKS 5.19 → [0026](../specs/0026-navegacion-y-mi-cuenta/spec.md) AC-01..04 → T-01..05 → [EV-01..04](../specs/0026-navegacion-y-mi-cuenta/verification.md): navegación y selección, perfil autorizado, recuperación y compatibilidad verificados técnicamente. Sustituye presentación de sesión 0024; aceptación física separada.

RF-03/11/12 → US-03/05 → TASKS 1.6 → [0027](../specs/0027-gangas-demo/spec.md) AC-01..03 → T-01..03 → [EV-01..03](../specs/0027-gangas-demo/verification.md): tres gangas locales, repetición/conservación y feed/fotos reales PASS. Datos optativos; no sustituye UAT de 0006.
