# 0001 — Tareas de reservas

Estado: **Planificado** | Plan: `plan.md`

- [ ] **T-01** `[AC-01, AC-03, AC-09]` Comprobar dependencias de autenticación y publicaciones (`TASKS.md` 2.1–2.5) antes de integrar reservas.
- [ ] **T-02** `[AC-01, AC-06, AC-09]` Planificar y aplicar migración para precio fijado, clave de idempotencia única por comprador e índice de vencimiento; respaldar datos.
- [ ] **T-03** `[AC-01, AC-02, AC-03, AC-09]` Implementar `POST /reservations` con JWT, clave obligatoria, bloqueo pesimista, transacción y reintento idempotente; exponer consultas de reservas propias y del vendedor con permisos.
- [ ] **T-04** `[AC-04, AC-05, AC-07]` Implementar confirmar/cancelar con guardias de propiedad, vencimiento y transición de estado única.
- [ ] **T-05** `[AC-06, AC-07, AC-08]` Implementar BullMQ, conciliación de vencidas, ejecución idempotente y emisión `stock_updated` después del commit.
- [ ] **T-06** `[AC-01, AC-03, AC-05, AC-07, AC-08, AC-09]` Integrar lista de reservas del comprador, temporizador y precio por reserva, WhatsApp, cancelación, nueva acción con nueva clave y retorno al feed.
- [ ] **T-07** `[AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09]` Ejecutar las pruebas de `plan.md`, registrar EV-01 a EV-09, corregir desvíos y hacer convergencia.

No marcar una tarea `[x]` sin resultado verificable en `verification.md`. Estas tareas no sustituyen las casillas globales de `TASKS.md`.
