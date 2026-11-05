# Flujos de Usuario (User Journeys) - TapCampus

Este documento describe la secuencia de pasos e interacciones (pantallas) por las que pasa un usuario al utilizar las funciones principales de la aplicación. Es la guía definitiva para la navegación (React Navigation / Expo Router).

## 1. Flujo de Autenticación
*   **Pantalla Inicial (Login):** El usuario ingresa su correo y contraseña. Si no tiene cuenta, toca "Regístrate".
*   **Registro:** Llena el formulario (Nombre, Correo `@uabc.edu.mx`, Teléfono mexicano de cualquier región con o sin `+52`, Contraseña). Al completarlo exitosamente, la API retorna el JWT y la app navega al Feed Principal.

## 2. Flujo del Comprador (Buscar y Reservar)
Implementación visual vigente: 0016. Navegación inferior persistente Explorar/Reservas/Mis ventas; selector Disponibles ahora/Catálogo encima de Filtros. La hoja conserva un borrador: cerrar descarta cambios, Aplicar los combina y Restablecer permite volver a todas las opciones. El + abre el formulario del tipo visible.

Prototipo actualizado en 0017/0018 (2026-11-05; traslado a Expo por realizar): la barra inferior usa brújula/comprobante/bolsa con etiquetas. En Mis ventas, tocar Con horario o Catálogo debajo del título cambia la vista y marca el tipo seleccionado; sustituye al botón superior que mostraba solo el destino alternativo. Los diálogos de entrega y estados de venta conservan sus rutas.
1.  **Feed Principal (Home):** Ve una lista de tarjetas de Publicaciones en Vivo (con temporizador) y otra pestaña/sección de Publicaciones Estáticas. Puede filtrar por "Zonas" o "Categorías".
2.  **Detalle del Producto:** Toca una tarjeta. Ve la foto grande, descripción, stock restante, y zona exacta.
3.  **Acción de Reserva:** Presiona el botón "Reservar"; la app genera una clave nueva para esa acción y conserva la misma al reintentar si se pierde la respuesta.
    *   *Si falla:* Aparece banner rojo "Lo sentimos, alguien más compró la última pieza".
    *   *Si es exitoso:* Se abre un modal de éxito con el precio fijado, límite de 20 minutos y acciones "Cancelar Reserva" y "Contactar por WhatsApp" de esa reserva. "Apartar otra unidad" inicia una acción distinta con clave nueva si queda stock; el comprador ve sus reservas por separado.
    *   *Si se reintenta la misma solicitud:* La API devuelve la reserva original y la interfaz no añade otra unidad.
4.  **Encuentro Físico:** El comprador camina a la zona. Usa el botón de WhatsApp si no encuentra al vendedor.
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
    *   (Opcional) Activa "Precio Ganga" programado o manual.
2.  **Gestión (Mis Ventas):** Pantalla donde el vendedor ve sus publicaciones activas.
    *   Ve un panel con la cantidad y el detalle separado de todas las reservas activas, incluso varias del mismo comprador.
    *   Tiene el botón manual de "Activar Precio Ganga" (si no lo programó).
    *   Tiene el botón rojo "Finalizar Publicación" por si debe irse temprano.
3.  **Confirmar Entrega:** Cuando un comprador llega frente a él, el vendedor entra a la reserva específica y presiona "Confirmar Entrega" antes del vencimiento de sus 20 minutos, aunque el horario de la publicación ya terminó. El precio fijado de esa reserva no cambia y el stock reservado pasa a vendido permanentemente.
4.  **Venta Directa (Física):** Si alguien llega sin usar la app, el vendedor en su panel de "Mis Ventas" presiona un botón de "Restar 1 al Stock" para mantener su inventario digital actualizado.
