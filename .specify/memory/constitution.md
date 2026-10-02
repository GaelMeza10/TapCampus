# Constitución de TapCampus

Versión: 1.0.0 | Fecha: 2026-10-01

## I. La intención se define antes de implementar

Cada cambio funcional comienza en `specs/NNNN-nombre/spec.md`: necesidad, alcance, escenarios observables, criterios de aceptación identificados y casos límite. La especificación describe **qué** debe ocurrir; `plan.md` describe **cómo**. No se declara lista una especificación que contenga una decisión de producto abierta que afecte a sus criterios.

## II. Trazabilidad y fuente de verdad

La cadena obligatoria es requisito `RF/RNF` → historia `US` → criterio `AC` → tarea `T` → evidencia `EV`. Se conserva el identificador al cambiar un texto y no se reutilizan identificadores retirados. Ante conflictos, se registra la discrepancia en `docs/09_PROJECT_AUDIT.md` y se resuelve antes de implementar el comportamiento afectado. Las decisiones aprobadas se incorporan al requisito y a la especificación; un README o el código existente no sustituyen esa decisión.

## III. Integridad de inventario y reservas

Las reglas de los 20 minutos, propiedad de publicaciones, transiciones de reserva, stock no negativo y concurrencia se especifican con escenarios de éxito, rechazo y carrera. La autoridad sobre tiempos y stock es el servidor. Toda operación que cambia stock y reserva debe ser atómica e idempotente ante reintentos cuando corresponda. La interfaz refleja el estado confirmado por el servidor.

## IV. Contratos entre capas y seguridad

Antes de programar dos capas conectadas se acuerdan rutas, cuerpos, respuestas, códigos de error, eventos Socket.io y permisos. Ningún dato de contacto protegido se revela antes de la condición documentada. JWT, hash de contraseñas y validación `@uabc.edu.mx` se verifican en el servidor. El plan explica migraciones, compatibilidad y recuperación si cambia un contrato existente.

## V. Evidencia antes de cerrar

Cada criterio `AC` tiene al menos una comprobación `EV` con resultado y referencia reproducible. Las tareas solo se marcan terminadas cuando el comportamiento está implementado y verificado. La revisión de convergencia compara especificación, plan, tareas, código y pruebas; los desvíos generan tareas o cambios de especificación. `TASKS.md` refleja el avance global, sin reemplazar las tareas detalladas de cada feature.

## VI. Alcance y cambios

Se prioriza el MVP definido en `docs/02_REQUIREMENTS.md`. GPS y pagos digitales quedan fuera de alcance. Si cambia una regla después del plan, se actualiza primero el requisito y la especificación, después el plan, tareas, comprobaciones y código afectado. Toda excepción a esta constitución se documenta como decisión con motivo, impacto y fecha.

## Gobierno

Esta constitución rige todos los features nuevos y las modificaciones funcionales. El flujo, plantillas, estados y criterios de entrada y salida se definen en `docs/08_DEVELOPMENT_WORKFLOW.md`. Una enmienda cambia la versión y registra qué artefactos existentes deben revisarse.
