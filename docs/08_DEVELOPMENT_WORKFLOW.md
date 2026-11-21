# Proceso de desarrollo de TapCampus

Esta es la forma de aplicar desarrollo guiado por especificaciones en este repositorio existente. Se inspira en el ciclo **Specify → Plan → Tasks → Implement → Converge** de [GitHub Spec Kit](https://github.com/github/spec-kit/blob/main/docs/index.md), sin exigir la instalación de su CLI. La constitución del proyecto está en `../.specify/memory/constitution.md`.

## 1. Artefactos y autoridad

| Artefacto | Responsabilidad |
| --- | --- |
| `docs/00_DEVELOPMENT_GUIDE.md` | Guía general de apoyo; no sustituye las reglas de producto. |
| `docs/01_PROJECT_OVERVIEW.md` | Problema, objetivos y actores. |
| `docs/02_REQUIREMENTS.md` | Reglas de producto, prioridades `RF/RNF` y alcance. |
| `docs/03_ARCHITECTURE.md` | Restricciones técnicas y contratos compartidos. |
| `docs/04_UI_UX_GUIDELINES.md`, `docs/05_USER_FLOWS.md` | Experiencia visual y secuencia de uso. |
| `docs/06_USER_STORIES_AND_TASKS.md` | Valor de usuario e identificadores `US`. |
| `docs/07_VALIDATION.md` | Estrategia transversal de QA y UAT. |
| `specs/NNNN-slug/` | Fuente de intención y ejecución de **un cambio**. |
| `TASKS.md` | Estado global de fases; no sustituye `tasks.md` del feature. |
| `docs/09_PROJECT_AUDIT.md` | Conflictos y deuda de adopción del repositorio existente. |
| `docs/10_TRACEABILITY.md` | Cobertura de todos los RF/RNF y huecos entre historia, tarea, feature y evidencia. |

Orden de resolución: constitución → requisitos de producto → arquitectura/UX/flujos según la materia → especificación aprobada del cambio → plan → tareas → código. Si dos fuentes del mismo nivel se contradicen, no se elige silenciosamente una; se registra una decisión y se actualizan ambas. El README resume el producto y puede estar atrasado. El estado real se comprueba en código y pruebas; una casilla no demuestra por sí sola que algo funciona.

## 2. Ciclo de un feature

1. **Descubrir.** Elegir un cambio acotado; crear `specs/NNNN-slug/` con las plantillas de `specs/_template/`. Enlazar los `RF/RNF`, `US` y entradas globales de `TASKS.md` que lo motivan. Registrar comportamiento existente si el cambio toca código ya escrito.
2. **Especificar.** Redactar `spec.md` con alcance, exclusiones, reglas, contratos visibles, escenarios `Dado/Cuando/Entonces`, casos límite y criterios `AC-01...`. Abrir las dudas como `DEC-01...` en `decisions.md`. Se permite explorar, pero no pasar a implementación con una decisión abierta que altere el resultado esperado.
3. **Planificar.** Redactar `plan.md`: arquitectura, datos y migraciones, API/eventos, seguridad, compatibilidad, estrategia de pruebas y reversión. Evaluar explícitamente los seis principios de la constitución. Cada elección técnica remite a al menos un `AC` o restricción.
4. **Desglosar.** En `tasks.md`, ordenar tareas pequeñas por dependencia, con identificadores `T-01...`, archivos previstos y criterios `AC` cubiertos. Incluir pruebas, documentación y migración cuando apliquen. Una tarea sin requisito relacionado debe justificar por qué es necesaria.
5. **Implementar y verificar.** Ejecutar tareas, marcar `[x]` solo con evidencia. Registrar en `verification.md` comandos, entorno, resultado y `EV-01...` asociados a cada `AC`. Actualizar `TASKS.md` únicamente cuando se complete el alcance global de la casilla.
6. **Converger.** Revisar si el código cumple cada `AC`, si todos los `AC` tienen evidencia y si contratos/documentos siguen alineados. Si hay huecos, añadir tareas o corregir la especificación y repetir. Cerrar el feature como `Verificado` solo cuando no queden bloqueos ni criterios sin comprobar.

## 3. Puertas de calidad

| Estado | Condición para entrar | Condición para salir |
| --- | --- | --- |
| `Borrador` | Idea y referencias identificadas. | `spec.md` cubre actor, alcance, reglas, negativos y `AC` comprobables; decisiones críticas resueltas. |
| `Especificado` | Especificación revisada. | `plan.md` cubre contratos, riesgos, pruebas, migración y constitución. |
| `Planificado` | Plan coherente con la especificación. | `tasks.md` cubre todos los `AC` con orden y dependencias. |
| `En implementación` | Tareas listas. | Código y pruebas ejecutadas, resultados anotados en `verification.md`. |
| `En verificación` | Evidencia disponible. | Convergencia sin desvíos; cada `AC` tiene `EV` satisfactoria. |
| `Verificado` | Todas las puertas anteriores cerradas. | Un cambio posterior abre una nueva revisión o un nuevo feature. |

`Bloqueado` es una marca adicional cuando una decisión o dependencia impide avanzar. No se convierte en `Verificado` por completar solo la documentación.

## 4. Identificadores, trazabilidad y cambios

Los IDs globales `RF-xx`, `RNF-xx` y `US-xx` permanecen en sus documentos originales; se aceptan sufijos existentes como `RF-05b`. Dentro de cada feature se usan `AC-xx`, `T-xx`, `EV-xx` y `DEC-xx`. `specs/README.md` registra los features y su estado. En `verification.md` se conserva una tabla `AC → T → EV → resultado` que también permite detectar criterios sin implementación.

Una nueva petición o bug se contrasta con la especificación vigente. Si revela una regla omitida, se registra la decisión, se cambia `spec.md` y se revisan contratos, plan, tareas y pruebas antes de modificar código. Los cambios en requisitos compartidos obligan a revisar todos los features que los citan. No se reescribe evidencia histórica para aparentar que una prueba antigua cubrió un requisito nuevo.

## 5. Uso inmediato

`specs/0001-reservas/` a `specs/0008-contacto-whatsapp/` cubren la línea base; el cierre 2026-11-21 contra el plan integral se organiza en 0037–0040 y añade RF-15. `0009-reportes-y-moderacion/` permanece SHOULD opcional con decisiones abiertas. El índice `specs/README.md` registra estados y `docs/10_TRACEABILITY.md` muestra la cobertura por requisito. Para un cambio nuevo: copiar `specs/_template`, asignar el siguiente número, completar los archivos en orden y ejecutar `node scripts/check-sdd.mjs`. El comprobador automatiza consistencia documental básica; revisión semántica y evidencia de ejecución siguen siendo obligatorias.
