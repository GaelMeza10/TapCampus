# 0006 — Precio ganga manual y programado

Estado: **Planificado; implementación pendiente** | Fecha: 2026-10-01

## Contexto y fuentes

RF-11 y RF-12; US-05. `docs/02_REQUIREMENTS.md` exige precio mínimo y activación instantánea; `README.md` permite modo manual/programado y reconfiguración del horario; `docs/03_ARCHITECTURE.md` define campos Prisma, cola BullMQ y evento `ganga_activated`. No hay implementación de ganga, worker ni Socket.io.

## Alcance y contrato observable

- Solo una publicación `LIVE` del vendedor puede configurar `ganga_min_price` y `ganga_activation_mode` `MANUAL` o `SCHEDULED` en creación o edición. El mínimo debe ser positivo y no superar el precio normal. Si se programa, `ganga_minutes_before` define el disparo relativo a `end_time`.
- `PATCH /publications/:id/ganga` activa manualmente una ganga configurada; solo el vendedor puede hacerlo. No hay desactivación de una ganga ya activada en los requisitos MVP.
- Activación manual o programada cambia el precio visible al mínimo **de una vez**, marca `is_ganga_active`, emite `ganga_activated` y eleva la publicación en el feed. Solo ocurre una vez por publicación; reservas creadas antes conservan su `unitPrice` fijado.
- Al cambiar `end_time` o la programación antes de activar, el trabajo se reprograma; si la publicación termina antes, el job no activa la ganga. El tiempo y resultado son autoridad del servidor.
- Errores: `400` datos de precio/programación inválidos, `401` sin sesión, `403` ajeno, `404` inexistente, `409` estado incompatible o activación repetida. Fuera de alcance descuentos graduales, pagos y ganga en `STATIC`.

## Criterios de aceptación

### AC-01 — Configuración válida
**Dado** vendedor con `LIVE` activa, **cuando** configura mínimo válido y modo manual o programado, **entonces** se guarda la configuración sin cambiar aún el precio visible.

### AC-02 — Rechazo de configuración inválida
**Dado** mínimo cero/mayor al normal, programación imposible o publicación `STATIC`, **cuando** intenta configurar ganga, **entonces** recibe `400` y no cambia precio ni crea job.

### AC-03 — Activación manual
**Dado** ganga manual configurada y publicación activa, **cuando** su vendedor la activa, **entonces** el precio pasa instantáneamente al mínimo, el feed muestra distintivo y prioridad, y otro usuario recibe `403`.

### AC-04 — Activación programada resistente a reinicio
**Dado** ganga programada antes de `end_time`, **cuando** llega la hora calculada incluso tras reinicio del proceso, **entonces** se activa una vez y emite `ganga_activated` con el nuevo precio.

### AC-05 — Reprogramación y fin
**Dado** horario modificado antes del disparo, **cuando** se procesa el trabajo antiguo o termina la publicación, **entonces** no se activa fuera del nuevo horario ni después del fin; el trabajo vigente sigue la configuración guardada.

### AC-06 — Idempotencia y precio de reserva
**Dado** una ganga ya activa y una reserva creada al precio normal, **cuando** se repite la activación o cambia el precio visible, **entonces** no se emiten cambios dobles, la reserva previa conserva su `unitPrice` y una nueva reserva captura el precio ganga vigente.

## Decisiones

DEC-01 está resuelta junto con 0001 DEC-02. Implementación y pruebas pendientes.
