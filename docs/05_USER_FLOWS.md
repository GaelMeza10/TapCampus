# Flujos de Usuario (User Journeys) - TapCampus

0047 aprobado (2026-11-22): STATIC se presenta como **Productos**, con ayuda de compra y entrega por acuerdo; códigos LIVE/STATIC conservados. Puede elegirse **Punto de entrega por acordar dentro del campus** o una zona concreta; LIVE siempre requiere una zona. Las reservas nuevas guardan el punto de recogida y lo muestran con producto, unidad, precio fijado, plazo y vendedor; los históricos sin instantánea muestran la ubicación actual como referencia. Se rechaza cambiar la zona LIVE mientras existan reservas vigentes. Stock cero sale inmediatamente de disponibles con aviso y datos conservados; no significa que todas las unidades estén vendidas definitivamente. Logout requiere confirmación, sin bloquear la expiración automática de sesión. Catálogo canónico: seis categorías de alimentos LIVE y diez de productos por cada modalidad (26 filas), conservando identidades y datos originales.

Confirmar reserva no depende de que el producto siga visible en Explorar. Mostrar «Ubicación: <zona>» y el plazo de recogida; para históricos sin instantánea, «Ubicación de referencia». Crear Productos ofrece zona concreta o entrega por acordar; no afirma presencia en todo el campus.

0045: ante fallo de red/servidor, acceso y registro conservan valores y distinguen el problema de credenciales inválidas. Ventas/reservas conservan datos y presentan el rechazo fuera del scroll; Reintentar actualiza lecturas, sin repetir una venta/entrega/cancelación automáticamente. Detalle con fallo de producto permite reintentar; 404 confirmado conserva acceso a reservas; si falla solo la consulta de reservas no se declara «Todavía no tienes reservas». Cuenta/formulario conservan borrador, foto y errores de guardado hasta nuevo intento.

0044: Explorar → Vender → Venta en vivo/Anuncio → formulario específico, sin repetir la elección Disponibles ahora/Catálogo. Mis ventas → Nueva venta en vivo/Nuevo anuncio → mismo formulario directo; edición conserva el tipo del servidor. Solo un enlace de creación sin type permite la selección inicial. Las cuatro tabs conservan contenido/estado y comparten una barra persistente, con glass nativo exclusivo de tabs y alternativa sólida accesible. [Criterios y evidencia](../specs/0044-consistencia-pantallas/verification.md).

0043: Explorar → Filtros consulta conteos reales por tipo/búsqueda, muestra opciones con la otra dimensión aplicada y total de la intersección. Seleccionar/Restablecer solo cambia borrador; cerrar descarta y Ver publicaciones aplica. Error de conteo permite aplicar sin cantidad o reintentar. Anuncio → foto/condición/categoría/zona/vendedor → WhatsApp sin reserva. En vivo → cierre/stock/zona/hora → Apartar una unidad → confirmación existente; consulta previa y reservas anteriores conservadas. Mi cuenta cambia composición visual y conserva edición/guardar/cancelar/salida sin añadir funciones.

Condición 0042: Vender → Anuncio → Producto → Condición → Nuevo/Usado → publicar. Edición precarga el valor; históricos solicitan selección al guardar. Error conserva elección/foto/borrador. Feed/detalle/Mis ventas muestran la condición confirmada del anuncio. Venta en vivo no ofrece ese campo.

Explorar 0041: Ahora en el campus/Anuncios conserva búsqueda y filtros AND; chips de zona en LIVE y categoría en STATIC. Ganga real destacada abre detalle con Reservar, sin crear reserva al pulsar. Banner de reserva ACTIVE no vencida más próxima → Reservas. Vender → elegir Venta en vivo/Anuncio → formulario existente. Esta navegación sustituye el + que preseleccionaba el tipo visible; los demás recorridos siguen vigentes.

Corrección 0028: Explorar/Reservas/Mis ventas/Cuenta son destinos de un navegador de pestañas protegido, con estado conservado al cambiar. Atrás desde otra pestaña vuelve a Explorar; no recorre todas las selecciones anteriores. Detalle y formulario permanecen en una pila superior y Atrás recupera el origen. Ver mis reservas y guardar publicación regresan al grupo existente con dismissTo, sin duplicarlo; guardar selecciona el tipo correspondiente en ventas. Las URLs públicas se conservan.

Este documento describe la secuencia de pasos e interacciones (pantallas) por las que pasa un usuario al utilizar las funciones principales de la aplicación. Es la guía definitiva para la navegación (React Navigation / Expo Router).

Actualización 2026-11-21: ofertas 0037, errores 0034/filtro 0038 y contacto LIVE 0039 implementados y verificados técnicamente. Apertura/retorno nativos y cierre integrado en 0040 pendientes. Los recorridos anteriores conservan su evidencia histórica.

## 1. Flujo de Autenticación
*   **Editar datos (0033):** Mi cuenta → Editar datos → nombre/teléfono precargados y correo en texto. Guardar cambios solo con cambios válidos; envío bloquea duplicados, navegación y logout. Error conserva borrador y permite reintento; éxito muestra perfil confirmado y Datos actualizados. Cancelar descarta edición. Las siguientes consultas autorizadas usan el contacto actualizado, también de reservas existentes.
*   **Gestión de sesión (0026):** Desde la cuarta pestaña Cuenta abre Mi cuenta, consulta nombre/correo/teléfono registrados y puede cerrar sesión. Carga y error con reintento, sin mensajes técnicos; salir del módulo no cierra sesión. Cerrar sesión usa el servicio existente y las guardas llevan al acceso. Durante cierre se bloquean repetición y navegación; si falla, error local y reintento sin perder los datos. Sustituye la hoja y acceso del encabezado 0024.
*   **Pantalla Inicial (Login):** El usuario ingresa su correo y contraseña. Si no tiene cuenta, toca "Regístrate".
*   **Registro:** Llena el formulario (Nombre, Correo `@uabc.edu.mx`, Teléfono mexicano de cualquier región con o sin `+52`, Contraseña). Al completarlo exitosamente, la API retorna el JWT y la app navega al Feed Principal.

## 2. Flujo del Comprador (Buscar y Reservar)
Barra de búsqueda añadida en 0025: escribe título/descripción desde Explorar. Actualiza tras una pausa breve o al pulsar Buscar en el teclado; combina texto con tipo/zona/categoría. Limpiar texto conserva los filtros; sin coincidencias ofrece cambiar el texto o los filtros. El servidor aplica la búsqueda a las publicaciones visibles.
Navegación vigente según DESIGN.md: Explorar/Reservas/Mis ventas/Cuenta y barra persistente con liquid glass solo en tabs compatibles. El selector de Explorar muestra Ahora en el campus/Anuncios. Filtros conserva un borrador: cerrar descarta cambios y Aplicar los combina. Vender ofrece esos mismos dos nombres con una explicación y entra directamente al formulario elegido, sin repetir el selector. Un enlace de creación sin tipo conserva una elección inicial; edición no permite cambiar tipo y lo obtiene del servidor.

Mis ventas usa Ahora en el campus/Anuncios, conserva su selección al editar/volver y entra al formulario del tipo elegido al crear. Sus insignias y las del detalle proceden del vocabulario compartido. Los diálogos de entrega y estados de venta conservan sus rutas; el envío refleja solicitudes reales, sin demora simulada. Los prototipos de 0017/0018/0020 son referencias históricas.
1.  **Feed Principal (Home):** Ve una lista de tarjetas de Publicaciones en Vivo (con temporizador) y otra pestaña/sección de Publicaciones Estáticas. Puede filtrar por "Zonas" o "Categorías".
2.  **Detalle del Producto:** Toca una tarjeta. Ve la foto grande, descripción, stock restante, y zona exacta.
    * Puede contactar al vendedor por WhatsApp antes de reservar con un mensaje de interés; no se crea apartado ni se inicia plazo (0039). Desde una reserva confirmada mantiene el contacto aunque la publicación desaparezca.
3.  **Acción de Reserva:** Pulsa «Apartar una unidad» y revisa el diálogo «¿Quieres apartar una unidad?», con producto, una unidad, precio actual y plazo de 20 minutos. «Volver» cierra sin reservar. Solo «Sí, apartar» genera la clave y envía; «Apartando…» bloquea repetición y cierre hasta resolver.
    *   *Si falla:* El diálogo muestra error y permite reintentar con la misma clave, incluso tras cerrar/reabrir o si desaparece el detalle después de un envío incierto. Un 409 informa stock/no disponibilidad sin crear éxito local. Cambios conocidos de precio requieren revisar y confirmar nuevamente; agotamiento/fin impiden iniciar solicitudes nuevas.
    *   *Si es exitoso:* Se cierra el diálogo y se muestra la reserva con el precio fijado, límite de 20 minutos y acciones "Cancelar Reserva" y "Contactar por WhatsApp". "Apartar otra unidad" abre la misma confirmación; solo confirmarla inicia otra acción con clave nueva si queda stock. Volver conserva la reserva anterior; el comprador ve sus reservas por separado.
    *   *Si se reintenta la misma solicitud:* La API devuelve la reserva original y la interfaz no añade otra unidad.
4.  **Encuentro Físico:** El comprador camina a la zona. Usa el botón de WhatsApp si no encuentra al vendedor.
    * En Mis reservas reconoce cada apartado por la foto actual, producto/unidad y precio fijado. La foto viene de la reserva autorizada, sin depender del detalle público; un fallo no oculta plazo, WhatsApp o cancelación (0023).
5.  **Cierre:** El comprador espera a que el vendedor confirme cada entrega. Si cambia de opinión, cancela la reserva correspondiente. El fin del horario impide nuevas reservas, pero no quita al vendedor la confirmación de una reserva previa dentro de sus 20 minutos.

### Compra de publicación estática
1. El comprador abre la pestaña de publicaciones estáticas y filtra por zona o categoría.
2. Abre el detalle de un artículo `ACTIVE` y puede contactar al vendedor por WhatsApp directamente, sin iniciar reserva ni temporizador.
3. El vendedor coordina la entrega fuera de la app y marca su publicación como «Vendida»; desaparece del catálogo activo.

## 3. Flujo del Vendedor (Publicar y Entregar)
1.  **Crear Publicación (Botón Flotante '+'):**
    *   Sube foto.
    *   Llena título, precio, descripción.
    *   Selecciona Zona y Categoría (menús desplegables).
    *   Ingresa Stock.
    *   Configura tiempo: Hora inicio y fin.
    *   (Opcional) Activa "Precio de oferta" programado o manual.
    *   Al publicar, el servidor comprueba título/descripción contra el filtro versionado (0038). Si rechaza, se muestran aviso/campos y se conservan foto, texto, horario y selecciones; corregir y reenviar expresamente. La misma regla se aplica al texto enviado al editar.
2.  **Gestión (Mis Ventas):** Pantalla donde el vendedor ve sus publicaciones activas.
    *   Ve un panel con la cantidad y el detalle separado de todas las reservas activas, incluso varias del mismo comprador.
    *   Tiene el botón manual de "Activar Precio de oferta" (si no lo programó).
    *   Antes de activarse puede alternar Manual/Programada o elegir Sin oferta; mínimo estrictamente menor al normal. Guardar confirma configuración y trabajos vigentes en servidor; el comprador no recibe mínimo/modo/umbral futuros. Una oferta ya aplicada no se revierte (0037).
    *   Tiene el botón rojo "Finalizar Publicación" por si debe irse temprano.
3.  **Confirmar Entrega:** Cuando un comprador llega frente a él, el vendedor entra a la reserva específica y presiona "Confirmar Entrega" antes del vencimiento de sus 20 minutos, aunque el horario de la publicación ya terminó. El precio fijado de esa reserva no cambia y el stock reservado pasa a vendido permanentemente.
4.  **Venta Directa (Física):** Si alguien llega sin usar la app, el vendedor en su panel de "Mis Ventas" presiona un botón de "Restar 1 al Stock" para mantener su inventario digital actualizado.
