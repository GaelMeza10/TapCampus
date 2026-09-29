# Flujos de Usuario (User Journeys) - TapCampus

Este documento describe la secuencia de pasos e interacciones (pantallas) por las que pasa un usuario al utilizar las funciones principales de la aplicación. Es la guía definitiva para la navegación (React Navigation / Expo Router).

## 1. Flujo de Autenticación
*   **Pantalla Inicial (Login):** El usuario ingresa su correo y contraseña. Si no tiene cuenta, toca "Regístrate".
*   **Registro:** Llena el formulario (Nombre, Correo `@uabc.edu.mx`, Teléfono, Contraseña). Al completarlo exitosamente, la API retorna el JWT y la app navega al Feed Principal.

## 2. Flujo del Comprador (Buscar y Reservar)
1.  **Feed Principal (Home):** Ve una lista de tarjetas de Publicaciones en Vivo (con temporizador) y otra pestaña/sección de Publicaciones Estáticas. Puede filtrar por "Zonas" o "Categorías".
2.  **Detalle del Producto:** Toca una tarjeta. Ve la foto grande, descripción, stock restante, y zona exacta.
3.  **Acción de Reserva:** Presiona el botón "Reservar".
    *   *Si falla:* Aparece banner rojo "Lo sentimos, alguien más compró la última pieza".
    *   *Si es exitoso:* Se abre un modal de éxito y el botón cambia a "Cancelar Reserva". Se vuelve visible un nuevo botón: "Contactar por WhatsApp".
4.  **Encuentro Físico:** El comprador camina a la zona. Usa el botón de WhatsApp si no encuentra al vendedor.
5.  **Cierre:** El comprador no hace nada en la app para cerrar; espera a que el vendedor confirme. Si cambia de opinión en el camino, presiona "Cancelar Reserva".

## 3. Flujo del Vendedor (Publicar y Entregar)
1.  **Crear Publicación (Botón Flotante '+'):**
    *   Sube foto.
    *   Llena título, precio, descripción.
    *   Selecciona Zona y Categoría (menús desplegables).
    *   Ingresa Stock.
    *   Configura tiempo: Hora inicio y fin.
    *   (Opcional) Activa "Precio Ganga" programado o manual.
2.  **Gestión (Mis Ventas):** Pantalla donde el vendedor ve sus publicaciones activas.
    *   Ve un panel indicando "Tienes 1 reserva activa".
    *   Tiene el botón manual de "Activar Precio Ganga" (si no lo programó).
    *   Tiene el botón rojo "Finalizar Publicación" por si debe irse temprano.
3.  **Confirmar Entrega:** Cuando un comprador llega frente a él, el vendedor entra a los detalles de la reserva de ese usuario y presiona "Confirmar Entrega". El stock reservado se descuenta permanentemente.
4.  **Venta Directa (Física):** Si alguien llega sin usar la app, el vendedor en su panel de "Mis Ventas" presiona un botón de "Restar 1 al Stock" para mantener su inventario digital actualizado.
