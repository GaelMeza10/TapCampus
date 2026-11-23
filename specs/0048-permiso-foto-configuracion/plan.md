# 0048 — Plan técnico

Estado: Aprobado | Especificación: `spec.md`

## Contexto del repositorio

- Código existente: `pick()` en `Frontend/src/app/publication/edit.tsx` solicita permisos y fija `photoError`, mostrado por `FieldMessage`.
- Dependencias previas: 0003, 0004, 0045 (errores visibles).

## Diseño

- Modelo de datos y migraciones: sin cambios.
- API y eventos: sin cambios.
- Seguridad, permisos, errores: estado local `photoSettings` cuando `canAskAgain === false`; `Linking.openSettings()` con captura de error.
- UI/UX: `PrimaryButton` variante `ghost` compacta bajo el mensaje de la foto, igual que acciones secundarias existentes; sin colores ni estilos nuevos (DESIGN.md).
- Riesgos: iOS devuelve `canAskAgain: false` tras la primera negativa, lo cual es correcto (iOS no vuelve a preguntar).

## Constitución

| Principio I–VI | Cómo se cumple / excepción documentada |
| --- | --- |
| I–VI | Cambio acotado al cliente, con pruebas Jest y sin tocar reglas de negocio del servidor. |

## Verificación prevista

| Criterio | Tipo de prueba | Entorno / datos necesarios |
| --- | --- | --- |
| AC-01 | Jest + Testing Library | Mock de expo-image-picker y espía de `Linking.openSettings` |
| AC-02 | Jest + Testing Library | Mismo entorno, rechazo simulado |

## Dependencias y orden

1. Implementar estado y botón en `edit.tsx`.
2. Pruebas en `__tests__/publication-form.test.tsx`.
3. Suite completa, `check:design` y aceptación en teléfono.
