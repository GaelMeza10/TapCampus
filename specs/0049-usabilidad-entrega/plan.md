# 0049 — Plan técnico

Estado: Aprobado | Especificación: `spec.md`

## Diseño

- Backend: `ForbiddenException` en `ReservationsService.create` si `seller_id === buyerId`; `exceptionFactory` en `configure-app.ts` (`common/validation-messages.ts`); traducción de 413 y JSON inválido en `GlobalExceptionFilter`.
- Frontend: `currentUserId()` lee `sub` del JWT guardado; pie propio en `publication/[id].tsx`; `filtered` en Explorar; `normalizePrice`; `useSlowHint` y timeout de 70 s solo para login/registro.
- UI: componentes existentes (`PrimaryButton`, `InlineMessage`, `DataState`) y colores de DESIGN.md; sin estilos nuevos salvo `COLORS.error` ya usado para urgencia.

## Constitución

| Principio I–VI | Cómo se cumple / excepción documentada |
| --- | --- |
| I–VI | Reglas de negocio aplicadas en el servidor y reflejadas en el cliente; pruebas por criterio. |

## Verificación prevista

| Criterio | Tipo de prueba | Entorno / datos necesarios |
| --- | --- | --- |
| AC-01..04 | Jest (Nest y React Native Testing Library) | Mocks; sin base de datos ni puertos 3000/8081 |
