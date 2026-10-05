# 0003 — Tareas

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

- [x] **T-01** `[AC-03, AC-04]` Comprobar contrato de cierre horario y continuidad de reservas con 0001 antes de integrar los módulos. Evidencia backend: verification.md, fase 3.
- [x] **T-02** `[AC-01, AC-02]` Revisar esquema/migración, validaciones y `POST /uploads`; preparar imagen servida por backend. EV-08/09 y 0010 EV-03.
- [x] **T-03** `[AC-01, AC-02, AC-06]` Implementar DTO, creación y edición `LIVE` con JWT, propiedad, catálogo y validación de tiempo/stock. EV-09/10.
- [x] **T-04** `[AC-03, AC-04]` Implementar predicado de feed, detalle, expiración persistente y evento `publication_expired`. Evidencia backend: verification.md, fase 3.
- [x] **T-05** `[AC-05, AC-06]` Implementar venta física y edición de stock atómicas frente a reserva, con `stock_updated`. Evidencia backend: verification.md, fase 3.
- [ ] **T-06** `[AC-01, AC-03, AC-06, AC-07]` Integrar formulario, feed, temporizador y gestión del vendedor conforme UI/UX; incluir cierre manual SHOULD.
- [ ] **T-07** `[AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07]` Ejecutar integración, concurrencia, eventos y revisión de convergencia; registrar EV-01..07.
- [x] **T-08** `[AC-01, AC-02, AC-03, AC-05, AC-06]` Implementar y verificar HTTP backend fase 2: upload, creación/edición, feed/detalle privado y venta física bajo bloqueo PostgreSQL; EV-08/09/10 aprobadas con límites respecto a reservas/eventos/UI.

T-01/T-04/T-05 cerradas con T-09/EV-04/05/07; T-06/T-07 conservan integración móvil.

- [x] **T-09** `[AC-03, AC-04, AC-05, AC-06, AC-07]` Verificar fin persistente, cierre manual backend, eventos y carrera HTTP venta física/reserva en fase 3; mantener UI pendiente. Evidencia backend: verification.md, fase 3.

Cierre 2026-10-05: tareas marcadas con evidencia backend. UI/convergencia móvil conservan casilla abierta; expediente completo En implementación.
