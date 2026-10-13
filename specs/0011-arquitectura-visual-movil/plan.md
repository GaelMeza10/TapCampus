# 0011 — Plan técnico

Estado: Implementado y verificado | Especificación: `spec.md`

## Diseño

- `AuthProvider` hidrata el token antes de montar el Stack. `Stack.Protected` guarda home y pantallas de invitado, con `index` accesible como ancla; `index` decide el destino con `Redirect`. Las transiciones de sesión cambian la guarda, evitando efectos globales repetidos (AC-01).
- Mover el único `theme.js` de `src/app/styles/` a `src/` para que Expo Router no lo trate como ruta; extenderlo con tokens de error y estados. `Card` encapsula superficie/radio/sombra; `PrimaryButton` encapsula acción/carga; `CustomInput` encapsula ícono, campo, accesorio de contraseña y error (AC-02/03).
- No hay datos ni migraciones. Reversión: revertir los cambios de UI/rutas. Las rutas y endpoints públicos conservan su nombre; registro/login se alinean al contrato ya definido en 0002.

## Constitución

| Principio | Aplicación |
| --- | --- |
| I–II | AC-01..03 → T-01..03 → EV-01..03. |
| III | No modifica stock ni reservas. |
| IV | El contexto de sesión y las rutas usan el contrato 0002. |
| V | Prueba de navegación, tipos y exportación Expo antes del cierre. |
| VI | Solo arquitectura de fase 4; pantallas de fase 5 siguen pendientes. |

## Verificación prevista

| AC | Comprobación |
| --- | --- |
| AC-01 | Prueba de navegación en memoria para inicio sin/con token, registro y cierre/401; exportación Expo Router sin servidor. |
| AC-02 | Revisión de tokens y tsc. |
| AC-03 | Prueba de render/estados y uso en login/registro; tsc. |

## Orden

1. T-01 tema y componentes.
2. T-02 navegación y adopción en vistas.
3. T-03 pruebas y convergencia.
