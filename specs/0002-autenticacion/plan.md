# 0002 — Plan técnico

Estado: **En implementación; dependencia backend de 0010 comprobada** | Especificación: `spec.md`

## Contexto y diseño

Avance 2026-10-04: T-01/T-02 y la parte login de T-03 implementadas y probadas bajo 0010 EV-01/04; `prisma.user`, DTO ingleses, UUID, normalización telefónica, bcrypt y duplicados concurrentes comprobados. El historial aplicado se conserva y 0010 aporta la transición antigua segura. Los puntos siguientes mantienen el alcance restante de guards/cliente móvil y su verificación antes de cerrar 0002.

- **Datos y migración (AC-02/06):** `User.id` es UUID, `email` único y `password_hash` persistido. La migración `20260929232323_sdd_architecture` elimina tablas antiguas: antes de aplicarla fuera de un entorno vacío, inspeccionar datos, definir respaldo/migración de usuarios y probar reversión. El seed y su compilación se revisan por separado en `TASKS.md` 1.4.
- **API (AC-01–04):** adaptar DTO y servicio a `name/email/password/phone`, `prisma.user` y `User.id: string`. Validar dominio y campos; aceptar diez dígitos nacionales de México con o sin `+52`, normalizar a `+52XXXXXXXXXX` y rechazar números ajenos o ambiguos. Normalizar correo antes de comprobar unicidad. Conservar errores HTTP estándar de NestJS. `bcrypt` nunca sale en respuesta.
- **Autorización (AC-05):** implementar estrategia Passport JWT, `JwtAuthGuard` y `@CurrentUser()` para rutas protegidas. Rechazar JWT inválido o expirado con `401`; la clave JWT proviene de entorno. El token contiene `sub` UUID.
- **Móvil (AC-03/05/06):** actualizar cliente para enviar claves inglesas, almacenar token en `expo-secure-store`, usar interceptor Axios y navegación Expo Router. Seguir tokens visuales y formularios de `docs/04_UI_UX_GUIDELINES.md`. No mostrar datos secretos en logs.
- **Compatibilidad:** frontend y backend deben desplegarse con el mismo contrato; una versión antigua que envíe claves españolas no funcionará hasta adaptar el cliente o añadir un adaptador temporal explícito. No cambiar el esquema para ocultar el desajuste.

## Constitución

| Principio | Cumplimiento |
| --- | --- |
| I–II | RF/US → AC-01..06 → T → EV; las decisiones de producto están resueltas. |
| III | No modifica inventario ni reservas. |
| IV | Define DTO, JWT, permisos y exposición de datos antes de integrar. |
| V | Registro/login reales, compilación y ruta protegida tendrán evidencia separada. |
| VI | Sin email de verificación, pagos ni GPS; cambios se reespecifican. |

## Verificación prevista y orden

Pruebas de DTO y servicio, integración HTTP con PostgreSQL de prueba y prueba móvil de almacenamiento/navegación; comprobar `npm run build` del backend y `npx tsc --noEmit` del frontend. Orden: revisar migración y datos → adaptar Prisma/DTO → login/JWT guard → frontend → pruebas y convergencia. No ejecutar migraciones destructivas sin respaldo.
