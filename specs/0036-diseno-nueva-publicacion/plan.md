# 0036 — Plan técnico

Estado: Planificado | Especificación: spec.md

## Diseño

AC-01: modificar Frontend/src/app/publication/edit.tsx usando foto sin relleno alrededor de la imagen, alternativa amplia, secciones abiertas y filas de selección con icono/chevron. Reutilizar CustomInput, PrimaryButton, TypeSelector, Sheet y tokens. No modificar componentes compartidos de otras rutas.

AC-02: conservar estado, validadores, referencias de inputs y posiciones relativas al ScrollView. Mantener campos como hijos directos para conservar scrollTo. No cambia modelo, migración, API/eventos, JWT, permisos, idempotencia ni contacto. Edición usa la misma composición.

AC-03: apilar filas cuando ancho o fontScale lo exijan, desplazar encabezado con el contenido y mantener envío en pie fuera del scroll. Verificar con la fixture existente y un modo de revisión acotado al formulario. Reversión: retirar cambios de presentación y modo de revisión; sin operaciones sobre datos.

## Constitución

| Principio | Cumplimiento |
| --- | --- |
| I | Spec y decisiones antes de código. |
| II | RF/US → AC → T → EV en verification.md. |
| III | No modifica inventario/reservas ni tiempos del servidor. |
| IV | Servicios y contratos intactos. |
| V | Pruebas, composición auxiliar y limitaciones nativas explícitas. |
| VI | Alcance visual local; 0034 y UAT independientes. |

## Orden y verificación

T-01 composición → T-02 regresión y revisión visual → T-03 tipos/exportaciones/documentación. AC-01/03 se inspeccionan mediante capturas reales de la ruta con datos aislados; AC-02 mediante suite de formulario y edición. Hardware nativo no disponible se declara pendiente, sin simular aceptación.
