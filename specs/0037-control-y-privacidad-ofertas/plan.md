# 0037 — Plan técnico

Estado: Ejecutado técnicamente; aceptación nativa pendiente | Especificación: spec.md

Resultado 2026-11-21: AC-01..06 aprobados con pruebas actuales; AC-07 aprobado en contratos, Jest, exports y revisión auxiliar, pendiente de recorrido nativo. El patrón completo de errores 0034 no se implementa en este bloque: se ajustan únicamente controles y mensajes de ofertas. Se conservan segundos/milisegundos originales del horario cuando no cambia el campo visible, evitando reprogramaciones accidentales al editar título/stock. Ajustes de los verificadores y resultados en verification.md.

## Repositorio y diseño

1. AC-01: reproducir el TS2339 de Backend/src/auth/update-profile.spec.ts y estrechar la respuesta por presencia de sellerContact antes de la aserción. Conservar comprobación del contacto actualizado y ejecutar tsc completo; no cambiar tipos de producción solo para complacer al test.
2. AC-02/07: separar selección/serialización pública y del propietario en publication.select.ts y sus consumidores en PublicationsService. No tomar la presencia de un campo o un id del cliente como autorización. Tipos PublicPublication y OwnedPublication en Frontend/src/services/marketplace.ts; myPublications/savePublication/actions usan propietario y feed/detail usan público. Revisar todo uso de Publication y fixtures para no depender de campos retirados.
3. AC-03/04/06: UpdatePublicationDto admite null solo en los tres campos de configuración; CreatePublicationDto conserva rechazo de null. Validación del estado combinado dentro de la transacción en publications.service.ts: distinguir omitido, retirada completa, cambio de modo y configuración parcial. Comparar Prisma Decimal, no float; comprobar precio/mínimo cuando se crean o modifican esos valores. Preservar edición ajena de ganga activa o legado. Añadir comprobación del mínimo válido en activateGanga antes de escribir.
4. AC-04/05: conservar el bloqueo FOR UPDATE común; escribir toda configuración o retirada en un commit y llamar QueueService tras commit con los datos persistidos. Usar modelo Prisma completo para encolar, sin depender de una proyección pública recortada. Retirada o cambio a manual invalida semánticamente jobs anteriores aunque permanezcan en Redis; eliminar jobs solo como optimización. Reconciliación tampoco debe reconstruir una oferta retirada.
5. AC-05/06: verificar expectedAt, modo y configuración actual en worker bajo bloqueo. Mantener eventos postcommit y reservas con precio fijado. Datos antiguos iguales: no activar/emitir una oferta sin reducción; exponer al propietario el error corregible, sin reparar registros en silencio.
6. AC-03/04/07: formulario publication/edit.tsx permite Sin oferta/Manual/Programada antes de activar. Construye nulls explícitos al retirar/cambiar a manual y cambios mínimos en PATCH; vista activa permanece bloqueada. Mensajes junto a precio/configuración, borrador conservado y botones bloqueados durante envío. Integrar el patrón de errores de 0034, evitando dos refactors simultáneos del mismo formulario.

## Datos, compatibilidad y reversión

Sin migración prevista: columnas actuales ya son nullable. Inventariar solo metadatos/configuraciones de fixtures antes de cambios; ningún seed ni corrección masiva sobre datos reales. La retirada pública de campos exige actualizar backend, frontend, fixtures y verificadores de fase2/phase3 de forma coordinada; no mantener la filtración por compatibilidad. Un cliente antiguo que carece de gestión nueva sigue leyendo price/is_ganga_active. Revertir solo el cambio específico a partir de un diff conservado; nunca restablecer toda la carpeta con cambios previos del usuario. Revalidar datos creados con nuevos contratos antes de volver a código antiguo.

## API y permisos

Rutas existentes, sin endpoint nuevo. GET público recortado; mine JWT propio completo. PATCH configuración: 400 estructura/precio/fecha, 401 sin JWT, 403 ajeno, 404 inexistente, 409 estado incompatible. Retirada completa es idempotente mientras siga editable; no altera reservas. Se mantiene ganga_activated {publicationId,newPrice} y formato decimal de dos posiciones.

## Constitución

| Principio | Aplicación |
| --- | --- |
| I | AC y contratos preceden al código. |
| II | RF-02/07/11/12 y RNF-01/02 → US-02/05/06 → AC-01..07 → T → EV. |
| III | Bloqueo compartido, carreras reales y precios reservados inmutables. |
| IV | Proyecciones distintas, JWT/propiedad y null explícito acordados. |
| V | Tipos, Jest, HTTP/SQL/Redis y móvil con resultados separados. |
| VI | Sin nuevos módulos comerciales, pagos o cambios visuales ajenos. |

## Verificación y orden

T-01 → T-02 → T-03 → T-04 → T-05 → T-06. Backend: tsc completo y de producción sin incremental, npm.cmd test -- --runInBand, npm.cmd run lint; Frontend: tsc --noEmit y npm.cmd test -- --watch=false. Extender verificadores HTTP/SQL reales para omisión de campos, decimales, cambios de modo y carreras. Usar BD aislada y BULLMQ_PREFIX exclusivo; detener solo el worker de prueba. Comprobar manual→programada→manual→sin oferta, igualdad de precio, legado activo y reservas antes/después; exports Android/iOS acreditan empaquetado JS, no aceptación física. En raíz check-sdd y diff --check. Toda evidencia funcional queda pendiente hasta ejecutarse.
