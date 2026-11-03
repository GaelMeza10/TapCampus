# 0001 — Tareas de reservas

Estado: **En verificación; backend fases 2/3 verificado y presentación móvil probada en Jest; dispositivo pendiente**

- [x] **T-01** `[AC-01, AC-03, AC-09]` Comprobar dependencias de autenticación y publicaciones (`TASKS.md` 2.1–2.5) antes de integrar reservas. Evidencia backend: verification.md, fase 3.
- [x] **T-02** `[AC-01, AC-06, AC-09]` Planificar y aplicar migración para precio fijado, clave de idempotencia única por comprador e índice de vencimiento; respaldar datos. Evidencia: EV-10 y 0010 EV-02/03/04.
- [x] **T-03** `[AC-01, AC-02, AC-03, AC-09]` Implementar `POST /reservations` con JWT, clave obligatoria, bloqueo pesimista, transacción y reintento idempotente; exponer consultas de reservas propias y del vendedor con permisos. Evidencia backend: verification.md, fase 3.
- [x] **T-04** `[AC-04, AC-05, AC-07]` Implementar confirmar/cancelar con guardias de propiedad, vencimiento y transición de estado única. Evidencia backend: verification.md, fase 3.
- [x] **T-05** `[AC-06, AC-07, AC-08]` Implementar BullMQ, conciliación de vencidas, ejecución idempotente y emisión `stock_updated` después del commit. Evidencia backend: verification.md, fase 3.
- [ ] **T-06** `[AC-01, AC-03, AC-05, AC-07, AC-08, AC-09]` Integrar lista de reservas del comprador, temporizador y precio por reserva, WhatsApp, cancelación, nueva acción con nueva clave y retorno al feed.
- [ ] **T-07** `[AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09]` Ejecutar las pruebas de `plan.md`, registrar EV-01 a EV-09, corregir desvíos y hacer convergencia.
- [ ] **T-11** `[AC-10]` Añadir `publicationTitle` a la respuesta de reserva, crear la lista móvil independiente y verificar reserva tras agotamiento o fin; registrar EV-11.
- [x] **T-12** `[AC-11, AC-12, AC-13]` Definir el helper de etiquetas, fechas y orden estable por publicación en `Frontend/src/lib/reservation-presentation.ts`; cubrir estados, valores futuros y empate de tiempo. Evidencia: EV-12.
- [x] **T-13** `[AC-11, AC-12, AC-13]` Sustituir UUID/enums visibles en `reservations.tsx`, `publication/[id].tsx` y `sales.tsx`; mantener IDs internos para cancelar/confirmar y describir la acción en modales. Evidencia: EV-13.
- [ ] **T-14** `[AC-11, AC-12, AC-13]` Probar dos reservas de un producto, los cuatro estados, accesibilidad, acciones dirigidas al ID correcto y recorrido móvil; registrar EV-14, TypeScript/Jest/SDD y revisar convergencia.

No marcar una tarea `[x]` sin resultado verificable en `verification.md`. Estas tareas no sustituyen las casillas globales de `TASKS.md`.

- [x] **T-08** `[AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09]` Verificar exclusivamente el alcance backend de fase 3 con scripts/verify-phase3.mjs (HTTP/PostgreSQL/Redis/Socket.io, 50 claves distintas, misma clave, estados, carreras y reinicio); no cerrar T-06 ni afirmar pruebas móviles. Evidencia backend: verification.md, fase 3.

Cierre 2026-10-05: tareas marcadas con evidencia backend. UI/convergencia móvil conservan casilla abierta; expediente completo En implementación.
