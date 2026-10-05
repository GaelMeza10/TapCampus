# Registro de funcionalidades

Cada directorio numerado es un cambio trazable. El número no se reutiliza. `specs/_template/` ofrece los cinco archivos obligatorios. El ciclo y las puertas están en `docs/08_DEVELOPMENT_WORKFLOW.md`.

| ID | Feature | Requisitos / historias | Estado | Bloqueo principal |
| --- | --- | --- | --- | --- |
| 0001 | [Reservas](0001-reservas/spec.md) | RF-07 a RF-09, RF-10 SHOULD, RNF-01; US-06 a US-08 | Planificado; esquema verificado | Precio/idempotencia migrados en 0010; faltan guards, API de publicaciones/reservas y pruebas de negocio. |
| 0002 | [Autenticación](0002-autenticacion/spec.md) | RF-01, RF-02; US-01, US-02 | En implementación | Backend registro/login y build comprobados; faltan guards e integración móvil con contrato inglés. |
| 0003 | [Publicaciones en vivo](0003-publicaciones-en-vivo/spec.md) | RF-03, RF-04, RF-05b y RF-05 SHOULD; US-03, US-05b, US-05d | Planificado | Continuidad de reservas definida; faltan API y pruebas. |
| 0004 | [Catálogo estático](0004-catalogo-estatico/spec.md) | RF-06; US-04, US-11 | Planificado | Depende de autenticación, catálogos, imagen y contacto. |
| 0005 | [Catálogos y filtros](0005-catalogos-y-filtros/spec.md) | RF-05c, RNF-03; US-05c | Planificado; seed verificado | Seed/remapeo comprobados en 0010; faltan endpoints de catálogos/filtros y UI. |
| 0006 | [Precio ganga](0006-precio-ganga/spec.md) | RF-11, RF-12; US-05 | Planificado | Precio fijado por reserva definido; faltan worker, API y pruebas. |
| 0007 | [Tiempo real](0007-tiempo-real/spec.md) | RNF-02; US-03, US-05, US-06 | Planificado | Depende de productores de eventos de 0001/0003/0006. |
| 0008 | [WhatsApp](0008-contacto-whatsapp/spec.md) | RF-13; US-09, US-11 | Planificado | Formato mexicano definido; depende de registro y reservas implementados. |
| 0009 | [Reportes y moderación](0009-reportes-y-moderacion/spec.md) | RF-14 SHOULD; US-10 | Borrador + Bloqueado | Opcional: faltan decisiones sobre revisión del moderador y reporte válido. |
| 0010 | [Infraestructura y base de datos](0010-infraestructura-y-base-de-datos/spec.md) | RF-01/02/03/05c/07/09, RNF-01; US-01/03/05c/06/08; TASKS 1.1–1.4 | Verificado | AC-01..05 aprobados en PostgreSQL real, respaldo/restore y fixtures poblados; 1.1–1.4 completas. |

Los ocho primeros expedientes cubren todos los RF/RNF `MUST` a nivel documental; 0010 organiza la infraestructura compartida de la fase 1 sin sustituir sus criterios de negocio. RF-05, RF-10 y RF-14 son `SHOULD`; 0001/0003 contienen los dos primeros como comportamiento relacionado y 0009 documenta el tercero sin incorporarlo al MVP obligatorio. El [estado por requisito](../docs/10_TRACEABILITY.md) distingue criterios definidos de evidencia aún no ejecutada. `Planificado` significa que existe un plan documental, no que el código funciona ni que sus dependencias están listas.
