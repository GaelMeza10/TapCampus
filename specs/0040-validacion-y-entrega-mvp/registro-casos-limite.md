# TapCampus — Registro de casos límite

Estado: Sin ejecutar | Plan: [casos-limite.md](casos-limite.md)

Esta es una plantilla. No contiene resultados observados ni evidencia de aprobación. Crear una copia por sesión/plataforma y adjuntar una ficha por variante; conservar este modelo como referencia.

La ejecución parcial del 2026-11-21 está en [resultados-casos-limite.md](resultados-casos-limite.md). Las filas Pendiente siguientes son el modelo para nuevas sesiones; no sustituyen ese informe.

## Identificación de la sesión

| Dato | Valor por completar |
| --- | --- |
| Identificador / fecha / responsable | — |
| Modelo / dispositivo físico o emulador | — |
| SO y versión / escala de texto / orientación | — |
| Expo Go y versión o build/versión instalada | — |
| Commit del frontend / commit o versión de API | — |
| Origen de API de pruebas / versión BD y Redis | — |
| Red inicial y alteraciones controladas | — |
| Cuentas usadas | Alias A/B/C; sin correos, teléfonos o contraseñas |
| Dataset / estado inicial / recursos faltantes | — |

## Resumen por caso

Estados: **Pendiente**, **Aprobado**, **Fallido**, **Bloqueado**, **No aplica**. «No aplica» requiere justificación de alcance/plataforma; no sustituye «no pudimos ejecutarlo». La configuración portrait no convierte CL-29 en No aplica: se prueba que girar no rompe el estado.

Completar estabilidad y función por separado. El resultado Aprobado exige todas las variantes aplicables de ese caso/plataforma; guardar cada ficha, no sobrescribir el primer fallo al repetir. «—» significa sin evaluación.

| Caso | Estado de ejecución | Estabilidad/recuperación | Función/integridad | Variante, evidencia o incidencia |
| --- | --- | --- | --- | --- |
| CL-01 | Pendiente | — | — | — |
| CL-02 | Pendiente | — | — | — |
| CL-03 | Pendiente | — | — | — |
| CL-04 | Pendiente | — | — | — |
| CL-05 | Pendiente | — | — | — |
| CL-06 | Pendiente | — | — | — |
| CL-07 | Pendiente | — | — | — |
| CL-08 | Pendiente | — | — | — |
| CL-09 | Pendiente | — | — | — |
| CL-10 | Pendiente | — | — | — |
| CL-11 | Pendiente | — | — | — |
| CL-12 | Pendiente | — | — | — |
| CL-13 | Pendiente | — | — | — |
| CL-14 | Pendiente | — | — | — |
| CL-15 | Pendiente | — | — | — |
| CL-16 | Pendiente | — | — | — |
| CL-17 | Pendiente | — | — | — |
| CL-18 | Pendiente | — | — | — |
| CL-19 | Pendiente | — | — | — |
| CL-20 | Pendiente | — | — | — |
| CL-21 | Pendiente | — | — | — |
| CL-22 | Pendiente | — | — | — |
| CL-23 | Pendiente | — | — | — |
| CL-24 | Pendiente | — | — | — |
| CL-25 | Pendiente | — | — | — |
| CL-26 | Pendiente | — | — | — |
| CL-27 | Pendiente | — | — | — |
| CL-28 | Pendiente | — | — | — |
| CL-29 | Pendiente | — | — | — |
| CL-30 | Pendiente | — | — | — |
| CL-31 | Pendiente | — | — | — |
| CL-32 | Pendiente | — | — | — |
| CL-33 | Pendiente | — | — | — |
| CL-34 | Pendiente | — | — | — |
| CL-35 | Pendiente | — | — | — |
| CL-36 | Pendiente | — | — | — |
| CL-37 | Pendiente | — | — | — |
| CL-38 | Pendiente | — | — | — |
| CL-39 | Pendiente | — | — | — |
| CL-40 | Pendiente | — | — | — |
| CL-41 | Pendiente | — | — | — |
| CL-42 | Pendiente | — | — | — |
| CL-43 | Pendiente | — | — | — |

## Ficha por ejecución o variante

Copiar este bloque por intento. Para casos de texto/número, anotar el valor exacto; para permisos, la decisión del SO; para interrupción de red, la etapa en la que ocurrió.

| Campo | Registro |
| --- | --- |
| Ejecución / caso / variante / intento | — |
| Actor y pantalla | — |
| Precondiciones y estado inicial | — |
| Datos introducidos y pasos exactos | — |
| Resultado esperado del plan | — |
| Resultado observado y mensaje literal | — |
| Inicio / fin de espera / duración | — |
| Estabilidad y recuperación observadas | — |
| Datos confirmados antes/después: stock, cantidad de filas, precio y plazo | — |
| Resultado de estabilidad / resultado funcional | — |
| Recuperación intentada y resultado | — |
| Evidencia mínima anonimizada / tipo nativo, web o API | — |
| Incidencia / severidad / feature de corrección | — |
| Reprueba: ejecución vinculada, versión nueva y resultado | — |

## Cierre de sesión de prueba

- Casos/variantes ejecutados: —
- Estabilidad aprobada / fallida: —
- Función aprobada / fallida: —
- Pendientes / bloqueados / no aplicables justificados: —
- S1/S2/S3 abiertos y sus enlaces: —
- Plataformas comprobadas y plataformas pendientes: —
- Referencia desde 0040 EV-02/EV-03 a esta sesión: —
- Dictamen y siguiente acción: —

No escribir «todo aprobado» si falta una variante, un dispositivo o una evidencia. Una plataforma sin probar sigue pendiente. «Sin cierres observados» se limita a las ejecuciones registradas.
