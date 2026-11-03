# Registro de funcionalidades

Cada directorio numerado es un cambio trazable. El número no se reutiliza. `specs/_template/` ofrece los cinco archivos obligatorios. El ciclo y las puertas están en `docs/08_DEVELOPMENT_WORKFLOW.md`.

| ID | Feature | Requisitos / historias | Estado | Bloqueo principal |
| --- | --- | --- | --- | --- |
| 0014 | [Conectividad móvil](0014-conectividad-movil/spec.md) | RF-05c/06, RNF-02; US-05c/04; TASKS 5.2 | Verificado | HTTPS de API, imágenes y Socket.io comprobados; 35 pruebas aprobadas; usuario confirma productos visibles en iPhone, EV-04. |
| 0013 | [Expo SDK 58](0013-expo-sdk-58/spec.md) | RF-01/02; US-01/02; TASKS 4.4 | Verificado | EV-01..03: Doctor 20/20, tipos, 32 pruebas y bundles Android/iOS/web. Ejecución en dispositivo pertenece a fase 5. |
| 0001 | [Reservas](0001-reservas/spec.md) | RF-07 a RF-09, RF-10 SHOULD, RNF-01; US-06 a US-08 | En verificación; backend verificado y UI probada en Jest | EV-11..13: contrato, reintento y presentación en español; EV-14/recorrido real en dispositivo pendiente. |
| 0002 | [Autenticación](0002-autenticacion/spec.md) | RF-01, RF-02; US-01, US-02 | En verificación; formularios implementados | EV-10: tsc/suites; registro y login en dispositivo contra BD pendientes. |
| 0003 | [Publicaciones en vivo](0003-publicaciones-en-vivo/spec.md) | RF-03, RF-04, RF-05b y RF-05 SHOULD; US-03, US-05b, US-05d | En verificación; backend y UI implementados | EV-11: `mine` JWT en memoria y formulario; cámara/API real pendientes. |
| 0004 | [Catálogo estático](0004-catalogo-estatico/spec.md) | RF-06; US-04, US-11 | En verificación; backend y UI implementados | EV-07: flujo móvil compilado; venta/contacto real pendientes. |
| 0005 | [Catálogos y filtros](0005-catalogos-y-filtros/spec.md) | RF-05c, RNF-03; US-05c | En verificación; filtros UI implementados | EV-07: filtro simulado sin GPS; catálogos reales en dispositivo pendientes. |
| 0006 | [Precio ganga](0006-precio-ganga/spec.md) | RF-11, RF-12; US-05 | En verificación; controles UI implementados | EV-07: controles compilados; activación real en dispositivo pendiente. |
| 0007 | [Tiempo real](0007-tiempo-real/spec.md) | RNF-02; US-03, US-05, US-06 | En verificación; listeners UI implementados | EV-06: reconsulta simulada; reconexión de dispositivos reales pendiente. |
| 0008 | [WhatsApp](0008-contacto-whatsapp/spec.md) | RF-13; US-09, US-11 | En verificación; URL/UI implementadas | EV-06: URL y fallo simulados; apertura real Android/iOS pendiente. |
| 0009 | [Reportes y moderación](0009-reportes-y-moderacion/spec.md) | RF-14 SHOULD; US-10 | Borrador + Bloqueado | Opcional: faltan decisiones sobre revisión del moderador y reporte válido. |
| 0010 | [Infraestructura y base de datos](0010-infraestructura-y-base-de-datos/spec.md) | RF-01/02/03/05c/07/09, RNF-01; US-01/03/05c/06/08; TASKS 1.1–1.4 | Verificado | AC-01..05 aprobados en PostgreSQL real, respaldo/restore y fixtures poblados; 1.1–1.4 completas. |
| 0011 | [Arquitectura visual y navegación móvil](0011-arquitectura-visual-movil/spec.md) | RF-01/02; US-01/02; TASKS 4.1–4.2 | Verificado | EV-01..04: Expo Router en memoria/exportación, tema y componentes compartidos. |
| 0012 | [Publicaciones de demostración](0012-publicaciones-demo/spec.md) | RF-03/06; US-03/04; TASKS 1.5 | Verificado | EV-01..03: ocho ejemplos originales; EV-04..07: 16 nuevos con fotografías, seed repetido, PostgreSQL y feed/PNG HTTP aprobados. |

Los ocho primeros expedientes cubren todos los RF/RNF `MUST` a nivel documental; 0010 organiza la infraestructura compartida de la fase 1 sin sustituir sus criterios de negocio. RF-05, RF-10 y RF-14 son `SHOULD`; 0001/0003 contienen los dos primeros como comportamiento relacionado y 0009 documenta el tercero sin incorporarlo al MVP obligatorio. El [estado por requisito](../docs/10_TRACEABILITY.md) distingue criterios definidos de evidencia aún no ejecutada. `Planificado` significa que existe un plan documental, no que el código funciona ni que sus dependencias están listas.
