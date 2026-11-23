# 0040 — Tareas

Estado: Regresión técnica aprobada; recorridos físicos, distribución y UAT pendientes | Plan: plan.md

- [ ] **T-01** [AC-01] Consolidar EV de 0034/0037/0038/0039 y ejecutar tipos completos, suites/build/exports y consistencia documental de las versiones que se entregarán.
- [ ] **T-02** [AC-02] Ejecutar checklist comprador/vendedor/ajeno en dispositivos con foto, teclado, texto ampliado, filtros, contacto, reservas y cierre; registrar entorno y límites por plataforma. Preparación documental lista: casos-limite.md (43 casos y recorrido corto) y registro-casos-limite.md; EV-02 nativa pendiente.
- [ ] **T-03** [AC-03] Ejecutar PostgreSQL/Redis reales aislados, concurrencia de última pieza/reintentos/resolución/ofertas, reinicio de worker y dos clientes/reconexión; conservar invariantes y datos originales. Casos CL-03/05/23/24/37..40 complementan el recorrido móvil; no heredar PASS de informes anteriores.
- [ ] **T-04** [AC-04] Inventariar infraestructura y preparar despliegue HTTPS, datos/jobs/uploads persistentes, respaldo/ensayo y rollback; verificar desde otra red y tras reinicio. Dependencia: acceso al entorno.
- [ ] **T-05** [AC-05] Definir identidad y perfil de build, generar artefacto nativo e instalarlo desde cero contra el entorno de entrega; guardar hash/versiones sin secretos. Dependencia: cuenta/build y teléfono objetivo.
- [ ] **T-06** [AC-06, AC-07] Ejecutar usabilidad con cinco estudiantes y piloto de una semana con tres vendedores/quince compradores; documentar tiempos, incidentes, ofertas y WhatsApp. Dependencia: participantes disponibles.
- [ ] **T-07** [AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07] Corregir hallazgos con trazabilidad, consolidar EV y actualizar TASKS/índice/auditoría solo con criterios satisfechos.
- [ ] **T-08** [AC-02] Corregir INC-0040-02: rueda iOS con tamaño estable, regresión de Guardar/cerrar e Inicio/Fin, tipos/bundle y aceptación visual en iPhone; evidencia EV-02 en verification.md. Subtarea puntual de T-07; la comprobación automática no cierra la aceptación nativa.

Revisión actual en revision-mvp.md y verification.md: 292 pruebas y 674 HTTP nuevos PASS, tipos/build/lint/check-sdd aprobados. INC-0040-01 cerrado técnicamente por 0045; la reproducción fallida de resultados-casos-limite.md se conserva como histórica. T-01 conserva la versión/artefactos finales de entrega; T-02/T-03 conservan variantes físicas, iPhone y 20 minutos reales sin completar. T-07/T-08 mantienen aceptación nativa de INC-0040-02. No se cierra ninguna tarea global por esos resultados parciales.
