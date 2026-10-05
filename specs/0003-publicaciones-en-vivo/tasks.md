# 0003 — Tareas

Estado: **En implementación; backend fase 2 verificado, eventos/reservas/UI pendientes**

- [ ] **T-01** `[AC-03, AC-04]` Comprobar contrato de cierre horario y continuidad de reservas con 0001 antes de integrar los módulos.
- [x] **T-02** `[AC-01, AC-02]` Revisar esquema/migración, validaciones y `POST /uploads`; preparar imagen servida por backend. EV-08/09 y 0010 EV-03.
- [x] **T-03** `[AC-01, AC-02, AC-06]` Implementar DTO, creación y edición `LIVE` con JWT, propiedad, catálogo y validación de tiempo/stock. EV-09/10.
- [ ] **T-04** `[AC-03, AC-04]` Implementar predicado de feed, detalle, expiración persistente y evento `publication_expired`.
- [ ] **T-05** `[AC-05, AC-06]` Implementar venta física y edición de stock atómicas frente a reserva, con `stock_updated`.
- [ ] **T-06** `[AC-01, AC-03, AC-06, AC-07]` Integrar formulario, feed, temporizador y gestión del vendedor conforme UI/UX; incluir cierre manual SHOULD.
- [ ] **T-07** `[AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07]` Ejecutar integración, concurrencia, eventos y revisión de convergencia; registrar EV-01..07.
- [x] **T-08** `[AC-01, AC-02, AC-03, AC-05, AC-06]` Implementar y verificar HTTP backend fase 2: upload, creación/edición, feed/detalle privado y venta física bajo bloqueo PostgreSQL; EV-08/09/10 aprobadas con límites respecto a reservas/eventos/UI.

T-04 conserva expiración persistente/evento pendiente; su lectura HTTP está cubierta por T-08. T-05 conserva carrera HTTP con reservas y stock_updated pendientes; bloqueo de venta física/edición está cubierto por T-08. T-01, T-06/T-07 requieren fases posteriores.
