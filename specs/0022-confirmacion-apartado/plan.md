# 0022 — Plan de implementación

Estado: Planificado | Especificación: spec.md

## Secuencia y arquitectura

1. **Separar intención de ejecución** (AC-01/02). En `publication/[id].tsx`, sustituir ambas llamadas directas por apertura de una intención de apartado. Mantener estado propio del nuevo diálogo separado de confirmId, que corresponde a cancelar una reserva existente. No borrar successId al abrir un apartado adicional. Colocar el diálogo fuera de la rama detalle/éxito para que un refresco no lo desmonte accidentalmente.
2. **Reutilizar el diálogo existente** (AC-01/05). Usar `ConfirmationDialog`, con resumen de producto, unidad, precio y plazo. Conservar los tokens y diseño actuales. Si se necesitan propiedades adicionales para deshabilitar confirmación sin mostrar carga o cambiar el texto de carga, agregarlas opcionales en feedback.tsx y conservar los valores por defecto para sus otros usos. No crear un segundo sistema de modales. Verificar foco accesible y retorno al activador; ajustar solo lo necesario.
3. **Controlar el ciclo del intento** (AC-02/03). Separar intención nueva, intento enviado y reintento. Generar UUID al primer envío explícitamente confirmado, no al abrir. Guardar ID de publicación/clave de un envío incierto independientemente del item refrescado. Mantener el candado síncrono reservationBusy y pending; cerrar solo después de éxito. No pasar newAction=true de nuevo al reintentar una unidad adicional. Conservar contexto de la reserva anterior al volver sin enviar.
4. **Disponibilidad y recuperación** (AC-03/04). Antes de un envío nuevo, comprobar canReserve con tiempo actual y datos conocidos. Integrar cambios recibidos por useMarketplaceSync y el reloj existente: mostrar indisponibilidad o cambio de precio dentro del modal. Para precio conocido diferente del resumen aceptado, actualizarlo y pedir otra confirmación, sin POST en ese toque. Distinguir un reintento idempotente ya enviado de una solicitud nueva: la desaparición del detalle no debe impedir resolver el primero. Mantener errores en el diálogo y los resultados confirmados de otras reservas. Descartar intención al cambiar de producto.
5. **Pruebas y convergencia** (AC-01..05). Adaptar pruebas de reserva y fixture visual al paso adicional; ejecutar tipos, suite, revisión visual y recorrido iPhone. Registrar evidencia y actualizar documentación compartida solo como comportamiento implementado cuando corresponda.

## Estados previstos

`Cerrado → Revisando → Enviando → Éxito`.

Desde Revisando: Volver → Cerrado, sin solicitud. Precio actualizado → Revisando con aviso y nueva confirmación. Sin disponibilidad → mensaje y cierre, sin iniciar solicitud nueva. Desde Enviando: error recuperable → Revisando/reintento con la misma clave; éxito → resultado actual del servidor. Mientras Enviando no hay cierre ni segundo envío. Volver tras error no borra una clave incierta.

## Contratos, datos y seguridad

Sin backend, paquetes nuevos o migraciones. Se conserva `POST /reservations`, JWT e Idempotency-Key; el servidor valida horario/stock, fija precio y fecha, resuelve concurrencia e informa 409. No hay stock optimista, temporizador iniciado por el modal ni contacto LIVE anticipado. El modal solo protege intención; no sustituye el bloqueo transaccional existente.

## Validación prevista

- `reservation-screen.test.tsx`: ambas aperturas sin reserve/UUID, cierre sin efectos, confirmación única con promesa pendiente, éxito, error/reintento con misma clave, unidad adicional con clave nueva solo tras confirmación, incertidumbre con detalle 404 y regresión de cancelación de reserva existente.
- Cambios conocidos durante el diálogo: stock cero, fin por reloj, precio actualizado y 409 posterior; STATIC continúa contacto directo.
- `feedback.tsx`: si se amplía su API, comprobar compatibilidad de confirmación de cancelación/entrega y que el cierre no actúa con busy.
- Fixture visual: añadir paso «Sí, apartar» antes de esperar éxito y capturar modal normal, título largo, error y carga. Revisión auxiliar a 320/390/430; verificar accesibilidad/foco y cierre en iPhone con Expo Go y texto ampliado.
- `Frontend`: tsc, Jest y exportación iOS/Android si hay cambios de API de componentes. Raíz: check-sdd y diff --check. No repetir estrés backend al conservar el contrato.

## Riesgos y reversión

Riesgos: confundir Volver con cancelar una reserva, perder la clave en reintentos de otra unidad, refresco que oculte la última pieza, y cambio de precio entre diálogo y POST. Mitigar con estados separados, contexto estable y pruebas anteriores. Reversión: revertir únicamente los cambios de esta feature en pantalla/componente/pruebas; no tocar datos ni servicios iniciados para el iPhone.

## Constitución

I: especificación y plan previos. II: RF/US → AC/T/EV en este expediente y docs10. III: 20 minutos, precio fijado, stock e idempotencia conservados. IV: API y privacidad sin cambios. V: no cerrar con pruebas planificadas ni usar navegador como hardware. VI: confirmación acotada al apartado LIVE; sin funciones adicionales.
