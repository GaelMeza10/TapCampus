# 0038 — Filtro de palabras en publicaciones

Estado: En verificación; implementación técnica aprobada, aceptación nativa pendiente | Fecha: 2026-11-21

## Contexto y fuentes

RF-03, RF-06, RF-15; US-03, US-04, US-12; TASKS 5.29 y 5.4. Plan integral sección 4 y priorización MVP; respuesta del usuario 2026-11-21: «groserías, términos despectivos, etc., analízalo». La selección conservadora del vocabulario se delega al agente; lista exacta versionada en policy.md. Fuentes adicionales: docs02/03/04/05/07/08, constitución, 0034 y auditoría GAP-11. La línea base carecía de filtro; ejecución técnica aprobada con evidencia en verification.md y aceptación nativa pendiente.

## Alcance

Incluye título y descripción de LIVE y STATIC en creación y cambios de texto, validación autoritativa en servidor y recuperación móvil sin perder el formulario. Incluye groserías/insultos claros y una lista acotada de sustancias/objetos del plan original. Excluye clasificación IA, OCR de imágenes, inferencias sobre identidad, fuzzy matching, moderación humana, reportes automáticos, sanciones y barrido retroactivo de publicaciones.

## Reglas y contratos

- Comparación determinista por tokens/frases completos de policy.md v1; normalización insensible a mayúsculas y acentos vocálicos, preservando ñ. Signos y espacios separan tokens; frase coincide en tokens consecutivos del mismo campo. No concatenar título y descripción para formar una frase.
- No usar subcadenas: computadora/computación/disputa no coinciden con puta/puto. No bloquear identidades, colores ni homónimos ambiguos por sí solos. Leetspeak y faltas deliberadas quedan fuera de esta barrera inicial.
- POST /publications valida ambos campos antes de crear fila/encolar; PATCH valida solo campos de texto suministrados. Cambiar título no revalida una descripción histórica no enviada y viceversa. Cambios de stock/precio sin texto no se bloquean por contenido histórico. No modificar texto guardado para censurarlo silenciosamente.
- Rechazo 400 con {statusCode:400,error:"Bad Request",code:"PUBLICATION_CONTENT_BLOCKED",message:["Se detectó una palabra ofensiva o no permitida, modifícala si deseas crear la publicación"],fields:["title" y/o "description"]}. fields usa nombres de campo, no incluye términos detectados ni la lista completa. En edición el mensaje se adapta a «guardar la publicación».
- Sin sesión se mantiene 401; en edición se comprueba propiedad/estado antes de analizar texto (403 ajeno, 404 inexistente, 409 no editable). Un rechazo no cambia stock, reservas ni genera eventos/jobs.
- El móvil conserva foto local o URL ya subida, título, descripción, horario, catálogos y configuración. Muestra aviso visible y errores en los campos indicados; tras corregir permite reenvío expreso. No navegar a éxito ni borrar el borrador por 400.
- No es necesario descargar el vocabulario al móvil; servidor decide. No prometer detección infalible ni afirmar que reportes/moderación ya están implementados.

## Criterios de aceptación

### AC-01 — Bloqueo en creación
**Dado** un término/frase de la política en título o descripción de LIVE/STATIC, **cuando** se crea por HTTP directo, **entonces** responde 400 con código/campos y no crea publicación ni job.

### AC-02 — Coincidencia precisa
**Dado** variantes en mayúsculas/acentos, palabras completas, plurales explícitos y términos legítimos de policy.md, **cuando** se comparan, **entonces** se bloquean solo entradas completas de la lista; los ejemplos legítimos siguen publicándose.

### AC-03 — Edición y permisos
**Dado** publicación existente, **cuando** su propietario cambia un texto a contenido bloqueado, **entonces** se rechaza sin cambios; stock sin texto sigue funcionando y otro usuario recibe el rechazo de permisos antes de analizar contenido.

### AC-04 — Recuperación del formulario
**Dado** un rechazo de contenido, **cuando** vuelve el resultado a la app, **entonces** el aviso y campos afectados son visibles, se conserva todo el borrador/foto y se puede corregir y reenviar sin duplicado por pulsaciones durante envío.

### AC-05 — Política trazable y regresión
**Dado** la lista v1, **cuando** se ejecutan pruebas de normalización y contratos, **entonces** todas las entradas tienen casos positivos, los falsos positivos previstos tienen casos negativos y auth/reservas/ofertas/catálogos siguen funcionando sin moderación nueva.

## Decisiones

DEC-01..03 resueltas en decisions.md a partir de la respuesta del usuario y del plan original; cualquier ampliación del vocabulario posterior debe incluir ejemplos negativos y nueva evidencia.
