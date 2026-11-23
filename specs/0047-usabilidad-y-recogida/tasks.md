# 0047 — Tareas

Estado: En verificación; pendientes nativos/UAT separados | Plan: plan.md

- [x] **T-01** [AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08] Registrar hallazgos de código, consulta BD/API de solo lectura, investigación y respuestas del usuario. EV-00; no equivale a aceptación funcional.
- [x] **T-02** [AC-02, AC-03, AC-06, AC-07, AC-10] Cerrar DEC-03/05/06 y actualizar requisitos/arquitectura/flujos/DESIGN/traceabilidad afectados antes de su código; conservar evidencia histórica. EV-06/07/10.
- [ ] **T-03** [AC-01] Instrumentar y reproducir en iPhone 14 Pro Max y 13 Pro Max/Expo Go; recoger versiones, insets, frames, avisos y offsets antes de decidir la corrección. Instrumentación y colector implementados (EV-01); el usuario confirma después resuelto; no hay mediciones comparativas.
- [ ] **T-04** [AC-01] Verificación formal del desplazamiento por modelo: usuario confirma resuelto; causa medida y comparación ±1 punto no ejecutadas. No se reabre investigación adicional contra su petición de priorizar.
- [x] **T-05** [AC-02, AC-03] Implementar migración/DTO/proyecciones: pickup_mode, zona nullable condicionada, instantáneas de recogida, fallback legado y bloqueo de cambio de zona acordado; ensayar carreras/reversión/preservación. EV-02/03.
- [x] **T-06** [AC-02, AC-03] Mostrar ubicación común en confirmación/Mis reservas/detalle y selector STATIC por acordar; adaptar tipos, edición, filtros/conteos y errores, sin zona ficticia ni dependencia del detalle público. EV-02/03.
- [ ] **T-07** [AC-04] Eventos postcommit de creación/cambio/inicio, trabajos y conciliación; suscripción/refetch con filtros y ancla conservados. Verificar dos clientes Socket.io reales y dos sesiones móviles. Contratos, dos sockets reales y recuperación PASS (EV-04); sesiones móviles pendientes.
- [x] **T-08** [AC-05] Crear selector H:M con adaptadores nativos y validación de duración/horario; preservar edición, foto/borrador, Guardar/cerrar e inmutabilidad de oferta activa. EV-05 técnico/auxiliar; aceptación del control nativo en T-13.
- [ ] **T-09** [AC-06] Adoptar y comprobar el vocabulario elegido en todas las superficies, accesibilidad, mensajes, fixtures/guardrails e índice auxiliar; registrar comprensión real con estudiantes. Código/guardrails/auxiliar PASS (EV-06); comprensión pendiente.
- [x] **T-10** [AC-07] Ampliar catálogos y seed con identidades estables/fotos correctas; ensayo aislado, repetición, preservación y comprobación de API usada por móvil; aplicación local solo después del ensayo. EV-07.
- [x] **T-11** [AC-08] Añadir confirmación de logout con cancelación, cambios sin guardar, espera, error/reintento y 401 no bloqueado; pruebas de navegación/sesión. EV-08.
- [x] **T-12** [AC-09] Explicar stock cero sin borrar datos ni retener falsa disponibilidad; regresión de reservas/contacto/punto, agotamiento y retorno válido al feed. EV-09.
- [ ] **T-13** [AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10] Ejecutar recorridos integrados, casos adversos y regresión pertinente; completar EV-01..10, cerrar hallazgos y actualizar TASKS/índice/auditoría solo con evidencia del alcance.
