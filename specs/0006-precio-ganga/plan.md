# 0006 — Plan técnico

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

## Diseño

Fase 3: QueueService produce jobs cuyo ID incluye publicación y timestamp de activación; no requiere eliminar jobs bloqueados. PublicationsService.activateGanga bloquea la misma fila que reservas, valida modo/plazo/fecha esperada y confirma una transición única. JobsModule reconcilia trabajos futuros y gangas vencidas cada 30 s/al arrancar. Una ejecución obsoleta no cambia estado. T-05/T-06 se separan de móvil usando T-07 para evidencia backend.

- Usar campos `ganga_min_price`, `ganga_activation_mode`, `ganga_minutes_before`, `is_ganga_active` y `end_time` de `Publication`. DTO exige mínimo positivo y `<= price`, modo coherente y disparo futuro dentro de la ventana. No almacenar dinero como `float` en cálculos de negocio; Prisma `Decimal(10,2)` y evento de precio serializado como cadena decimal.
- `PATCH /publications/:id` configura/reprograma antes de activación. `PATCH /publications/:id/ganga` activa manualmente solo si la fila es `LIVE`, `ACTIVE`, dentro del horario, propiedad del JWT y ganga no activa. Actualización condicional/transacción evita duplicados.
- BullMQ/Redis programa `ganga_queue` con ID estable por publicación. Al ejecutar, relee configuración y tiempo en BD, confirma estado y activación una sola vez; conciliación tras reinicio recupera trabajos perdidos. No tomar la existencia de un job como fuente de verdad. Reprogramar al cambiar fin/minutos y descartar trabajos obsoletos.
- Emitir `ganga_activated` después del commit. `GET /publications` ordena gangas activas antes que publicaciones ordinarias y la UI usa distintivo según guía visual. El precio que devuelve la API es el precio actual visible.
- La reserva captura el precio vigente en `Reservation.unit_price Decimal(10,2)` dentro de la transacción de creación. Planificar la migración antes de integrar 0001/0006; ganga o edición posterior no modifica instantáneas previas.

## Constitución

| Principio | Cumplimiento |
| --- | --- |
| I–II | RF-11/12 → AC-01..06 → T → EV; decisión de precio resuelta. |
| III | Actualización condicional y jobs idempotentes; inventario no se modifica. |
| IV | Propiedad, DTO, evento y representación decimal pactados. |
| V | Pruebas de activación, reinicio, reprogramación y repetición. |
| VI | Sin descuentos graduales ni pagos. |

## Orden y pruebas

Validación combinada distingue reprogramación de edición de campos ajenos a ganga: solo una programación nueva exige fecha futura, y una ganga activa permite editar título/stock sin volver a validar un disparo histórico como futuro. Comprobar esta no regresión en T-02/T-07.

Depende de 0003 publicaciones, Redis y el contrato/base del gateway de 0007. Ejecutar configuración/validación → activación manual → worker y conciliación → emisión `ganga_activated` e integración de feed con 0007 → pruebas con reloj controlado y reinicio. El cierre de 0006 y 0007 exige probar juntos la ordenación del feed y el evento; no requiere que 0007 esté verificado antes de iniciar ganga.
