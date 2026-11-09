# 0022 — Confirmación antes de apartar una unidad

Estado: En verificación; implementación técnica completa, aceptación nativa pendiente | Fecha: 2026-11-06

## Necesidad y fuentes

El usuario detecta en iPhone que «Apartar una unidad» ejecuta la reserva sin confirmar intención. Solicita crear el plan para incorporar un modal previo. Relación: RF-07, RF-13, RNF-01, RNF-02; US-06, US-09; TASKS 5.3/5.15. Fuentes: docs/02/04/05/06/07/08/09/10, constitución y 0001-reservas. Se aplica posteriormente al código, conservando identidad y alcance; no a Figma.

## Línea base y alcance

En `Frontend/src/app/publication/[id].tsx`, los botones de primer apartado y unidad adicional llaman directamente a makeReservation. Existen protección síncrona contra doble envío, clave de idempotencia, resultado de éxito y confirmación para cancelar una reserva. Reutilizar `ConfirmationDialog` de feedback.tsx.

Incluye confirmación de intención para ambas entradas, estados de envío/error y protección frente a cambios de disponibilidad. No añade selector de cantidad, pago, reglas de stock, endpoints o migraciones. Los 20 minutos empiezan al crear la reserva en el servidor; abrir el modal no bloquea inventario. STATIC conserva contacto directo sin apartado.

## Contenido propuesto

- Título: «¿Quieres apartar una unidad?».
- Resumen: nombre del producto, «1 unidad · Precio actual: {precio}» y «Tendrás 20 minutos para recogerla. El precio se fija al confirmarse la reserva.».
- Acción principal: «Sí, apartar»; durante envío: «Apartando…».
- Acción secundaria: «Volver». Cierra este diálogo; no cancela ninguna reserva existente.

El precio mostrado es el último conocido, no una cotización bloqueada por abrir el modal. El contacto protegido solo aparece tras respuesta de reserva confirmada.

## Criterios de aceptación

### AC-01 — Confirmación de intención sin efectos al abrir/cerrar

**Dado** un producto LIVE reservable, **cuando** se pulsa «Apartar una unidad» o «Apartar otra unidad», **entonces** aparece el resumen antes de enviar. Abrir, repetir el toque de apertura, usar Volver o cerrar con el regreso del sistema no llama a reserve ni genera una nueva clave, no inicia plazo y no modifica reservas. Cerrar desde una unidad adicional conserva la confirmación previa visible.

### AC-02 — Envío único y estado ocupado

**Dado** el diálogo abierto y la publicación aún reservable, **cuando** se confirma, **entonces** se envía una sola solicitud por acción, se muestra «Apartando…», se bloquean confirmación, cierre y entradas duplicadas mientras se resuelve. Se conserva la protección síncrona por referencia además del estado de React. Solo el éxito del servidor cierra el diálogo y muestra la reserva, su precio/plazo y contacto autorizado.

### AC-03 — Recuperación e idempotencia

**Dado** un error de red o resultado incierto tras enviar, **cuando** se reintenta, **entonces** se reutiliza la clave original, también si la intención inicial era «Apartar otra unidad». El diálogo conserva contexto y muestra un error recuperable con «Reintentar apartado» y Volver. Cerrar/reabrir no convierte un intento incierto en una nueva unidad. Tras éxito, una nueva unidad confirmada recibe otra clave; cancelar antes de enviarla conserva las existentes.

Si un refresco devuelve 404 para el detalle después de un envío incierto (p. ej. última pieza), el reintento conserva ID de publicación/clave del intento ya enviado y puede recuperar la respuesta idempotente. No se genera una solicitud nueva usando un producto desaparecido. Al cambiar de ruta/producto no se arrastra una intención anterior.

### AC-04 — Disponibilidad y precio mientras se confirma

**Dado** un diálogo abierto antes del primer envío, **cuando** se detecta agotamiento, fin de horario o publicación no disponible, **entonces** se informa y se impide iniciar ese apartado. Se revalida la disponibilidad conocida al confirmar; el servidor sigue siendo autoridad y un 409 muestra agotamiento/no disponibilidad sin éxito local. Si llega un cambio de precio conocido, se actualiza el resumen con aviso y se exige volver a confirmar el precio revisado antes de enviar. No se promete proteger el precio contra una carrera posterior no observable por el cliente; sigue RF-07.

STATIC no muestra este diálogo ni usa reserve. No se revela WhatsApp LIVE antes de éxito. Los errores generales o 409 no alteran reservas previas ni habilitan envíos duplicados.

### AC-05 — Consistencia, accesibilidad y adaptación

**Dado** texto largo, tipografía ampliada o lector de pantalla, **cuando** se abre/cierra el modal, **entonces** el contenido es desplazable y legible, respeta safe areas, el foco entra en el diálogo y vuelve al activador al cerrar si sigue disponible; se anuncia el estado/error y el fondo no se recorre con el lector. Se conservan Inter, colores y componentes existentes, acciones claras y áreas táctiles del sistema. Verificar en iPhone y automatizar los estados que se puedan reproducir; capturas web no acreditan interacción nativa.

## Decisiones y estado

Plan aprobado por el usuario: «aplica el plan». Decisiones en decisions.md. La evidencia de esta ampliación se registra en verification.md sin cambiar resultados históricos de 0001.
