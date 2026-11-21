# 0008 — Contacto por WhatsApp

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

Ejecución 2026-11-21: [0039](../0039-contacto-live-sin-reserva/verification.md) aprueba técnicamente consulta previa LIVE/STATIC, URL/error y continuidad/privacidad con nueva evidencia. Apertura nativa sigue pendiente; los resultados de fases anteriores conservan su alcance histórico.

## Contexto y fuentes

RF-13, RF-07 y RF-06; US-09 y US-11. Revisión 2026-11-21: el plan integral permite consulta previa desde detalle LIVE visible, especificada en [0039](../0039-contacto-live-sin-reserva/spec.md). Se mantiene contacto STATIC directo y desde reservas autorizadas; privacidad del comprador intacta. Las EV anteriores de ausencia de teléfono en detalle LIVE pertenecen al contrato histórico y no acreditan la ampliación. `User.phone` es obligatorio y su formato se define con 0002.

## Alcance y contrato observable

- Una publicación `STATIC` activa ofrece «Contactar por WhatsApp» desde el detalle sin reserva. El mensaje dice que el comprador está interesado en el artículo, sin afirmar que lo apartó.
- En `LIVE`, el comprador puede consultar al vendedor desde el detalle visible antes de reservar (0039); tras reserva mantiene su contacto autorizado aunque desaparezca el detalle. El vendedor solo obtiene el teléfono del comprador mediante una reserva activa no vencida relacionada. Listado/eventos no incluyen teléfonos.
- El móvil usa `Linking.openURL` con `https://wa.me/52XXXXXXXXXX?text=<mensaje-codificado>`; elimina solo el `+` del teléfono canónico `+52XXXXXXXXXX`, sin duplicar `52`. Se aceptan en registro diez dígitos nacionales con o sin `+52` de cualquier región mexicana. Si no puede abrir el enlace, muestra error útil sin perder el estado de la pantalla.
- Desde una reserva `LIVE`, el mensaje usa `publicationTitle` autorizado y sigue disponible aunque desaparezca el detalle. Para consulta previa LIVE o STATIC usa título del detalle visible y texto de interés sin afirmar reserva.
- Fuera de alcance: chat interno, envío automático de mensajes y llamadas.

## Criterios de aceptación

### AC-01 — Contacto LIVE con privacidad del comprador
**Dado** una `LIVE` visible sin reserva, **cuando** el comprador abre detalle, **entonces** puede consultar al vendedor sin reservar y sin exponer su propio teléfono; feed/eventos siguen sin contactos y una reserva confirmada conserva su enlace. Criterio actualizado y aprobado técnicamente en 0039, con apertura nativa pendiente.

### AC-02 — Contacto estático directo
**Dado** un artículo `STATIC` activo, **cuando** el comprador abre detalle, **entonces** puede abrir el chat del vendedor sin crear reserva ni temporizador.

### AC-03 — Vendedor con reserva
**Dado** una reserva activa, **cuando** su vendedor ve esa reserva, **entonces** puede contactar a ese comprador; otro vendedor no obtiene su teléfono.

### AC-04 — Enlace correcto y fallo controlado
**Dado** un número válido y un título con espacios/caracteres especiales, **cuando** se toca «Contactar», **entonces** se abre `wa.me` con destinatario y texto correctamente codificados; si no se puede abrir, se muestra error sin cerrar el detalle.

### AC-05 — Formato de teléfono consistente
**Dado** el mismo número mexicano registrado como diez dígitos nacionales o con `+52`, **cuando** se genera el enlace, **entonces** ambos casos apuntan a `wa.me/52XXXXXXXXXX` sin duplicar el prefijo; un número no mexicano es rechazado al registrar.

## Decisiones

Precisión histórica backend fase 3: comprador relacionado recibe sellerContact.phone en POST/mine/detalle de sus reservas; vendedor recibe buyer {id,name} y buyerContact.phone únicamente si ACTIVE y antes de expiresAt. Ajeno →403. En esa fase feed/LIVE públicos/eventos no contenían teléfono. 0039 sustituye solo la ausencia en detalle LIVE visible; enlaces/apertura móvil conservan evidencia separada.

DEC-01 está resuelta junto con 0002 DEC-03. Privacidad/contacto backend verificados; Linking pendiente.
