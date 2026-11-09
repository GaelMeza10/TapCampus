# Flujos de Usuario (User Journeys) - TapCampus

Corrección 0028: Explorar/Reservas/Mis ventas/Cuenta son destinos de un navegador de pestañas protegido, con estado conservado al cambiar. Atrás desde otra pestaña vuelve a Explorar; no recorre todas las selecciones anteriores. Detalle y formulario permanecen en una pila superior y Atrás recupera el origen. Ver mis reservas y guardar publicación regresan al grupo existente con dismissTo, sin duplicarlo; guardar selecciona el tipo correspondiente en ventas. Las URLs públicas se conservan.

Este documento describe la secuencia de pasos e interacciones (pantallas) por las que pasa un usuario al utilizar las funciones principales de la aplicación. Es la guía definitiva para la navegación (React Navigation / Expo Router).

## 1. Flujo de Autenticación
*   **Gestión de sesión (0026):** Desde la cuarta pestaña Cuenta abre Mi cuenta, consulta nombre/correo/teléfono registrados y puede cerrar sesión. Carga y error con reintento, sin mensajes técnicos; salir del módulo no cierra sesión. Cerrar sesión usa el servicio existente y las guardas llevan al acceso. Durante cierre se bloquean repetición y navegación; si falla, error local y reintento sin perder los datos. Sustituye la hoja y acceso del encabezado 0024.
*   **Pantalla Inicial (Login):** El usuario ingresa su correo y contraseña. Si no tiene cuenta, toca "Regístrate".
*   **Registro:** Llena el formulario (Nombre, Correo `@uabc.edu.mx`, Teléfono mexicano de cualquier región con o sin `+52`, Contraseña). Al completarlo exitosamente, la API retorna el JWT y la app navega al Feed Principal.

## 2. Flujo del Comprador (Buscar y Reservar)
Barra de búsqueda añadida en 0025: escribe título/descripción desde Explorar. Actualiza tras una pausa breve o al pulsar Buscar en el teclado; combina texto con tipo/zona/categoría. Limpiar texto conserva los filtros; sin coincidencias ofrece cambiar el texto o los filtros. El servidor aplica la búsqueda a las publicaciones visibles.
Base visual 0016/0020; navegación vigente 0026 con Explorar/Reservas/Mis ventas/Cuenta y fondo verde translúcido en el módulo activo. Selector Disponibles ahora/Catálogo encima de Filtros. La hoja conserva un borrador: cerrar descarta cambios, Aplicar los combina y Restablecer permite volver a todas las opciones. El + abre el formulario del tipo visible.

Prototipo actualizado en 0017/0018 y aplicado a Expo en 0020: la barra inferior usa brújula/comprobante/bolsa con etiquetas. En Mis ventas, tocar Con horario o Catálogo debajo del título cambia la vista y marca el tipo seleccionado. Los diálogos de entrega y estados de venta conservan sus rutas. 0020 aplica además tarjetas uniformes, encabezados compactos y errores por campo de 0019; el envío refleja solicitudes reales, sin demora simulada.
1.  **Feed Principal (Home):** Ve una lista de tarjetas de Publicaciones en Vivo (con temporizador) y otra pestaña/sección de Publicaciones Estáticas. Puede filtrar por "Zonas" o "Categorías".
2.  **Detalle del Producto:** Toca una tarjeta. Ve la foto grande, descripción, stock restante, y zona exacta.
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
2.  **Gestión (Mis Ventas):** Pantalla donde el vendedor ve sus publicaciones activas.
    *   Ve un panel con la cantidad y el detalle separado de todas las reservas activas, incluso varias del mismo comprador.
    *   Tiene el botón manual de "Activar Precio de oferta" (si no lo programó).
    *   Tiene el botón rojo "Finalizar Publicación" por si debe irse temprano.
3.  **Confirmar Entrega:** Cuando un comprador llega frente a él, el vendedor entra a la reserva específica y presiona "Confirmar Entrega" antes del vencimiento de sus 20 minutos, aunque el horario de la publicación ya terminó. El precio fijado de esa reserva no cambia y el stock reservado pasa a vendido permanentemente.
4.  **Venta Directa (Física):** Si alguien llega sin usar la app, el vendedor en su panel de "Mis Ventas" presiona un botón de "Restar 1 al Stock" para mantener su inventario digital actualizado.
