# Auditoría del proyecto y decisiones de producto

Fecha de corte: 2026-10-04; se conserva la evidencia histórica del 2026-10-01. Esta auditoría distingue **documentado**, **implementado** y **verificado**. Una referencia a código prueba que existe una pieza, no que el flujo completo funciona. Los hallazgos abiertos se convierten en decisiones o tareas antes de declarar listo el feature afectado.

## Estado de adopción

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
| GAP-03 | RF-06 dice «Vendido» y `PublicationStatus` solo tiene `FINISHED`. | Arquitectura y 0004 definen `STATIC ACTIVE → FINISHED` por `POST /publications/:id/sold`; UI muestra «Vendido». | Contrato resuelto; código pendiente. |
| GAP-04 | RF-14 exige tres denunciantes distintos y `Report` no tiene unicidad `(reporter_id, publication_id)`. | Arquitectura y `TASKS.md` 6.4 registran restricción/migración para el SHOULD antes de activarlo. | Diseño resuelto; código pendiente si se incluye. |
| GAP-05 | Arquitectura/esquema usan User/UUID; auth/usuarios de la línea base usaban prisma.usuario y campos españoles. | Backend corregido; build y registro/login HTTP comprobados en 0002 EV-07 y 0010 EV-01. | Resuelto backend; cliente móvil y guards pendientes en 0002. |
| GAP-06 | `docs/03_ARCHITECTURE.md` usa `stock_updated`; `RNF-02` decía `stock_actualizado`. | Se usa `stock_updated`, según el diccionario explícito de eventos de arquitectura. | Resuelto en requisitos. |
| GAP-07 | `docs/06_USER_STORIES_AND_TASKS.md` decía `/register`, `/login` y `AsyncStorage`; el contrato y el código actuales usan `/auth/*` y `expo-secure-store`. | Se actualizan las referencias de historias/tareas a los contratos observados; la compilación backend sigue pendiente. | Resuelto documentalmente. |
| GAP-08 | Arquitectura exigía cinco zonas; seed previo insertaba siete y alias distintos. | Seed transaccional exacto, alias/remapeos y referencias comprobados en 0010 EV-05 / 0005 EV-05. | Resuelto y verificado en PostgreSQL local y fixtures. |
| GAP-09 | TASKS marcaba infraestructura completa sin evidencia en la línea base. | Ahora 1.1–1.4 se cierran con 0010 EV-01..05, resumen reproducible y respaldo/restore. | Resuelto y verificado el 2026-10-04. |
| GAP-10 | RF-04 oculta stock cero y RF-09 lo devuelve; README dice que vuelve al feed. | RF-04/RF-09 y 0001/0003 fijan retorno si sigue `ACTIVE` y dentro de horario; `FINISHED` no se reactiva. | Resuelto documentalmente. |
| GAP-11 | README listaba filtro de palabras clave como indispensable, pero no existe RF. | Se aclaró como idea fuera del MVP comprometido; necesita requisito si se decide incluir. | Fuera de alcance MUST actual. |
| GAP-12 | La migración 20260929232323_sdd_architecture conserva DROP TABLE; estaba aplicada localmente desde 2026-09-29. | Mantener checksum; ruta complementaria segura con archivo íntegro, UUID y precios con procedencia; respaldo real y ensayo antiguo poblado aprobados en 0010 EV-04. | Resuelto para fase 1 local; otros entornos requieren inventario/respaldo/ensayo propios. |
| GAP-13 | Seed previo tenía errores de imports .ts/tipos pg y ejecución no comprobada. | Imports sin extensión, adapter directo, generador CommonJS y ts-node local; tsc y seed repetido aprobados. | Resuelto, 0010 EV-01/05. |
| GAP-14 | Faltaba plantilla de entorno y prueba funcional de conexión. | Plantilla con CORS_ORIGINS; PostgreSQL/Prisma conectaron realmente. | Resuelto para fase 1, 0010 EV-02. Redis corresponde a fase 3. |
| GAP-15 | Stock no negativo carecía de CHECK. | Migración aditiva y SQLSTATE 23514 para stock -1; NULL en STATIC válido. | Resuelto y verificado, 0010 EV-03. |
| GAP-16 | README tenía nombres/estados españoles, `stockReservado` y categorías «Otros» ausentes del modelo actual. | Resumen de modelo y categorías alineado a arquitectura/esquema; el comportamiento de negocio se conserva en requisitos. | Resuelto documentalmente. |
| GAP-17 | Reservation carecía de precio e idempotencia. | Columnas NOT NULL, Decimal(10,2), UUID, unicidad comprador/clave e índice de fecha migrados; precios históricos solo con evidencia, múltiples reservas permitidas. | Esquema verificado, 0010 EV-03/04 y 0001 EV-10; API/reintentos pendientes en 0001. |
| GAP-18 | Las reglas de reserva repetida, fin horario y formato de teléfono no tenían respuesta única. | Decisiones del usuario del 2026-10-01 incorporadas a RF-02/04/07/08/12/13, expedientes y trazabilidad. | Resuelto documentalmente; pruebas pendientes. |
| GAP-19 | RF-14 tenía historia y tarea global, pero ningún criterio `AC` ni evidencia `EV` en la trazabilidad. | Se creó 0009 con AC/T/EV planificados. El flujo de revisión del moderador y la validez de reportes requieren DEC-01/02 si se incluye este SHOULD. | Cobertura documental creada; decisión opcional pendiente. |

## Evidencia histórica de la revisión del 2026-10-01

- `npm run build` en `Backend/` (revisión inicial): **falló** por tres referencias a `prisma.usuario` ausentes en el cliente generado.
- `npx tsc --noEmit --incremental false` en `Backend/` (esta revisión): **falló** por esos tres TS2339 y tres errores del seed (dos TS5097 y un TS7016).
- `npx tsc --noEmit` en `Frontend/`: **aprobó**. Esto solo comprueba tipos, no comportamiento móvil.
- No se ejecutaron migraciones, seed ni pruebas contra una base de datos real. Ningún `EV` de los expedientes se considera aprobado.
- Se inspeccionaron el esquema Prisma, auth, cliente HTTP, flujo de registro e inicio de sesión y documentación. La presencia de módulos/pantallas se registra como **implementación parcial**.

## Orden recomendado para cerrar la deuda

Actualización 2026-10-04: fase 1 implementada y verificada. Build, tsc, validate/status/diff, seed doble, 9 pruebas unitarias, 1 E2E y ensayo integral de infraestructura aprobaron. Inventario real: 7→5 zonas, 8 categorías reconciliadas, 3→4 migraciones y cero filas de negocio antes/después. Respaldo real restaurado con hashes idénticos; fixtures antiguos/modernos migrados y recuperados sin deducir precios. Detalles en [0010 verification](../specs/0010-infraestructura-y-base-de-datos/verification.md). Los criterios HTTP/móviles de reservas y catálogos conservan su verificación pendiente.

El siguiente trabajo funcional es completar 0002 (guards/cliente móvil), seguido de 0005 (endpoints/filtros). La secuencia inicial siguiente se conserva como referencia; sus pasos de fase 1 ya tienen evidencia.

1. Inspeccionar datos existentes antes de migraciones y seed; resolver GAP-12/13/15 y la migración planificada de GAP-17 durante implementación. GAP-14 solo requiere comprobar ejecución.
2. Corregir contrato de autenticación según 0002 y verificar compilación/integración; después implementar catálogos, publicaciones, reservas, ganga, eventos y contacto según dependencias.
3. Repetir convergencia por feature, registrar `EV` reales y actualizar esta auditoría con fecha y pruebas.

## Decisiones de producto cerradas

1. **Precio:** se fija al reservar; ganga o edición posterior solo afectan nuevas reservas (0001 DEC-02; 0006 DEC-01).
2. **Reservas repetidas:** un comprador puede tener varias reservas activas de la misma publicación. Reintentar con la misma clave devuelve la existente sin nuevo descuento (0001 DEC-03).
3. **Fin del horario:** el vendedor puede confirmar la reserva previa durante sus propios 20 minutos; no se aceptan nuevas (0003 DEC-02).
4. **Teléfonos:** se aceptan diez dígitos mexicanos con o sin `+52`, de cualquier región; se guardan en formato `+52XXXXXXXXXX` (0002 DEC-03; 0008 DEC-01).

No quedan decisiones de negocio imprescindibles abiertas en los ocho expedientes `MUST`. En 0009 siguen abiertas dos decisiones opcionales sobre moderación; no bloquean el MVP. Permanecen dependencias técnicas y pruebas sin ejecutar.
