# TapCampus · Recorrido de sockets, stock y ofertas

Fecha de revisión: 16 de noviembre de 2026.

## 01. Sockets en TapCampus

Guía para programadores · Del cambio en PostgreSQL al cambio que ve el usuario.

**La idea central:** el backend confirma un cambio, emite un aviso y la pantalla vuelve a consultar la API. React recibe nuevos datos y actualiza los componentes.

1. **Acción del usuario o trabajo programado** — Reservar, cancelar, vender o activar una oferta.
2. **Servicio de NestJS + transacción en PostgreSQL** — Valida las reglas y confirma el cambio en la base de datos.
3. **RealtimeGateway → Socket.IO → useMarketplaceSync** — Viaja un evento pequeño: cambió stock, terminó una venta o se activó una oferta.
4. **refresh() → GET por HTTP → setState()** — La pantalla consulta datos actuales y React vuelve a renderizar.

### Qué utilizamos y para qué

| Pieza | Responsabilidad en este proyecto |
| --- | --- |
| Socket.IO | Conecta backend y cliente; transporta eventos y permite reconexión. |
| NestJS + gateway | Expone el canal de eventos y agrupa conexiones en la sala feed. |
| Prisma + PostgreSQL | Guarda reservas, stock y precios con transacciones y bloqueos. |
| BullMQ + Redis | Programa expiraciones y activación automática de ofertas. |
| Axios + React / Expo | Consulta la API, guarda el resultado en estado y muestra la interfaz. |

### Qué es un socket, explicado brevemente

En este contexto, es la conexión de comunicación entre la app y el servidor. **WebSocket** es un protocolo que permite mantener ese canal abierto. **Socket.IO** es la biblioteca que usamos por encima y puede transportar sus mensajes mediante WebSocket o HTTP long-polling. No es intercambiable con un cliente WebSocket puro. [S1]

Lectura sugerida: conexión (p. 2–3), refresh (p. 4), stock (p. 5–6), ofertas (p. 7–8), pantalla y recuperación (p. 9–10), depuración y fuentes (p. 11–12). Basado en el código local revisado el 16 de noviembre de 2026.

## 02. Dónde nace la conexión

El backend prepara el gateway; el frontend inicia cada conexión cuando la pantalla toma el foco.

### 1. NestJS registra e inicia el gateway

`main.ts` crea `AppModule` y ejecuta `app.listen(...)`. Los módulos de publicaciones y reservas importan `RealtimeModule`, que registra y exporta `RealtimeGateway`. Nest inyecta ese gateway en los servicios que emiten eventos. Al no indicar otro puerto en el decorador, comparte el servidor HTTP de la API. [S4]

```tsx
@WebSocketGateway({
  cors: { origin: origins },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    void client.join('feed');
  }
}
```

`@WebSocketServer()` recibe de Nest la instancia de servidor Socket.IO. `handleConnection()` se ejecuta cuando entra un cliente y lo une a **feed**, una sala del servidor para difundir los mismos avisos a las conexiones suscritas. La sala no es una tabla, una cola de Redis ni la lista visual del feed. [S2]

### 2. El cliente abre el canal

```tsx
// Frontend/src/hooks/use-marketplace-sync.ts
const socket = io(API_BASE_URL);
```

`API_BASE_URL` procede de `EXPO_PUBLIC_API_URL` o de un valor local de respaldo. Axios utiliza la misma constante. Así, las peticiones REST y Socket.IO apuntan al mismo backend. Se usan el namespace `/` y el path predeterminado `/socket.io/`; la biblioteca negocia el transporte.

| Evento emitido | Datos que viajan |
| --- | --- |
| stock_updated | { publicationId, newStock } |
| publication_expired | { publicationId } |
| ganga_activated | { publicationId, newPrice } · precio como cadena decimal |

El gateway actual distribuye datos públicos, sin JWT en esta conexión y sin contactos personales. Las mutaciones y las consultas privadas se autorizan por REST/JWT. Redis se usa aquí para BullMQ; no hay un adaptador Redis de Socket.IO configurado.

Código: Backend/src/main.ts:6 · Backend/src/realtime/realtime.gateway.ts:15 · Backend/src/realtime/realtime.module.ts:3 · Frontend/src/hooks/use-marketplace-sync.ts:7

## 03. Del foco al listener

useMarketplaceSync centraliza la conexión; cada pantalla le entrega la consulta que quiere ejecutar.

```tsx
// Extractos reales del hook compartido
const current = useRef(refresh);
current.current = refresh;

useFocusEffect(useCallback(() => {
  let mounted = true;
  const sync = () => {
    if (mounted) void current.current();
  };
  if (initialSync.current || focused.current) sync();
  focused.current = true;
  const socket = io(API_BASE_URL);

  for (const event of [
    'connect', 'stock_updated',
    'publication_expired', 'ganga_activated',
  ]) socket.on(event, sync);
  // AppState y limpieza se explican abajo.
}, []));
```

### Cómo leer estas líneas

**current:** guarda la versión más reciente de `refresh`. Si cambian los filtros o el producto, los listeners siguen llamando a la consulta actual sin recrearse en cada render. Cambiar un ref no vuelve a renderizar la pantalla. [S6]

**useFocusEffect:** activa este bloque cuando la ruta tiene el foco. La conexión se cierra al perderlo o desmontarse. Al regresar se crea otra conexión; este hook no implementa un único socket global para toda la aplicación. [S5]

**socket.on(event, sync):** registra qué función se ejecutará al recibir el evento. `sync` ignora el payload y llama a la API mediante `refresh`; no aplica `newStock` ni `newPrice` directamente.

**connect:** se dispara al conectar, también después de una reconexión. Vuelve a consultar el estado actual. **AppState active:** hace lo mismo al volver la app a primer plano.

**Qué significa `false` en `useMarketplaceSync(refresh, false)`:** omite la llamada inicial directa del hook. Inicio y detalle ya cargan desde sus propios efectos. El evento `connect` sigue llamando a `refresh`, por lo que puede haber otra consulta inicial. Al volver a enfocar, el hook también reconsulta.

**Limpieza:** el retorno cambia `mounted` a `false`, retira el listener de `AppState` y ejecuta `socket.disconnect()`. Evita nuevos disparos desde esa conexión; no cancela automáticamente un HTTP que ya estaba en curso. `void` indica que no se espera la promesa en ese callback.

Código: Frontend/src/hooks/use-marketplace-sync.ts:7

## 04. Qué significa refresh

Es una función que escribe el programador para volver a pedir datos. MarketplaceShell contiene la interfaz.

### Tres nombres que conviene distinguir

| Nombre | Qué hace realmente |
| --- | --- |
| MarketplaceShell | Envuelve children en SafeAreaView y coloca BottomNavigation. No abre sockets ni define refresh. |
| useMarketplaceSync | Escucha eventos, foco y primer plano; llama a la función recibida. |
| refresh de cada pantalla | Ejecuta GET, aplica la respuesta al estado y gestiona carga y errores. |

```tsx
// Esquema de composición, simplificado
const refresh = useCallback(async () => {
  const rows = await listPublications(type, zoneId, categoryId, q);
  setItems(rows);
}, [type, zoneId, categoryId, q]);

useMarketplaceSync(refresh, false);

return (
  <MarketplaceShell active="explore">
    <FlatList
      data={visibleItems}
      onRefresh={() => void refresh()}
      refreshing={refreshing && !loading}
    />
  </MarketplaceShell>
);
```

Este ejemplo resume la estructura; el código real además controla errores, filtros y concurrencia. `useCallback` conserva la identidad de la función mientras sus dependencias no cambian: **no la ejecuta** por sí mismo. [S7]

### Lo que añade el refresh real de Inicio

**1.** Incrementa `generation.current` y guarda el número de esa consulta. **2.** Enciende `loading` para la carga inicial o `refreshing` para una actualización. **3.** Llama a `listPublications(...)` con tipo, zona, categoría y búsqueda vigentes.

**4.** Si esa consulta sigue siendo la más reciente, ejecuta `setItems(rows)` y limpia el error. **5.** En `finally` apaga la carga correspondiente. Una respuesta de una consulta anterior se ignora para evitar que sustituya los resultados nuevos.

**refresh ≠ refreshing ≠ onRefresh.** `refresh` es la función; `refreshing` es un booleano de estado; `onRefresh` es la prop de la lista que responde al gesto de recarga. El socket y el gesto terminan llamando a la misma función.

Código: Frontend/src/components/marketplace-shell.tsx:30 · Frontend/src/app/(tabs)/homePage.tsx:76 · Frontend/src/services/marketplace.ts:43

## 05. stock_updated: de 3 a 2

Ejemplo: un comprador confirma apartar una unidad y otra persona está mirando el mismo producto.

1. **El comprador confirma el apartado** — PublicationDetail.makeReservation() llama a reserve(publicationId, key).
2. **Viaja una petición REST autenticada** — POST /reservations lleva publicationId, Bearer JWT e Idempotency-Key.
3. **ReservationsController valida y llama al servicio** — La clave debe ser UUID; create() recibe publicación, comprador y clave.
4. **La transacción bloquea y modifica PostgreSQL** — Bloquea comprador/publicación, valida stock y horario, crea reserva y descuenta 1.
5. **Después del commit nace stock_updated** — create() llama events.stockUpdated(publicationId, 2), solo si la reserva es nueva.
6. **El gateway difunde a la sala feed** — server.to('feed').emit(...) llega a los sockets conectados.
7. **El listener llama sync() y luego refresh()** — Inicio vuelve a ejecutar GET /publications con los filtros actuales.
8. **La respuesta cambia el estado de React** — setItems(rows) → visibleItems → FlatList → PublisherCard: “2 disponibles”.

```tsx
// Mensaje público de ejemplo; UUID abreviado solo para explicar
evento:  stock_updated
payload: { publicationId: "producto-A", newStock: 2 }
```

**El viaje hacia el servidor es REST; el aviso que sale es Socket.IO.** El frontend receptor después hace otro GET. No se descuenta inventario en `MarketplaceShell` ni en el listener. El dato que finalmente pinta la tarjeta procede de la respuesta de la API.

El comprador que hizo la operación también recibe su respuesta HTTP. Su detalle incorpora la reserva confirmada y llama a `refresh()` de forma explícita. Por eso su propia pantalla tiene una vía de actualización además del aviso público.

El evento se emite y luego se intenta encolar la expiración de 20 minutos antes de devolver la respuesta HTTP. Otro cliente puede ver el stock nuevo antes de que el comprador reciba su respuesta. El orden esencial es confirmar la transacción antes de emitir.

Código: Backend/src/reservations/reservations.service.ts:57 · Backend/src/realtime/realtime.gateway.ts:15 · Frontend/src/app/(tabs)/homePage.tsx:76 · Frontend/src/app/publication/[id].tsx:69

## 06. Stock: cancelar, vencer y vender

El mismo evento nace en varios caminos; no toda transición de una reserva cambia el stock disponible.

| Acción | Cambio confirmado | Aviso emitido |
| --- | --- | --- |
| Reserva nueva | current_stock − 1; crea ACTIVE con unit_price fijado. | stock_updated |
| Cancelar como comprador | ACTIVE → CANCELLED; current_stock + 1. | stock_updated |
| Vencer tras 20 minutos | ACTIVE → EXPIRED; current_stock + 1. | stock_updated |
| Venta física LIVE | current_stock − 1 bajo bloqueo de publicación. | stock_updated |
| Editar stock | Emite solo si current_stock cambió. | stock_updated |
| Confirmar entrega | ACTIVE → COMPLETED; no vuelve a descontar stock. | Sin evento de stock |

### Quién hace vencer una reserva

1. **QueueService.reservation()** — Encola expire en reservation_queue para reserved_at + 20 minutos.
2. **Redis conserva el trabajo de BullMQ** — JobsService crea el worker al arrancar el backend; procesa cuando corresponde.
3. **ReservationsService.resolve(id, 'EXPIRED')** — Relee, bloquea filas y comprueba ACTIVE y vencimiento antes de devolver stock.
4. **Commit → stockUpdated() → socket → refresh()** — Se difunde la nueva disponibilidad y las pantallas vuelven a consultar.

### Tres detalles que explican el comportamiento

**Última unidad:** con stock 0 la API excluye el producto del feed LIVE. Cuando vuelve una unidad, reaparece si sigue ACTIVE y dentro del horario; devolver stock no reactiva una publicación finalizada.

**Reintento con la misma clave:** `create()` devuelve la reserva existente, con HTTP 200. No crea otra, no vuelve a descontar y no emite otro `stock_updated`. Una reserva nueva responde 201; stock insuficiente devuelve 409.

**Entrega completada:** el vendedor actualiza su pantalla con la respuesta REST y su `refresh()` explícito. En el código actual, otro dispositivo del comprador no recibe un aviso específico de entrega completada; actualizará al reenfocar, reconectar, recargar o recibir otro evento.

Código: Backend/src/reservations/reservations.service.ts:160 · Backend/src/reservations/reservations.service.ts:57 · Backend/src/jobs/queue.service.ts:82 · Backend/src/jobs/jobs.service.ts:35

## 07. Oferta manual: de $50 a $35

“Ganga” es el nombre técnico que aparece en eventos y campos; la interfaz la presenta como “Oferta”.

### Primero se guarda la configuración

En `publication/edit.tsx`, el vendedor elige precio normal, precio de oferta y modo. `submit()` construye el payload y `savePublication()` envía POST al crear o PATCH al editar. Guardar una configuración manual todavía no activa la oferta.

```tsx
// Campos de ejemplo dentro de una publicación LIVE
{
  price: 50,
  ganga_min_price: 35,
  ganga_activation_mode: "MANUAL"
}
```

El backend valida que sea LIVE, que exista modo y que el mínimo no supere al precio. STATIC no admite ganga. `create()` guarda y llama a `queue.publication()` para el cierre; no emite `ganga_activated` solo por crear esta configuración.

### Después el vendedor pulsa Activar oferta

1. **Mis ventas abre la confirmación y ejecuta run()** — publicationAction(id, 'ganga') envía PATCH /publications/:id/ganga con JWT.
2. **PublicationsController.ganga() → activateGanga()** — Valida dueño, LIVE, ACTIVE, horario vigente, mínimo y modo MANUAL.
3. **La transacción bloquea la publicación** — Guarda precio anterior, asigna precio de oferta y marca is_ganga_active.
4. **Después del commit emite ganga_activated** — El resto de clientes reconsulta; el vendedor aplica la respuesta y refresca.

```tsx
// Actualización real de los tres campos principales
data: {
  price_before_ganga: p.price,
  price: p.ganga_min_price!,
  is_ganga_active: true
}
// Después de esperar la transacción:
this.events.gangaActivated(id, result.price.toFixed(2));
```

**Qué ve el usuario:** precio actual $35, anterior $50 tachado, ahorro $15 y etiqueta Oferta. Las reservas ya creadas conservan su `unit_price`; solo los apartados nuevos usan el precio nuevo. Una oferta ya activa no puede reconfigurar precio, mínimo, modo ni minutos.

Código: Frontend/src/app/publication/edit.tsx:313 · Frontend/src/app/(tabs)/sales.tsx:165 · Backend/src/publications/publications.service.ts:371 · Frontend/src/components/publication-price.tsx:17

## 08. Oferta programada y reprogramación

La activación vive en el backend. No depende de que el vendedor deje abierta la aplicación.

**Ejemplo:** una venta termina a las 14:00 y la oferta debe comenzar 15 minutos antes. El formulario guarda `ganga_activation_mode: SCHEDULED`, `ganga_min_price: 35` y `ganga_minutes_before: 15`. La hora calculada es **13:45**; la programación debe ser válida dentro del horario.

```tsx
// QueueService.publication(p), resumido
const at = endAt - p.ganga_minutes_before * 60000;
await this.enqueue(
  this.gangas, 'activate', `${p.id}-${at}`, at,
  { publicationId: p.id, expectedAt: at },
);
// enqueue utiliza: delay = Math.max(0, at - Date.now())
```

1. **Se guarda o edita la publicación** — PublicationsService llama queue.publication() después de guardar.
2. **BullMQ conserva un job diferido en ganga_queue** — El ID incluye publicación y hora; expectedAt conserva la programación esperada.
3. **El worker de JobsService procesa activate** — Llama activateGanga(publicationId, undefined, expectedAt).
4. **El servicio relee y bloquea la publicación** — Exige modo SCHEDULED, hora alcanzada, venta vigente y programación coincidente.
5. **Commit → ganga_activated → GET → nuevo precio visible** — Es la misma actualización final de precio y render que en la oferta manual.

### Qué pasa si se cambia el horario

Si el fin cambia a 14:30, la oferta pasa a 14:15 y se encola el job correspondiente. El job antiguo puede seguir en Redis. Cuando despierte con `expectedAt = 13:45`, `activateGanga()` compara esa hora con la programación actual; si no coincide, no activa ni emite.

### Qué pasa ante reinicios o jobs repetidos

`JobsService` crea los workers al arrancar y ejecuta conciliación al inicio y, por defecto, cada 30 segundos. Revisa PostgreSQL, intenta resolver lo vencido y recupera trabajos. Una publicación ya finalizada o una oferta ya activa no vuelve a activarse. El enqueue configura cinco intentos con espera exponencial.

Un job diferido queda disponible al alcanzar la hora; su ejecución puede demorarse según disponibilidad y carga del worker. Los temporizadores de la UI solo dibujan el tiempo y solicitan lecturas; no activan ofertas ni mutan inventario. [S3]

Código: Backend/src/jobs/queue.service.ts:82 · Backend/src/jobs/jobs.service.ts:35 · Backend/src/publications/publications.service.ts:371

## 09. Del estado al píxel

Recibir el evento inicia el recorrido de lectura. Cada pantalla decide qué datos necesita consultar.

| Pantalla | Su refresh consulta | Estado que cambia |
| --- | --- | --- |
| Inicio | GET /publications con type, zoneId, categoryId y q. | setItems(rows) |
| Mis reservas | GET /reservations/mine con JWT. | setRows(result) |
| Mis ventas | GET /publications/mine y reservas de cada publicación LIVE. | setSales(rows) |
| Detalle | GET /publications/:id y /reservations/mine; filtra las de ese producto. | setItem / setReservations |

### Cómo se vuelve visible en Inicio

**1.** Axios entrega las publicaciones y el servicio adapta sus URLs de imagen. **2.** `setItems(rows)` pide a React otro render. **3.** La pantalla vuelve a calcular `visibleItems`, descartando LIVE agotadas o fuera de horario. **4.** `FlatList` recibe ese array en `data` y pasa cada `item` a `PublisherCard`.

**5.** La tarjeta lee `current_stock`, `price` e `is_ganga_active`. `PublicationPrice` dibuja el precio actual, el anterior y el ahorro cuando corresponde. Aunque `PublisherCard` use `memo`, la consulta entrega objetos nuevos y las props modificadas permiten actualizar su contenido.

Cuando la oferta se activa, el backend además ordena el listado por `is_ganga_active` descendente y luego por fecha e ID. La nueva consulta puede cambiar la posición de la tarjeta, además de su precio. El evento por sí solo no reordena un array local.

### Disparadores de la misma lectura

| Disparador | Efecto |
| --- | --- |
| Tres eventos de negocio | El listener ejecuta sync → refresh. |
| connect / reconexión | Reconsulta lo que pudo cambiar durante la desconexión. |
| Volver a la ruta o a primer plano | Recupera estado mediante foco o AppState. |
| Gesto, reintento o acción propia | La pantalla llama a refresh explícitamente. |
| Filtros, búsqueda o reloj | Efectos de la pantalla solicitan datos en los casos implementados. |

No hay un GET del feed cada segundo: el reloj local actualiza la cuenta regresiva y dispara una lectura al detectar un vencimiento. La espera de 300 ms de búsqueda pertenece al texto escrito, no limita los eventos del socket. Cuenta y el formulario no consumen useMarketplaceSync.

Código: Frontend/src/app/(tabs)/homePage.tsx:76 · Frontend/src/app/(tabs)/reservations.tsx:37 · Frontend/src/app/(tabs)/sales.tsx:165 · Frontend/src/app/publication/[id].tsx:69 · Frontend/src/components/Publisher_Card.tsx:11

## 10. Recuperación y límites actuales

La API recupera el estado completo; un evento es un aviso de cambio y no un historial persistente.

### Qué ocurre cuando algo falla

**Se pierde la conexión:** los cambios ocurridos mientras el cliente está desconectado no tienen replay configurado aquí. Socket.IO intenta reconectar y el listener `connect` pide el estado vigente. También se reconsulta al volver a primer plano. [S8]

**El GET falla:** se muestra un error. Inicio conserva publicaciones anteriores durante un fallo de actualización y ofrece reintento; eso puede mantener información antigua visible hasta una lectura exitosa. El socket no modifica por sí mismo esos datos.

**Hay varias consultas simultáneas:** `generation` o `sequence` permiten aceptar solo la respuesta de la consulta más reciente. Las peticiones anteriores siguen viajando; este contador no es un cancelador HTTP ni garantiza entrega de eventos.

**Redis está temporalmente caído:** encolar puede fallar después de que SQL ya se confirmó. El código registra el fallo y la conciliación recupera el trabajo desde PostgreSQL. Eso recupera jobs; no convierte los eventos Socket.IO en mensajes persistentes.

### Detalles del código que conviene conocer

| Situación | Comportamiento implementado |
| --- | --- |
| Evento de otro producto | También provoca refresh: el callback no filtra por publicationId. |
| Muchos eventos seguidos | Pueden causar varios GET. No hay agrupación ni debounce del socket. |
| Confirmación de entrega | No emite evento de stock ni un evento privado de reserva completada. |
| Crear una publicación | create() guarda y encola; no hay publication_created. |
| Editar solo texto/precio o vender STATIC | No hay aviso dedicado de esos cambios para otros clientes. |
| Caída tras commit y antes de emitir | No hay outbox transaccional; una lectura posterior recupera estado. |
| Varias instancias de backend | El código revisado no configura un adaptador compartido de Socket.IO. |

**Consecuencia práctica:** tiempo real funciona para los eventos implementados y las pantallas enfocadas. Otros cambios se ven en la siguiente lectura por foco, reconexión, gesto o acción. Esta guía describe el comportamiento actual; no propone cambios al sistema.

Código: Frontend/src/hooks/use-marketplace-sync.ts:7 · Backend/src/publications/publications.service.ts:121 · Backend/src/reservations/reservations.service.ts:160 · Backend/src/jobs/queue.service.ts:82

## 11. Recorrido guiado para depurar

Coloca breakpoints siguiendo estas funciones. Usa dos sesiones y un producto de prueba.

### Caso A · seguir stock_updated

| Paso / punto de observación | Qué mirar |
| --- | --- |
| 1. Detalle → makeReservation() | publicationId, clave de idempotencia y respuesta de reserve(). |
| 2. ReservationsService.create() | Stock leído bajo bloqueo, created y stock devueltos por la transacción. |
| 3. RealtimeGateway.stockUpdated() | publicationId y newStock emitidos después de la transacción. |
| 4. Hook → sync() | Evento recibido con la pantalla enfocada y callback current.current. |
| 5. Inicio → refresh() | Número de generation, filtros y filas devueltas por listPublications. |
| 6. PublisherCard | item.current_stock nuevo o retirada de la tarjeta si quedó en cero. |

### Caso B · seguir una oferta

**Manual:** confirma el payload configurado en el editor; en Mis ventas sigue `run()` → `publicationAction()` → `PublicationsController.ganga()` → `activateGanga()`. Inspecciona `price_before_ganga`, `price` e `is_ganga_active`, luego `gangaActivated()` y el `refresh()` del otro cliente.

**Programada:** observa `at` y `expectedAt` al encolar; espera el job en `ganga_queue` y entra al worker. Sigue `activateGanga(id, undefined, expectedAt)`. Si no activa, revisa modo, horario, estado, si ya está activa y si la hora coincide con la configuración vigente.

### Cómo localizar un corte en el recorrido

| Síntoma | Punto que conviene comprobar |
| --- | --- |
| No llega connect | Origen API accesible desde el dispositivo, servidor y negociación /socket.io/. |
| SQL cambió, no llegó evento | Método emisor, sala feed y que exista un evento para esa operación. |
| Llega evento, no cambia tarjeta | Que salga el GET, su respuesta, el contador de consulta y filtros de visibilidad. |
| La oferta no corre a su hora | Redis, worker, job, conciliación y validaciones de activateGanga(). |

En la versión web puedes inspeccionar Network: conexión Socket.IO y luego GET /publications. En el dispositivo usa el depurador de React Native y breakpoints del backend. Escucha frames con un cliente Socket.IO compatible, no con un WebSocket puro. Los ejemplos de esta guía no ejecutaron reservas ni alteraron datos.

Código: Backend/src/reservations/reservations.service.ts:57 · Backend/src/publications/publications.service.ts:371 · Frontend/src/hooks/use-marketplace-sync.ts:7 · Frontend/src/app/(tabs)/homePage.tsx:76

## 12. Mapa del código y fuentes

Las líneas corresponden a la copia local revisada. B = Backend/src; F = Frontend/src.

| Archivo:línea | Responsabilidad |
| --- | --- |
| B/main.ts:6 | Arranque |
| B/realtime/realtime.gateway.ts:15 | Emisión y sala |
| B/realtime/realtime.module.ts:3 | Registro del gateway |
| B/reservations/reservations.service.ts:57 | Crear reserva |
| B/reservations/reservations.service.ts:160 | Resolver reserva |
| B/publications/publications.service.ts:121 | Crear publicación |
| B/publications/publications.service.ts:371 | Activar oferta |
| B/jobs/queue.service.ts:82 | Encolar programación |
| B/jobs/jobs.service.ts:35 | Workers y conciliación |
| F/hooks/use-marketplace-sync.ts:7 | Conexión y listeners |
| F/app/(tabs)/homePage.tsx:76 | Refresh del feed |
| F/app/(tabs)/reservations.tsx:37 | Refresh de reservas |
| F/app/(tabs)/sales.tsx:165 | Acción del vendedor |
| F/app/publication/[id].tsx:69 | Refresh del detalle |
| F/app/publication/edit.tsx:313 | Guardar configuración |
| F/components/marketplace-shell.tsx:30 | Contenedor visual |
| F/services/marketplace.ts:43 | Peticiones REST |
| F/services/api.ts:5 | JWT e instancia HTTP |
| F/components/Publisher_Card.tsx:11 | Stock y distintivo |
| F/components/publication-price.tsx:17 | Precio y ahorro |

### Fuentes oficiales complementarias

[S1] [Socket.IO: qué es y transportes](https://socket.io/docs/v4/)

[S2] [Socket.IO: salas y difusión](https://socket.io/docs/v4/rooms/)

[S3] [BullMQ: trabajos diferidos](https://docs.bullmq.io/guide/jobs/delayed)

[S4] [NestJS: gateways](https://docs.nestjs.com/websockets/gateways)

[S5] [Expo Router SDK 58: useFocusEffect](https://docs.expo.dev/versions/v58.0.0/sdk/router/)

[S6] [React: useRef](https://react.dev/reference/react/useRef)

[S7] [React: useCallback](https://react.dev/reference/react/useCallback)

[S8] [Socket.IO: garantías de entrega](https://socket.io/docs/v4/delivery-guarantees/)

Alcance: lectura del código local al 16/11/2026, incluida la copia de trabajo sin commit. Se contrastaron conceptos con documentación oficial. Los recorridos y cantidades son ejemplos didácticos; no representan una nueva ejecución de integración, ni certifican aceptación en dispositivos. No se modificó la lógica de la aplicación para elaborar este reporte.
