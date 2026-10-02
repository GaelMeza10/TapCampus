# Auditoría del proyecto y decisiones de producto

Fecha de corte: 2026-10-01. Esta auditoría distingue **documentado**, **implementado** y **verificado**. Una referencia a código prueba que existe una pieza, no que el flujo completo funciona. Los hallazgos abiertos se convierten en decisiones o tareas antes de declarar listo el feature afectado.

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
| GAP-05 | Arquitectura/esquema usan `User.email/name/phone/password_hash` y UUID; auth/usuarios usan `correo/nombre/telefono/contrasena` y `prisma.usuario`. | 0002 adopta contrato inglés de arquitectura; hay que migrar DTO, servicios y cliente móvil. | Contrato resuelto; backend bloqueado hasta implementar. |
| GAP-06 | `docs/03_ARCHITECTURE.md` usa `stock_updated`; `RNF-02` decía `stock_actualizado`. | Se usa `stock_updated`, según el diccionario explícito de eventos de arquitectura. | Resuelto en requisitos. |
| GAP-07 | `docs/06_USER_STORIES_AND_TASKS.md` decía `/register`, `/login` y `AsyncStorage`; el contrato y el código actuales usan `/auth/*` y `expo-secure-store`. | Se actualizan las referencias de historias/tareas a los contratos observados; la compilación backend sigue pendiente. | Resuelto documentalmente. |
| GAP-08 | Arquitectura enumera cinco zonas y seed inserta siete; «Gimnasio» y «Batas/Uniformes» también difieren. | 0005 adopta el catálogo exacto de arquitectura; al implementar revisar datos ya sembrados antes de remapear. | Contrato resuelto; seed pendiente. |
| GAP-09 | `TASKS.md` marcaba infraestructura como completa sin filtro global, restricción de stock ni evidencia de migración ejecutada. | Se dejaron 1.1–1.4 pendientes hasta obtener pruebas; 1.3 ya no se da por verificada. | Estado corregido; evidencia pendiente. |
| GAP-10 | RF-04 oculta stock cero y RF-09 lo devuelve; README dice que vuelve al feed. | RF-04/RF-09 y 0001/0003 fijan retorno si sigue `ACTIVE` y dentro de horario; `FINISHED` no se reactiva. | Resuelto documentalmente. |
| GAP-11 | README listaba filtro de palabras clave como indispensable, pero no existe RF. | Se aclaró como idea fuera del MVP comprometido; necesita requisito si se decide incluir. | Fuera de alcance MUST actual. |
| GAP-12 | La migración `20260929232323_sdd_architecture` contiene `DROP TABLE` de usuarios/publicaciones/reservas antiguos. | Antes de ejecutar, comprobar base real, respaldar/remapear datos y probar reversión. No se ejecutó en esta tarea. | Riesgo de implementación pendiente. |
| GAP-13 | `npx tsc --noEmit --incremental false` falla también en `prisma/seed.ts`: dos TS5097 por importaciones `.ts` y TS7016 por tipos de `pg`. | Corregir al implementar 1.4; no confundir con los tres TS2339 de auth. | Código pendiente. |
| GAP-14 | Arquitectura enumera `.env.example`, pero faltaba `Backend/.env.example` versionado. | Se añadió una plantilla con `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL` y `PORT`, sin credenciales reales; la conexión funcional sigue pendiente. | Plantilla resuelta; ejecución pendiente. |
| GAP-15 | Arquitectura exige `current_stock >= 0`; el esquema Prisma solo tiene comentario, sin `CHECK` en migración. | Añadir restricción de BD y prueba al implementar 1.3/0003. | Código/migración pendiente. |
| GAP-16 | README tenía nombres/estados españoles, `stockReservado` y categorías «Otros» ausentes del modelo actual. | Resumen de modelo y categorías alineado a arquitectura/esquema; el comportamiento de negocio se conserva en requisitos. | Resuelto documentalmente. |
| GAP-17 | El esquema `Reservation` no guarda precio fijado ni clave de idempotencia. | 0001/0006 y arquitectura especifican `unit_price Decimal(10,2)` y clave UUID única por comprador; se requieren cambios de esquema y migración en fase de implementación. Si hay reservas históricas, inspeccionar datos antes del backfill: el precio original no se puede deducir del precio actual sin evidencia. | Contrato resuelto; código/migración pendientes. |
| GAP-18 | Las reglas de reserva repetida, fin horario y formato de teléfono no tenían respuesta única. | Decisiones del usuario del 2026-10-01 incorporadas a RF-02/04/07/08/12/13, expedientes y trazabilidad. | Resuelto documentalmente; pruebas pendientes. |
| GAP-19 | RF-14 tenía historia y tarea global, pero ningún criterio `AC` ni evidencia `EV` en la trazabilidad. | Se creó 0009 con AC/T/EV planificados. El flujo de revisión del moderador y la validez de reportes requieren DEC-01/02 si se incluye este SHOULD. | Cobertura documental creada; decisión opcional pendiente. |

## Evidencia de esta revisión

- `npm run build` en `Backend/` (revisión inicial): **falló** por tres referencias a `prisma.usuario` ausentes en el cliente generado.
- `npx tsc --noEmit --incremental false` en `Backend/` (esta revisión): **falló** por esos tres TS2339 y tres errores del seed (dos TS5097 y un TS7016).
- `npx tsc --noEmit` en `Frontend/`: **aprobó**. Esto solo comprueba tipos, no comportamiento móvil.
- No se ejecutaron migraciones, seed ni pruebas contra una base de datos real. Ningún `EV` de los expedientes se considera aprobado.
- Se inspeccionaron el esquema Prisma, auth, cliente HTTP, flujo de registro e inicio de sesión y documentación. La presencia de módulos/pantallas se registra como **implementación parcial**.

## Orden recomendado para cerrar la deuda

1. Inspeccionar datos existentes antes de migraciones y seed; resolver GAP-12/13/15 y la migración planificada de GAP-17 durante implementación. GAP-14 solo requiere comprobar ejecución.
2. Corregir contrato de autenticación según 0002 y verificar compilación/integración; después implementar catálogos, publicaciones, reservas, ganga, eventos y contacto según dependencias.
3. Repetir convergencia por feature, registrar `EV` reales y actualizar esta auditoría con fecha y pruebas.

## Decisiones de producto cerradas

1. **Precio:** se fija al reservar; ganga o edición posterior solo afectan nuevas reservas (0001 DEC-02; 0006 DEC-01).
2. **Reservas repetidas:** un comprador puede tener varias reservas activas de la misma publicación. Reintentar con la misma clave devuelve la existente sin nuevo descuento (0001 DEC-03).
3. **Fin del horario:** el vendedor puede confirmar la reserva previa durante sus propios 20 minutos; no se aceptan nuevas (0003 DEC-02).
4. **Teléfonos:** se aceptan diez dígitos mexicanos con o sin `+52`, de cualquier región; se guardan en formato `+52XXXXXXXXXX` (0002 DEC-03; 0008 DEC-01).

No quedan decisiones de negocio imprescindibles abiertas en los ocho expedientes `MUST`. En 0009 siguen abiertas dos decisiones opcionales sobre moderación; no bloquean el MVP. Permanecen dependencias técnicas y pruebas sin ejecutar.
