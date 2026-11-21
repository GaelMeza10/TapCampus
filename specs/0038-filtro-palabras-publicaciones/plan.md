# 0038 — Plan técnico

Estado: Ejecutado técnicamente; aceptación nativa pendiente | Especificación: spec.md

Resultado 2026-11-21: política pura versionada, validación autoritativa POST/PATCH y contrato de error integrados con recuperación 0034. URL ya subida se reutiliza tras rechazo; servidor no devuelve términos. Sin migración/dependencias nuevas; verificación real en BD aislada y pruebas de regresión en verification.md.

## Diseño y archivos

- AC-01/02/05: crear auxiliar puro de normalización/detección y constante versionada en Backend/src/publications/content-policy.ts, con pruebas positivas parametrizadas por cada entrada y negativas de policy.md. Selección cerrada sin dependencias de terceros, llamadas externas o regex construida con términos sin escapar.
- AC-01/03: integrar una validación de contenido en PublicationsService antes de create y dentro del camino autorizado de update, antes de SQL update. El DTO global valida forma; la política de negocio valida contenido. En POST no escribir publicación/encolar si falla. En PATCH analizar solo title/description recibidos, manteniendo propiedad/estado y transacción existentes.
- AC-01/03/05: BadRequestException con código estable y fields; GlobalExceptionFilter actual conserva campos de la respuesta objeto. Añadir comprobación HTTP de esta forma para no depender únicamente del auxiliar. Mensaje legible en español y sin términos ni contenido completo en logs.
- AC-04: en Frontend/src/services/marketplace.ts interpretar el código y campos sin perder el mensaje estándar. En publication/edit.tsx asociar title/description, mostrar aviso visible usando componentes actuales y mantener borrador y resultado de upload si ya existe. No añadir caché de reservas ni idempotencia de publicaciones que la API no tiene.
- AC-04/05: ejecutar primero el trabajo de errores de 0034, o integrar su implementación con este bloque conservando AC y EV separados. No duplicar el sistema de errores ni el vocabulario en frontend. Revisar fieldErrors del estado actual antes de codificar.

## Modelo, API, compatibilidad y reversión

Sin tablas, migraciones, seed ni revisión retroactiva. POST/PATCH actuales mantienen JWT y permisos. Nuevo rechazo 400 conserva statusCode/message/error y añade code/fields; clientes antiguos muestran message aunque ignoren campos nuevos. El upload ya existente puede quedar sin publicación tras un rechazo, como otros errores actuales: conservar/reutilizar la URL y no borrar archivos que otro registro pudiera referenciar. Limpiar archivos huérfanos no es parte de este feature. Reversión localizada en política/consumidor, conservando datos y cambios previos.

## Riesgos y alcance de validación

Lista excesiva o subcadenas producen falsos positivos: evitar ambos según policy.md. Sin análisis semántico, algunas citas se rechazan y algunas evasiones pasan; no prometer moderación completa. Revisar límites y casos negativos con el vocabulario exacto. No introducir un paquete externo por una normalización pequeña y comprobable.

## Constitución

| Principio | Aplicación |
| --- | --- |
| I | Política exacta y AC antes del código. |
| II | RF-15 → US-12 → AC-01..05 → T → EV, también RF-03/06. |
| III | Rechazo sin alterar inventario/reservas y edición existente transaccional. |
| IV | Autoridad del backend, código HTTP y campos pactados, permisos conservados. |
| V | Casos por entrada, negativos, HTTP y formulario con evidencia separada. |
| VI | Filtro acotado; reportes, sanciones e IA fuera de este cambio. |

## Orden y verificación prevista

T-01 → T-02 → T-03 → T-04 → T-05. Depende de contratos de ofertas 0037 y patrón de error 0034 antes de integrar formulario. Unitarias del auxiliar y HTTP Nest para dos tipos, dos campos y PATCH parcial; integración aislada para demostrar ausencia de fila/jobs en rechazo. Frontend: prueba de error por campo y borrador/foto tras 400, corrección y envío, error de red y duplicación de pulsaciones. Ejecutar tipos, suites y lint apropiados; revisión nativa con teclado/texto ampliado para aviso/foco, check-sdd y diff --check. No se necesitan tiempos de espera reales de 20 minutos para probar un filtro de texto.
