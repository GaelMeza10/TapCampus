# Registro de funcionalidades

Cada directorio numerado es un cambio trazable. El número no se reutiliza. `specs/_template/` ofrece los cinco archivos obligatorios. El ciclo y las puertas están en `docs/08_DEVELOPMENT_WORKFLOW.md`.

| ID | Feature | Requisitos / historias | Estado | Bloqueo principal |
| --- | --- | --- | --- | --- |
| 0001 | [Reservas](0001-reservas/spec.md) | RF-07 a RF-09, RF-10 SHOULD, RNF-01; US-06 a US-08 | En implementación; backend fases 2/3 verificado | EV-01..09 y EV-10: reservas/worker/concurrencia; móvil pendiente. |
| 0002 | [Autenticación](0002-autenticacion/spec.md) | RF-01, RF-02; US-01, US-02 | En implementación; backend fase 2 verificado | EV-08 acredita registro/login/JWT/guards/CurrentUser; integración móvil pendiente. |
| 0003 | [Publicaciones en vivo](0003-publicaciones-en-vivo/spec.md) | RF-03, RF-04, RF-05b y RF-05 SHOULD; US-03, US-05b, US-05d | En implementación; backend fases 2/3 verificado | EV-04/05/07 y EV-08..10: fin/cierre/eventos/carrera HTTP; UI pendiente. |
| 0004 | [Catálogo estático](0004-catalogo-estatico/spec.md) | RF-06; US-04, US-11 | En implementación; backend fase 2 verificado | EV-06: creación/edición/listado/detalle/contacto/sold HTTP; móvil/Linking pendientes. |
| 0005 | [Catálogos y filtros](0005-catalogos-y-filtros/spec.md) | RF-05c, RNF-03; US-05c | En implementación; seed/backend verificados | EV-05/06 acreditan seed/catálogos/filtros AND; UI sin GPS pendiente. |
| 0006 | [Precio ganga](0006-precio-ganga/spec.md) | RF-11, RF-12; US-05 | En implementación; backend fases 2/3 verificado | EV-01..06: manual/programado/reprogramación/reinicio/precio fijo; UI pendiente. |
| 0007 | [Tiempo real](0007-tiempo-real/spec.md) | RNF-02; US-03, US-05, US-06 | En implementación; backend fases 2/3 verificado | EV-01..05 gateway: dos clientes/payloads/postcommit/reconexión+REST; listeners móviles pendientes. |
| 0008 | [WhatsApp](0008-contacto-whatsapp/spec.md) | RF-13; US-09, US-11 | En implementación; backend fases 2/3 verificado | EV-01/02/03/05 API: contactos autorizados; URL/Linking pendientes. |
| 0009 | [Reportes y moderación](0009-reportes-y-moderacion/spec.md) | RF-14 SHOULD; US-10 | Borrador + Bloqueado | Opcional: faltan decisiones sobre revisión del moderador y reporte válido. |
| 0010 | [Infraestructura y base de datos](0010-infraestructura-y-base-de-datos/spec.md) | RF-01/02/03/05c/07/09, RNF-01; US-01/03/05c/06/08; TASKS 1.1–1.4 | Verificado | AC-01..05 aprobados en PostgreSQL real, respaldo/restore y fixtures poblados; 1.1–1.4 completas. |

Los ocho primeros expedientes cubren todos los RF/RNF `MUST` a nivel documental; 0010 organiza la infraestructura compartida de la fase 1 sin sustituir sus criterios de negocio. RF-05, RF-10 y RF-14 son `SHOULD`; 0001/0003 contienen los dos primeros como comportamiento relacionado y 0009 documenta el tercero sin incorporarlo al MVP obligatorio. El [estado por requisito](../docs/10_TRACEABILITY.md) distingue criterios definidos de evidencia aún no ejecutada. `Planificado` significa que existe un plan documental, no que el código funciona ni que sus dependencias están listas.
