# TapCampus · Sockets: guía sencilla para exponer

Fecha de revisión: 16 de noviembre de 2026.

## 01. Qué hace el socket en mi proyecto

TapCampus · Guía sencilla para comprenderlo y explicarlo al profesor.

**La idea que debes recordar:** el backend guarda un cambio, el socket avisa y la pantalla consulta los datos nuevos para mostrarlos.

### Qué problema resolvemos

Imagina que dos personas ven un producto con 3 unidades. Una reserva una. Queremos que la otra vea que ahora quedan 2 sin tener que arrastrar la pantalla para actualizarla. Para enviar ese aviso utilizamos Socket.IO.

### Cuatro palabras que usaremos

| Palabra | Qué significa aquí |
| --- | --- |
| Frontend | La aplicación y las pantallas que ve el usuario. |
| Backend | El servidor que recibe peticiones y gestiona reservas, stock y precios. |
| Base de datos | Donde se guardan las publicaciones, las reservas y el stock. Usamos PostgreSQL. |
| Socket.IO | La biblioteca que comunica al servidor con la app mediante eventos o avisos. |

### Cómo se conectan las dos partes

En el frontend usamos `socket.io-client`. Esta línea inicia la conexión con nuestro backend:

```tsx
const socket = io(API_BASE_URL);
```

`API_BASE_URL` es la dirección del servidor. En el backend, `RealtimeGateway` recibe la conexión y la añade a una sala llamada `feed`:

```tsx
handleConnection(client: Socket) {
  void client.join('feed');
}
```

**La sala es un grupo de conexiones.** Nos permite enviar el mismo aviso a todas las conexiones que están dentro. Su nombre lo elegimos nosotros. Una persona con dos dispositivos puede tener dos conexiones.

Socket.IO puede utilizar WebSocket o HTTP long-polling como medio de comunicación. La biblioteca gestiona esa parte. Para explicar nuestro flujo basta con entender que existe un canal por el que llegan avisos.

**Puedes decir:** “Conectamos la app al servidor y agrupamos las conexiones en una sala llamada feed para avisarles cuando ocurre un cambio”.

## 02. Cómo se envía y recibe un aviso

Un evento tiene un nombre y unos datos que explican qué cambió.

### Ejemplo: cambió el stock

El nombre del evento es `stock_updated`. Sus datos indican qué publicación cambió y cuántas unidades quedan:

```tsx
// Ejemplo: el identificador está abreviado para explicarlo
{
  publicationId: "producto-A",
  newStock: 2
}
```

### emit envía; on escucha

En `RealtimeGateway`, el backend envía el evento así:

```tsx
this.server.to('feed').emit('stock_updated', datos);
```

Se lee: **“Envía a la sala feed un aviso llamado stock_updated con estos datos”**. `this.server` es el servidor de Socket.IO y `datos` representa el objeto del ejemplo.

En el frontend dejamos preparada una función para cuando llegue ese aviso:

```tsx
socket.on('stock_updated', sync);
```

Se lee: **“Cuando llegue stock_updated, ejecuta sync”**. A esto le llamamos escuchar un evento. El nombre debe coincidir en ambos lados.

### Los tres avisos que usamos

| Evento | Cuándo se envía |
| --- | --- |
| stock_updated | Al reservar, cancelar, vencer una reserva, vender una unidad físicamente o editar el stock. |
| publication_expired | Cuando una venta LIVE termina por horario o el vendedor la finaliza. |
| ganga_activated | Cuando se activa una oferta manual o programada. |

Los servicios del backend guardan los cambios y llaman al gateway. El gateway comunica los avisos. Así cada parte tiene una responsabilidad clara.

**Puedes decir:** “El backend usa emit para enviar eventos y el frontend usa on para escucharlos. Cuando llega un evento, ejecutamos una función que actualiza los datos de la pantalla”.

## 03. Una reserva, de principio a fin

Ejemplo: había 3 unidades y un usuario reserva 1.

1. **El usuario confirma el apartado** — La pantalla de detalle envía una petición HTTP al backend: POST /reservations.
2. **El backend crea la reserva y descuenta una unidad** — Las dos operaciones se guardan juntas en la base de datos. Ahora quedan 2.
3. **El backend llama al gateway después de guardar** — El gateway envía stock_updated a las conexiones de la sala feed.
4. **El frontend recibe el aviso** — useMarketplaceSync escucha el evento y llama al refresh de la pantalla.
5. **refresh vuelve a pedir los datos al backend** — En Inicio hace GET /publications. La respuesta ya contiene el stock en 2.
6. **React muestra los datos nuevos** — La pantalla guarda la lista recibida y la tarjeta muestra “2 disponibles”.

### Qué significa refresh

`refresh` es una función que nosotros escribimos para volver a pedir datos. En Inicio, guarda la lista nueva con `setItems(rows)`. Al cambiar esa lista, React actualiza lo que se ve en la pantalla.

**En nuestro proyecto, recibir el aviso provoca otra consulta.** Aunque stock_updated incluye el stock nuevo, el listener no lo copia directamente a la tarjeta: pide a la API la lista actual.

### Tres piezas que conviene distinguir

| Pieza | Qué hace |
| --- | --- |
| RealtimeGateway | Envía los avisos desde el backend. |
| useMarketplaceSync | Escucha los avisos y llama a refresh en el frontend. |
| MarketplaceShell | Organiza el contenedor y la navegación de la pantalla. No hace las consultas. |

**Puedes decir:** “La reserva viaja por HTTP. Después de guardarla y descontar stock, el backend avisa por socket. Las pantallas consultan otra vez y muestran la disponibilidad nueva”.

## 04. Cómo funcionan las ofertas

En la pantalla decimos Oferta. En el código verás el nombre técnico ganga.

### Oferta manual: el vendedor decide cuándo activarla

Al crear o editar una publicación LIVE, el vendedor puede configurar un precio normal de $50 y un precio de oferta de $35. Guardar esa configuración todavía no activa la oferta manual.

1. **El vendedor pulsa Activar oferta y confirma** — Desde Mis ventas, la app envía la petición de activación al backend.
2. **El backend cambia el precio y guarda la oferta** — Conserva $50 como precio anterior, cambia el actual a $35 y marca la oferta activa.
3. **El gateway envía ganga_activated** — Los clientes conectados reciben el aviso y vuelven a consultar la API.
4. **La pantalla muestra la oferta** — El usuario ve $35, el precio anterior tachado y la etiqueta Oferta.

### Oferta programada: el backend espera la hora

También podemos configurar que la oferta comience 15 minutos antes del final. Si la venta termina a las 14:00, la activación queda programada para las 13:45.

Usamos **BullMQ** para crear y ejecutar ese trabajo pendiente, y **Redis** para conservar la cola de trabajos. Un **worker** es la parte del backend que los procesa. La app del vendedor puede estar cerrada.

Cuando el worker ejecuta la activación, el backend guarda el precio nuevo y emite `ganga_activated`. Desde ese punto, el recorrido hacia la pantalla es el mismo que en la oferta manual.

### Si se cambia el horario

El backend programa la nueva hora. Si todavía llega a ejecutarse un trabajo de la programación anterior, compara su hora con la configuración actual y lo descarta si ya no corresponde.

**Puedes decir:** “BullMQ y Redis se encargan de la programación. Cuando se activa la oferta, el socket comunica el cambio para que las pantallas consulten y muestren el precio nuevo”.

Las reservas hechas antes de la oferta conservan su precio. La misma idea de trabajos programados se utiliza para vencer reservas tras 20 minutos y avisar del stock liberado. La hora de ejecución puede demorarse si el worker no está disponible.

## 05. Conexión y recuperación

Qué pasa al cambiar de pantalla, perder internet o volver a la aplicación.

### La conexión acompaña a la pantalla

`useMarketplaceSync` abre la conexión cuando la pantalla tiene el foco, es decir, cuando es la pantalla actual. Al salir, cierra esa conexión con `socket.disconnect()`. Al regresar, vuelve a conectarse y consulta los datos.

| Pantalla conectada | Qué vuelve a consultar con refresh |
| --- | --- |
| Inicio | Las publicaciones con los filtros y la búsqueda actuales. |
| Mis reservas | Las reservas del comprador. |
| Mis ventas | Las publicaciones del vendedor y sus reservas. |
| Detalle de publicación | El producto abierto y las reservas del comprador. |

Cuenta y el formulario de publicación no utilizan este hook. No mantenemos un único socket global abierto desde que la persona inicia sesión.

### Qué pasa si se pierde internet

Socket.IO intenta reconectar. Cuando se establece la conexión, el evento `connect` hace que volvamos a consultar. También consultamos cuando la app regresa a primer plano.

**Un usuario desconectado puede perder avisos.** Nuestro proyecto no guarda un historial de eventos para reenviárselos. Cuando vuelve, recupera el estado actual mediante la API.

### Detalles útiles para responder al profesor

**El stock no se descuenta dos veces al entregar:** ya se descontó cuando se apartó. Por eso confirmar la entrega no emite stock_updated. El vendedor actualiza su pantalla con la respuesta de su petición.

**No todos los cambios tienen un evento propio:** por ejemplo, crear una publicación no emite publication_created. Los otros clientes la verán en una consulta posterior.

**Las acciones privadas usan HTTP y el token del usuario.** Los avisos públicos del socket solo llevan datos del producto, como su identificador, stock o precio; no llevan teléfonos de los usuarios.

**Puedes decir:** “Si se pierde la conexión, recuperamos los datos al volver a conectar. El socket nos avisa, y la API nos entrega el estado actual del sistema”.

## 06. Guion para explicarlo al profesor

Puedes practicar esta explicación con tus propias palabras.

“En TapCampus usamos Socket.IO para que las pantallas reciban avisos cuando cambia el inventario, termina una venta o se activa una oferta.

En el backend tenemos un RealtimeGateway. Cuando la app se conecta, el gateway añade esa conexión a una sala llamada feed. Esa sala nos permite enviar el mismo aviso a todos los clientes conectados.

Por ejemplo, si alguien reserva un producto, primero enviamos la petición al backend por HTTP. El backend guarda la reserva y descuenta una unidad en la base de datos. Después envía el evento stock_updated.

En el frontend, useMarketplaceSync escucha ese evento y ejecuta el refresh de la pantalla. Refresh vuelve a consultar la API. React recibe los datos nuevos y actualiza la tarjeta. Así, si había tres unidades y alguien apartó una, los demás ven que quedan dos.

Para las ofertas programadas utilizamos BullMQ y Redis. Cuando llega el momento y se activa la oferta, el backend guarda el precio y envía ganga_activated. Las pantallas vuelven a consultar y muestran el precio nuevo.

Si se pierde internet, al volver a conectar pedimos los datos actuales otra vez para recuperar los cambios que no vimos”.

### Preguntas que podrían hacerte

| Pregunta | Respuesta breve |
| --- | --- |
| ¿Qué diferencia hay entre HTTP y el socket? | Usamos HTTP para solicitar acciones y consultar datos. El socket nos permite recibir avisos del servidor. |
| ¿Por qué consultar después del aviso? | Para obtener los datos actuales y aplicar el orden y los filtros del servidor. |
| ¿Dónde está guardado el stock? | En PostgreSQL. El gateway comunica el cambio después de guardarlo. |
| ¿El socket activa la oferta programada? | La activa un trabajo del backend. Después el socket avisa del cambio. |

### Archivos para mostrar durante la exposición

**realtime.gateway.ts:** sala feed y envío de eventos (Backend/src/realtime).

**use-marketplace-sync.ts:** conexión y escucha (Frontend/src/hooks).

**homePage.tsx:** refresh y lista visible (Frontend/src/app/(tabs)).

**reservations.service.ts:** reserva y cambio de stock (Backend/src/reservations).

**jobs.service.ts:** ejecución de trabajos programados (Backend/src/jobs).

Fuentes: [Socket.IO](https://socket.io/docs/v4/) · [Salas](https://socket.io/docs/v4/rooms/) · [Entrega de eventos](https://socket.io/docs/v4/delivery-guarantees/) · [Trabajos diferidos de BullMQ](https://docs.bullmq.io/guide/jobs/delayed).

Guía basada en el código local revisado el 16/11/2026. Las cantidades y los horarios son ejemplos para explicar el funcionamiento. No se modificó la aplicación para elaborar este documento.
