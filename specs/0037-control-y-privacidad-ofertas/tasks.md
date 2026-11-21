# 0037 — Tareas

Estado: En verificación; T-01..05 aprobadas técnicamente, T-06 pendiente de aceptación nativa | Plan: plan.md

- [x] **T-01** [AC-01] Estrechamiento corregido sin casts/supresiones; tipos completos y prueba pasan. EV-01.
- [x] **T-02** [AC-02, AC-07] Proyecciones, tipos y fixtures separados; contratos públicos sin los tres campos, mine propio con configuración y vendedor sin teléfono. EV-02/EV-07 técnica.
- [x] **T-03** [AC-03, AC-04, AC-06] DTO de creación/edición diferenciados, Decimal estricto, retirada/nulls coherentes y legado/activa conservados; permisos/rechazos verificados. EV-03/04/06.
- [x] **T-04** [AC-05, AC-06] Encolado recibe fila completa tras commit; worker relee modo/configuración/fecha y mínimo válido. PostgreSQL/Redis reales: ambos órdenes, seis carreras y reinicio con oferta retirada aprobados. EV-05/06.
- [x] **T-05** [AC-03, AC-04, AC-07] Controles/mensajes de ofertas y payloads actualizados; conserva borrador/foto e instantes originales no editados. 112 pruebas frontend, tipos, exports Android/iOS y nueve capturas auxiliares PASS. EV-03/04/07 técnica; 0034 completo separado.
- [ ] **T-06** [AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07] Ejecutar integración/móvil, registrar entorno y resultados en verification.md y converger documentos; no cerrar aceptación nativa con capturas web.
