# 0034 — Errores visibles en Nueva publicación

Estado: En verificación; implementación técnica aprobada, aceptación nativa pendiente | Fecha: 2026-11-21

## Contexto y alcance

RF-03/RF-06/RF-11; US-03/US-04/US-05; TASKS 5.4. Fuentes: docs02/04/05/06/07/08/09/10, constitución y formulario `Frontend/src/app/publication/edit.tsx`. Petición original: plan para que las alertas no queden al final del formulario. Ejecución 2026-11-21 autorizada como dependencia de 0038; implementación técnica aprobada, con aceptación nativa pendiente en verification.md.

Línea base observada antes de implementar: `error` se dibujaba al final del ScrollView. Foto, zona y categoría compartían un mensaje genérico; horario, oferta, permisos, catálogos y fallos de guardado también usaban ese estado. Solo se devolvía un error por intento y `change` borraba cualquier error global. Esta ejecución sustituye ese patrón por estados específicos y validación conjunta.

Incluye Nueva publicación LIVE/STATIC y compatibilidad con Editar, que comparte la pantalla; errores de campos, permisos/imagen, catálogos y guardado; configuración de oferta dentro de su hoja. Excluye cambios de reglas de negocio, API, migraciones, nuevas librerías y rediseño de otras pantallas.

## Criterios de aceptación

### AC-01 — Aviso visible sin buscarlo

Al pulsar Publicar con datos inválidos, mostrar un aviso compacto debajo del encabezado, fuera del ScrollView: «Revisa los campos señalados», con acción «Ir al primer campo». Debe seguir visible al desplazar el formulario y desaparecer cuando no queden errores. Los fallos generales muestran ahí su explicación y recuperación pertinente. Sin alerta modal ni aviso que desaparezca por tiempo. Texto flexible, sin truncarlo; el formulario y Publicar siguen utilizables con teclado y texto ampliado.

### AC-02 — Mensajes específicos junto al origen

Validar todos los campos aplicables en el mismo intento y mostrar mensajes debajo de foto, título, descripción, precio, stock, zona, categoría, inicio/fin y oferta según corresponda. Ejemplos: «Añade una foto del producto», «Selecciona una zona» y «Selecciona una categoría». Conservar las reglas actuales: stock de creación mayor que cero, edición no negativo, precio válido, fin futuro posterior al inicio y restricciones de oferta. STATIC no valida horario/stock/oferta. Antes de validar no mostrar errores de campos vacíos.

### AC-03 — Corrección guiada sin perder datos

Precisión 2026-11-21: seguir el orden visual vigente de 0036: foto, título, descripción, categoría, precio, stock, zona, inicio, fin, oferta. Sustituye la enumeración histórica siguiente, que colocaba categoría después de zona; no se reordena el formulario aprobado.

Tras un intento inválido, desplazar al primer error según el orden visual: foto, título, descripción, precio, stock, zona, categoría, inicio, fin, oferta. Mostrar el mensaje tras actualizar el layout y enfocar su input o control sin abrir paneles automáticamente. «Ir al primer campo» repite esa navegación. Corregir un campo actualiza su error y los errores dependientes ya mostrados; conserva los demás, el texto, imagen y selecciones. Cambiar de tipo limpia errores que dejan de aplicar y revalida la categoría reiniciada si ya se intentó enviar. No subir imagen ni guardar mientras haya errores locales.

### AC-04 — Errores de acciones y paneles en contexto

Permisos, formato/tamaño y selección de imagen muestran explicación junto a Foto; si la hoja sigue abierta, también dentro de ella. Carga de zonas/categorías muestra error en su selector/hoja con reintento del catálogo correspondiente. Un fallo general de envío aparece en el aviso visible, conserva borrador y no se elimina al escribir en otro campo. Reintentar catálogos no recarga la publicación ni pierde cambios. No reenviar automáticamente la creación. La hoja de oferta presenta sus errores visibles dentro de la hoja y junto al campo responsable; los errores de oferta detectados al publicar señalan el control de oferta del formulario.

### AC-05 — Accesibilidad, regresión y evidencia

Anunciar el resultado del intento sin múltiples anuncios simultáneos por cada campo; asociar mensaje y control con los mecanismos disponibles en Expo/React Native. No depender solo del rojo; conservar texto/icono. Respetar safe areas, teclado y movimiento reducido. Probar creación LIVE/STATIC, edición, correcciones múltiples, errores de red/catálogos/foto/oferta y éxito sin doble envío. Separar pruebas automatizadas, capturas auxiliares y aceptación nativa de foco/lector/teclado/texto ampliado. Ningún criterio se cierra con evidencia solo planificada.

## Decisiones

Sin decisiones de producto bloqueantes; dirección y límites en `decisions.md`. Se aplicaron reglas de oferta de 0037 y error por campos de 0038, conservando los AC y evidencia propios de este patrón. Aceptación nativa pendiente; no requiere repetir la autorización ya dada para el cierre MVP.
