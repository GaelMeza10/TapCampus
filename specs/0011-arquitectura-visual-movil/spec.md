# 0011 — Arquitectura visual y navegación móvil

Estado: **Verificado** | Fecha: 2026-10-13

## Contexto y fuentes

FASE 4.1–4.2 de `TASKS.md`; RF-01/02 y US-01/02 en la entrada a la app; `docs/04_UI_UX_GUIDELINES.md`, `docs/05_USER_FLOWS.md` y 0002. El layout actual reemplaza cualquier ruta al cambiar el estado de sesión, incluido registro. Hay estilos de botón, input y tarjeta duplicados.

## Alcance

Revisar Expo Router para inicio, login, registro y home; completar `theme.js`; crear `PrimaryButton`, `CustomInput` y `Card` y usarlos en las vistas de autenticación. La pantalla home conserva su catálogo de muestra hasta fase 5. No se incorporan pantallas de publicaciones, reservas ni pestañas.

## Contratos observables

- Tras leer SecureStore, un usuario con sesión llega a home; uno sin sesión llega a login. Registro sigue accesible sin sesión y no redirige por un render del layout.
- Al perder sesión en una ruta protegida, se muestra login sin volver automáticamente a home. Un usuario autenticado no puede quedarse en login o registro.
- Los colores, radios y sombra del diseño provienen de `theme.js`. Botón primario mide 52, tiene radio pleno y comunica carga/deshabilitado. Input mide 52, acepta ícono, es accesible y coloca errores en caja roja encima. Card usa `RADIUS.lg` y `SHADOW.card`.

## Criterios de aceptación

### AC-01 — Navegación estable
**Dado** inicio en frío, registro, login, home o cierre de sesión, **cuando** cambia el estado de autenticación, **entonces** la ruta visible corresponde al flujo y no entra en un ciclo de redirecciones.

### AC-02 — Tema completo
**Dado** cualquiera de las cuatro vistas, **cuando** se renderiza, **entonces** fondo, superficies, textos, acciones, error, radios y sombra usan tokens acordes con la guía.

### AC-03 — Componentes compartidos
**Dado** formularios de autenticación, **cuando** se muestran carga, deshabilitado o error, **entonces** los tres componentes compartidos presentan esos estados y el error de input aparece en caja roja sobre el campo.

## Decisiones

No hay decisiones de producto abiertas. Se conserva la tarjeta de muestra existente y se limita la adaptación a la arquitectura de fase 4.
