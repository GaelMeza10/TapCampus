# 0002 — Tareas

Estado: **En implementación; backend y fase 4.3 verificados, fase 5.1 pendiente**

- [x] **T-01** `[AC-02, AC-06]` Revisar datos existentes y migración destructiva, respaldo, adaptación de `prisma.user` y UUID en auth/usuarios. Evidencia backend: EV-07 y 0010 EV-01/04.
- [x] **T-02** `[AC-01, AC-02, AC-03]` Alinear DTO, servicio y respuestas de `POST /auth/register`; cubrir dominio, campos, teléfono mexicano normalizado, hash y unicidad. Evidencia backend: EV-07 y 0010 EV-01.
- [x] **T-03** `[AC-04, AC-05]` Alinear login, estrategia JWT, `JwtAuthGuard` y `@CurrentUser()`; probar credenciales y autorización. Evidencia backend EV-08.
- [x] **T-04** `[AC-01, AC-03, AC-05, AC-06]` Actualizar formularios, servicio HTTP, interceptor, almacenamiento seguro y navegación móvil al contrato inglés. EV-09; la aceptación de formularios contra backend/BD real permanece en T-05.
- [ ] **T-05** `[AC-01, AC-02, AC-03, AC-04, AC-05, AC-06]` Ejecutar compilación, integración con BD y prueba móvil; registrar EV-01..06 y resolver desvíos.
- [x] **T-06** `[AC-01, AC-02, AC-03, AC-04, AC-05, AC-06]` Aceptación acotada backend 2.1/2.2: JwtStrategy/guard/CurrentUser, integración HTTP real y build; EV-08 aprobado, sin cerrar móvil.
