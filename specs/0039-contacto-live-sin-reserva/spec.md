# 0039 — Contacto LIVE antes de reservar

Estado: En verificación; implementación técnica aprobada, aceptación nativa pendiente | Fecha: 2026-11-21

## Contexto y fuentes

RF-06, RF-07, RF-13; US-09, US-11; TASKS 5.6 y 5.30. Plan integral secciones 3.2/3.5, petición de cerrar diferencias y docs02/03/04/05/07/08. Sustituye la restricción de contacto previo del vendedor de 0008; no cambia la privacidad del comprador. La línea base solo añadía sellerContact en detalle STATIC y permitía LIVE tras reserva; la ejecución técnica amplía el detalle visible y el cliente conforme a este contrato. Evidencia y límites en verification.md.

## Alcance

Incluye contacto de consulta desde detalle LIVE visible sin reservar, mantenimiento de contacto desde reserva aunque el detalle desaparezca, contacto de comprador reservado solo para vendedor relacionado y regresión STATIC. Excluye chat propio, envío automático, contacto de espectadores, listados públicos de teléfonos, modificación de dominio/teléfono y reservas de STATIC. Depende de las proyecciones públicas/propietario de 0037.

## Contratos y reglas

- GET /publications/:id, con la misma visibilidad pública existente, añade sellerContact:{phone:"+52XXXXXXXXXX"} tanto para LIVE como STATIC. No requiere una reserva ni introduce una guarda nueva en este endpoint ya público.
- GET /publications y eventos Socket.io continúan sin teléfonos. No añadir teléfono a la relación seller pública general ni a mine por defecto.
- LIVE futura, agotada, vencida, finalizada u oculta continúa devolviendo 404 desde detalle; no crear una excepción para obtener contactos de publicaciones no visibles. El comprador con reserva conserva contacto mediante sus rutas autorizadas.
- Botón previo en LIVE utiliza mensaje de interés, sin afirmar reserva; reutiliza whatsappUrl/openWhatsApp con reserved:false. Desde una reserva usa reserved:true y publicationTitle del apartado.
- Contactar no crea reserva, no inicia plazo, no descuenta stock ni envía mensajes sin intervención de quien abre WhatsApp.
- Vendedor solo ve buyerContact para su reserva ACTIVE no vencida. Espectadores y otras cuentas no se identifican ni exponen por abrir el detalle.
- Si falla Linking.openURL, mensaje recuperable y pantalla/borrador de apartado intactos. Durante envío de reserva se bloquea una acción de contacto que interrumpa la confirmación. Tras cambio de visibilidad, no ofrecer nuevas acciones sobre un detalle invalidado.
- Mantener acción principal Apartar y contacto como secundaria visible según docs04; no rediseñar el detalle.

## Criterios de aceptación

### AC-01 — Consulta previa LIVE
**Dado** LIVE visible sin reserva, **cuando** se abre detalle y se pulsa Contactar, **entonces** se obtiene el teléfono actual del vendedor y un enlace de consulta correcto sin crear reserva ni cambiar stock.

### AC-02 — Límite de exposición
**Dado** feed/eventos, publicación no visible y acceso a reservas de terceros, **cuando** se consultan, **entonces** no se exponen contactos fuera del contrato; detalle no visible devuelve 404 y reserva ajena 403.

### AC-03 — Privacidad del comprador
**Dado** una visita sin reserva o una reserva activa/terminal, **cuando** el vendedor u otra cuenta consulta reservas, **entonces** el teléfono del comprador solo se entrega al vendedor relacionado mientras está activa y no vencida; no existe listado de espectadores.

### AC-04 — Enlace, fallo y continuidad
**Dado** títulos con caracteres especiales y teléfono canónico, **cuando** se abre consulta previa, contacto STATIC o contacto desde reserva, **entonces** número/texto codificados son correctos para cada contexto; fallo conserva pantalla y una reserva sigue contactable tras desaparecer el detalle.

### AC-05 — Aceptación nativa
**Dado** comprador/vendedor en el dispositivo objetivo, **cuando** prueban consulta previa y contacto posterior, **entonces** WhatsApp abre el destinatario correcto, no se duplica el prefijo ni se afirma una reserva inexistente y se registra plataforma/versión.

## Decisiones

DEC-01/02 resueltas en decisions.md. La nueva exposición es una decisión del plan integral autorizado, no una regresión accidental respecto al contrato anterior.
