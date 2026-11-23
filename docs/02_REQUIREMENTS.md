# Especificación de Requerimientos de Software (TapCampus)

0047 aprobado (2026-11-22): STATIC se presenta como **Productos**, con ayuda de compra y entrega por acuerdo; códigos LIVE/STATIC conservados. Puede elegirse **Punto de entrega por acordar dentro del campus** o una zona concreta; LIVE siempre requiere una zona. Las reservas nuevas guardan el punto de recogida y lo muestran con producto, unidad, precio fijado, plazo y vendedor; los históricos sin instantánea muestran la ubicación actual como referencia. Se rechaza cambiar la zona LIVE mientras existan reservas vigentes. Stock cero sale inmediatamente de disponibles con aviso y datos conservados; no significa que todas las unidades estén vendidas definitivamente. Logout requiere confirmación, sin bloquear la expiración automática de sesión. Catálogo canónico: seis categorías de alimentos LIVE y diez de productos por cada modalidad (26 filas), conservando identidades y datos originales.

Histórico 0046 (ampliado por 0047): RF-05c usaba doce categorías (seis por tipo) y las cinco zonas vigentes. Se agregan Desayunos/Panadería a LIVE y Arte y Dibujo/Audio y Accesorios a STATIC, conservando categorías e IDs anteriores. Las denominaciones son taxonomía del marketplace, no un catálogo oficial universitario. Perfil de demostración separado, ficticio y aditivo; [guía](11_DELIVERY_GUIDE.md).

Precisiones de validación 0045 (2026-11-22): RF-02 exige nombre con contenido útil; registro normaliza espacios igual que edición y rechaza espacios/tabulaciones/NBSP con 400 antes de crear usuario. No se añaden límites nuevos de longitud. Los errores de interfaz distinguen credenciales, conexión, permiso y fallos técnicos; una carga fallida no confirma un vacío. [Evidencia](../specs/0045-errores-y-datos-adversos/verification.md).

Este documento detalla los requerimientos funcionales (RF) y no funcionales (RNF) del sistema TapCampus. Se utiliza una priorización basada en el modelo **MoSCoW** (Must have, Should have, Could have, Won't have).

Reconciliación 2026-11-21 con el plan integral del usuario: cierre anticipado y cancelación son MUST; se incorpora RF-15 y contacto LIVE previo a reservar. Ofertas, filtro, contacto y validación se planifican en 0037–0040. Esta revisión define el comportamiento objetivo; no acredita implementación ni reemplaza evidencia histórica.

---

## 1. Requerimientos Funcionales (RF)

### Módulo de Autenticación y Cuentas
*   **RF-01: Registro con Dominio Exclusivo [MUST]**
    *   **Descripción:** El sistema deberá validar que el correo ingresado termine estrictamente en `@uabc.edu.mx` para permitir la creación de la cuenta.
    *   **Criterios de Aceptación:** 
        *   Si un usuario intenta registrarse con un dominio diferente (ej. `@gmail.com`), el sistema deberá mostrar un error y bloquear el registro.
        *   No se requerirá código de verificación vía email; la validación por cadena de texto del dominio es suficiente.
*   **RF-02: Perfil de Usuario [MUST]**
    *   **Descripción:** El sistema deberá requerir de manera obligatoria el ingreso de Nombre, Correo, Contraseña y Teléfono durante el registro.
    *   **Criterios de Aceptación:**
        *   Si falta alguno de los 4 campos, el botón de registro estará deshabilitado.
        *   El teléfono puede ser de cualquier región de México: se aceptan diez dígitos nacionales con o sin prefijo `+52` y se almacena como `+52XXXXXXXXXX`. Se rechazan números no mexicanos o ambiguos.
        *   El usuario autenticado consulta nombre, correo y teléfono en Mi cuenta y cierra sesión desde ese módulo (0026). Ampliación aprobada 0033: puede editar su nombre completo y teléfono mexicano; el correo institucional permanece de solo lectura. Guardado validado en servidor, sin exponer hash ni permitir modificar datos de otros usuarios. El contacto nuevo se usa en siguientes lecturas autorizadas, también de publicaciones/reservas existentes, sin alterar precios ni plazos.

### Módulo de Publicaciones (Ventas en Vivo)
*   **RF-03: Creación de Publicación en Vivo [MUST]**
    *   **Descripción:** El sistema deberá permitir al vendedor crear una publicación capturando: foto, título, descripción, precio, categoría, stock inicial, lugar y hora de inicio/fin.
    *   **Criterios de Aceptación:**
        *   La publicación debe mostrar un temporizador regresivo calculado entre la hora actual y la hora de fin.
*   **RF-04: Expiración por Tiempo o Stock [MUST]**
    *   **Descripción:** El sistema deberá retirar automáticamente la publicación del feed cuando el temporizador llegue a cero o cuando el stock disponible llegue a cero.
    *   **Criterio de Aceptación:** Si una reserva libera stock antes del fin del horario y la publicación sigue `ACTIVE`, vuelve al feed; una publicación ya finalizada no se reactiva. Esta regla se apoya en el retorno al feed descrito en `README.md` y la liberación exigida por RF-09.
    *   Al llegar la hora de fin se bloquean reservas nuevas; las anteriores siguen vigentes hasta completar o agotar sus propios 20 minutos.
*   **RF-05: Cierre Manual Anticipado [MUST]**
    *   **Descripción:** El sistema deberá permitir al vendedor finalizar la publicación manualmente con un solo toque antes de que expire el tiempo.
    *   **Criterios de Aceptación:**
        *   Al presionar el botón de "Finalizar", la publicación desaparece del feed, se bloquean nuevas reservas, pero las reservas activas previas se mantienen intactas.
*   **RF-05b: Ajuste de Venta Física [MUST]**
    *   **Descripción:** El sistema deberá permitir al vendedor restar el stock manualmente con un botón ("-1") si vende el producto a alguien que llegó sin usar la aplicación.
    *   **Criterios de Aceptación:**
        *   Este descuento manual no debe afectar nunca a las piezas que ya están en estado "Reservado".
*   **RF-05c: Búsqueda y Filtrado por Zona y Categoría [MUST]**
    *   **Descripción:** El sistema deberá proveer búsqueda por texto y controles visuales para filtrar el feed principal.
    *   **Criterios de Aceptación:**
        *   Los filtros deben combinarse (ej. Mostrar "Snacks" en la "Facultad de Ingeniería").
        *   La barra de búsqueda consulta título o descripción sin distinguir mayúsculas y combina texto, tipo, zona y categoría por intersección. Limpiar el texto conserva los otros filtros. Ampliación solicitada por el usuario en 0025.

### Módulo de Publicaciones (Ventas Estáticas)
*   **RF-06: Catálogo Estático [MUST]**
    *   **Condición del artículo (0042):** Al crear un anuncio se exige indicar Nuevo o Usado. Puede editarla solo su propietario. Históricos sin dato conservan condición sin especificar hasta que el vendedor la elija; no inferirla ni inventarla. Omisión en PATCH conserva valor; null explícito y condición en LIVE se rechazan.
    *   **Descripción:** El sistema deberá permitir la publicación de artículos sin temporizador (libros, materiales).
    *   **Criterios de Aceptación:**
        *   La publicación permanecerá activa indefinidamente hasta que el vendedor cambie su estado a "Vendido".
        *   No admite reservas; el comprador puede contactar al vendedor por WhatsApp directamente desde la publicación, conforme al flujo descrito en `README.md`.

### Módulo de Reservas y Transacciones
*   **RF-07: Reserva Temporal [MUST]**
    *   **Descripción:** El sistema deberá permitir al comprador apartar una unidad del producto, descontando el stock disponible e iniciando un temporizador de 20 minutos.
    *   **Criterios de Aceptación:**
        *   Mis reservas muestra la foto actual del producto junto al nombre y precio fijado, incluso si la publicación deja de estar visible; si falta o falla, conserva la información y acciones con alternativa «Sin foto» (0023).
        *   Antes de enviar un primer apartado o una unidad adicional, el comprador confirma en un diálogo con producto, una unidad, precio actual y plazo de 20 minutos. Abrir o volver no reserva ni inicia el plazo; envío único y reintentos con la misma clave (0022).
        *   El comprador puede consultar al vendedor desde el detalle LIVE visible antes de reservar (RF-13/0039). La reserva confirmada conserva su contacto autorizado aunque la publicación deje de ser pública; contactar no crea una reserva.
        *   El precio unitario se fija cuando se confirma cada reserva y no cambia por una ganga o edición posterior.
        *   Un comprador puede apartar varias unidades de la misma publicación mediante reservas independientes si hay stock. Reintentar la misma solicitud devuelve la reserva original y no descuenta otra pieza; una nueva acción crea otra reserva con clave de idempotencia nueva.
*   **RF-08: Confirmación de Entrega [MUST]**
    *   **Descripción:** El sistema deberá permitir **únicamente al vendedor** confirmar la entrega física del producto mediante un botón en la app.
    *   **Criterios de Aceptación:**
        *   Al confirmar, el stock reservado pasa permanentemente a estado "Vendido".
        *   El vendedor puede confirmar una reserva previa durante sus 20 minutos aun si la publicación llegó a su hora de fin.
*   **RF-09: Expiración Automática de Reservas [MUST]**
    *   **Descripción:** El sistema deberá liberar el stock reservado devolviéndolo al inventario disponible si transcurren 20 minutos sin que el vendedor confirme la entrega.
    *   **Criterios de Aceptación:**
        *   Esta validación debe ejecutarse en el servidor (ej. BullMQ/Redis) para ser resistente a cierres de la app o reinicios del servidor.
        *   La liberación solo devuelve disponibilidad al feed si la publicación sigue activa y dentro de horario, conforme a RF-04.
*   **RF-10: Cancelación por Comprador [MUST]**
    *   **Descripción:** El sistema deberá permitir al comprador cancelar su propia reserva antes de los 20 minutos.
    *   **Criterios de Aceptación:**
        *   Al cancelar, el stock se libera inmediatamente para otros compradores.

**📊 Máquina de Estados de la Reserva (Lógica Estricta):**
```mermaid
stateDiagram-v2
    [*] --> ACTIVE : Comprador reserva (Stock - 1)
    ACTIVE --> COMPLETED : Vendedor confirma entrega (Stock no cambia)
    ACTIVE --> CANCELLED : Comprador cancela (Stock + 1)
    ACTIVE --> EXPIRED : Pasan 20 min (Background Job) (Stock + 1)
    COMPLETED --> [*]
    CANCELLED --> [*]
    EXPIRED --> [*]
```
*(Nota para la IA: El backend debe rechazar cualquier transición no definida en este diagrama, ej. pasar de EXPIRED a COMPLETED es inválido).*

### Módulo de Precios y Ofertas (Precio de oferta)
*   **RF-11: Configuración de Precio de oferta [MUST]**
    *   **Descripción:** El sistema deberá permitir al vendedor definir un "Precio mínimo" y un método de activación (manual o programado) al momento de crear o editar una publicación en vivo.
    *   **Criterios de Aceptación (0037):**
        *   El mínimo es positivo y estrictamente menor al precio normal; igualdad se rechaza.
        *   Antes de activarse, el propietario puede cambiar entre manual/programado y retirar la configuración. La retirada elimina mínimo/modo/minutos atómicamente e invalida trabajos anteriores sin cambiar precio, inventario o reservas.
        *   Feed/detalle públicos no entregan mínimo, modo ni minutos de anticipación; solo rutas propias autenticadas entregan configuración. Una oferta ya activada conserva precio/configuración inmutables, conforme a 0006 DEC-02; título/stock siguen editables.
*   **RF-12: Activación Instantánea [MUST]**
    *   **Descripción:** Al momento de activarse (ya sea por el botón del vendedor o por el job de tiempo), el sistema deberá reemplazar el precio normal por el precio de oferta de forma inmediata (sin transiciones graduales).
    *   **Criterios de Aceptación:**
        *   La interfaz de la publicación cambiará para incluir un distintivo visual ("Oferta") y subirá de posición en el feed.
        *   El nuevo precio aplica a reservas creadas después de la activación; las anteriores conservan su precio fijado.

### Módulo de Interacción y Moderación
*   **RF-13: Redirección a WhatsApp (Deep Linking) [MUST]**
    *   **Descripción:** El botón de "Contactar" deberá abrir directamente el chat de WhatsApp utilizando el número del usuario.
    *   **Criterios de Aceptación:**
        *   En una venta en vivo visible, el detalle permite contactar al vendedor antes de reservar con mensaje de interés, sin afirmar reserva ni descontar stock. Tras reservar, el enlace usa el título de la reserva y mensaje de coordinación de entrega; sigue accesible desde la reserva aunque el detalle desaparezca. Ampliación 0039.
        *   En una venta estática, el enlace de consulta está disponible desde el detalle sin reserva y usa un mensaje de interés en el artículo; la app no afirma que exista una reserva.
        *   Desde el teléfono canónico `+52XXXXXXXXXX`, el enlace usa `wa.me/52XXXXXXXXXX` sin duplicar el prefijo, sin restringir la región mexicana.
        *   Feed y eventos no incluyen teléfonos; el vendedor solo recibe el del comprador relacionado con una reserva ACTIVE no vencida, nunca de espectadores.
*   **RF-14: Ocultamiento Automático por Reportes [SHOULD]**
    *   **Descripción:** El sistema deberá proteger a la comunidad de publicaciones maliciosas o SPAM.
    *   **Criterios de Aceptación:**
        *   Si una misma publicación acumula **3 reportes** de usuarios distintos, su estado cambiará automáticamente a `HIDDEN_BY_REPORTS` y desaparecerá del feed público hasta que un Moderador la revise.

*   **RF-15: Filtro de contenido al publicar [MUST]**
    *   **Descripción:** Rechazar títulos/descripciones con groserías, insultos o términos prohibidos de la política versionada [0038](../specs/0038-filtro-palabras-publicaciones/policy.md), en LIVE y STATIC.
    *   **Criterios de Aceptación:**
        *   Validación autoritativa en servidor: creación y campos de texto enviados en edición. Rechazo 400 con código `PUBLICATION_CONTENT_BLOCKED` y campos afectados, sin guardar publicación ni encolar trabajos.
        *   Coincidencias por palabra/frase completa, sin distinguir mayúsculas/acentos vocálicos y preservando ñ; evitar subcadenas y términos ambiguos. Lista inicial analizada según indicación del usuario: groserías y términos despectivos, además del alcance original de sustancias/objetos.
        *   Aviso visible y mensajes por campo; conservar foto y todo el borrador para corregir y reenviar. No barrido retroactivo, OCR, sanciones ni IA; no sustituye los reportes SHOULD.

---

## 2. Requerimientos No Funcionales (RNF)

*   **RNF-01: Concurrencia y Consistencia (Bloqueo Pesimista) [MUST]**
    *   **Descripción:** El sistema deberá manejar peticiones simultáneas de reserva utilizando bloqueos pesimistas en base de datos (`SELECT ... FOR UPDATE`).
    *   **Criterios de Aceptación:**
        *   Si queda 1 pieza en stock y 2 usuarios pulsan "Reservar" en el mismo milisegundo, la base de datos deberá procesar en cascada, otorgando la reserva al primer request y lanzando un error amigable ("Stock agotado") al segundo.
*   **RNF-02: Actualización en Tiempo Real [MUST]**
    *   **Descripción:** El sistema deberá notificar a los clientes sobre cambios en el inventario sin necesidad de que el usuario recargue la pantalla (Pull to refresh).
    *   **Criterios de Aceptación:**
        *   Se usarán WebSockets (Socket.io) para propagar eventos de `stock_updated` a los clientes conectados, según el contrato de `03_ARCHITECTURE.md`.
*   **RNF-03: Seguridad y Restricciones Físicas [MUST]**
    *   **Descripción:** El sistema no integrará geolocalización satelital (GPS) ni pasarelas de pago (Stripe/PayPal).
    *   **Criterios de Aceptación:**
        *   La ubicación se manejará únicamente por selección de catálogos de zonas predefinidas (Ej. Facultad de Ingeniería, Biblioteca). Todo pago es externo a la app.

---

## 3. Matriz de Priorización (Para Fases de Desarrollo)

| Prioridad | Funcionalidad |
| :--- | :--- |
| **MUST (MVP definido por RF/RNF)** | Registro y perfil obligatorio, publicaciones LIVE/STATIC editables, venta física, filtros de zona/categoría, reserva/expiración de 20 min, cancelación/entrega, cierre anticipado, bloqueo pesimista, oferta manual/programada con configuración privada, filtro de contenido RF-15, consulta WhatsApp previa y desde reserva, Socket.io. |
| **SHOULD** | Ocultamiento por tres reportes distintos y moderación simple; expediente 0009 separado del cierre obligatorio. |
| **Fuera de estos RF/RNF** | Reputación, notificaciones push y cambios de correo/contraseña requieren nuevos requisitos antes de planificarse. Edición de nombre/teléfono incorporada a RF-02 en 0033. |

---

## 4. Estrategia de Pruebas (QA / Testing)
Para garantizar la solidez de las lógicas críticas, se implementarán pruebas automatizadas en el backend:
*   **Prueba de Estrés (Concurrencia):** Se debe crear un script (Unit o E2E test) que dispare 50 peticiones HTTP simultáneas con **claves de idempotencia distintas** al endpoint `POST /reservations` para un producto con `current_stock: 1`. La prueba se aprueba si **exactamente 1 petición** recibe HTTP 201 (Created) y las **49 restantes** reciben HTTP 409 (Conflict). Un reintento con la misma clave se comprueba aparte y devuelve 200 con la reserva original.
*   **Prueba de Expiración:** Se simulará la creación de una reserva y se adelantará el reloj del sistema/Redis para verificar que el job en background devuelva el stock al producto y cambie la reserva a estado `EXPIRED` automáticamente.
