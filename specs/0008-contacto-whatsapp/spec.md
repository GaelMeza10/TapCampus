# 0008 — Contacto por WhatsApp

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

## Contexto y fuentes

RF-13, RF-07 y RF-06; US-09 y US-11. `docs/02_REQUIREMENTS.md` exige enlace `wa.me` y retrasa contacto de venta en vivo hasta confirmar reserva; README permite contacto directo para venta estática. `docs/05_USER_FLOWS.md` describe ambas rutas. `User.phone` es obligatorio y su formato se define con 0002.

## Alcance y contrato observable

- Una publicación `STATIC` activa ofrece «Contactar por WhatsApp» desde el detalle sin reserva. El mensaje dice que el comprador está interesado en el artículo, sin afirmar que lo apartó.
- En `LIVE`, el comprador ve el contacto del vendedor **solo después** de recibir confirmación de `POST /reservations`; el vendedor de esa reserva puede contactar al comprador identificado en la reserva. Listado y detalle públicos no incluyen esos teléfonos.
- El móvil usa `Linking.openURL` con `https://wa.me/52XXXXXXXXXX?text=<mensaje-codificado>`; elimina solo el `+` del teléfono canónico `+52XXXXXXXXXX`, sin duplicar `52`. Se aceptan en registro diez dígitos nacionales con o sin `+52` de cualquier región mexicana. Si no puede abrir el enlace, muestra error útil sin perder el estado de la pantalla.
- Fuera de alcance: chat interno, envío automático de mensajes y llamadas.

## Criterios de aceptación

### AC-01 — Venta en vivo protegida
**Dado** una `LIVE` sin reserva confirmada, **cuando** el comprador abre feed/detalle, **entonces** no recibe teléfono ni botón de contacto; tras reserva exitosa aparece el enlace del vendedor correcto.

### AC-02 — Contacto estático directo
**Dado** un artículo `STATIC` activo, **cuando** el comprador abre detalle, **entonces** puede abrir el chat del vendedor sin crear reserva ni temporizador.

### AC-03 — Vendedor con reserva
**Dado** una reserva activa, **cuando** su vendedor ve esa reserva, **entonces** puede contactar a ese comprador; otro vendedor no obtiene su teléfono.

### AC-04 — Enlace correcto y fallo controlado
**Dado** un número válido y un título con espacios/caracteres especiales, **cuando** se toca «Contactar», **entonces** se abre `wa.me` con destinatario y texto correctamente codificados; si no se puede abrir, se muestra error sin cerrar el detalle.

### AC-05 — Formato de teléfono consistente
**Dado** el mismo número mexicano registrado como diez dígitos nacionales o con `+52`, **cuando** se genera el enlace, **entonces** ambos casos apuntan a `wa.me/52XXXXXXXXXX` sin duplicar el prefijo; un número no mexicano es rechazado al registrar.

## Decisiones

Precisión backend fase 3: comprador relacionado recibe sellerContact.phone en POST/mine/detalle de sus reservas; vendedor recibe buyer {id,name} y buyerContact.phone únicamente si ACTIVE y antes de expiresAt. Ajeno →403. Feed/LIVE públicos y eventos no contienen teléfono. Enlaces y apertura móvil siguen fuera de fase 3.

DEC-01 está resuelta junto con 0002 DEC-03. Privacidad/contacto backend verificados; Linking pendiente.
