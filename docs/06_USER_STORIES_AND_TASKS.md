# Historias de Usuario y Tareas (TapCampus)

Este documento traduce los Requerimientos Funcionales en Historias de Usuario (Metodología Ágil) y las divide en tareas técnicas para su implementación.

## 1. Épica: Autenticación y Perfil
*   **US-01 (Registro UABC):** *Como estudiante de la UABC, quiero registrarme usando mi correo institucional para acceder a un entorno seguro y exclusivo.*
    *   *Tarea Backend:* Crear tabla User, endpoint `POST /register`, validar regex `@uabc.edu.mx`, encriptar password con bcrypt.
    *   *Tarea Frontend:* Crear formulario de registro con KeyboardAvoidingView y validación visual de errores.
*   **US-02 (Login):** *Como usuario registrado, quiero iniciar sesión con mis credenciales para acceder a mi cuenta.*
    *   *Tarea Backend:* Crear endpoint `POST /login`, generar JWT.
    *   *Tarea Frontend:* Implementar AuthContext para persistir la sesión (AsyncStorage).

## 2. Épica: Publicaciones y Ventas
*   **US-03 (Publicar en Vivo):** *Como vendedor, quiero publicar mis productos con un temporizador y stock inicial para generar urgencia en los compradores.*
    *   *Tarea Backend:* Crear endpoint `POST /publications`, validar fechas de inicio/fin y stock.
    *   *Tarea Frontend:* Crear modal/pantalla de creación de publicación.
*   **US-04 (Catálogo Estático):** *Como vendedor, quiero publicar artículos escolares sin límite de tiempo para que permanezcan en un catálogo hasta que los venda.*
*   **US-05 (Precio Ganga):** *Como vendedor, quiero activar un "precio ganga" al final de mi turno para rematar el inventario sobrante rápidamente.*
    *   *Tarea Backend:* Endpoint `PATCH /publications/:id/ganga`, crear Job en BullMQ para activación programada.
*   **US-05b (Venta Física):** *Como vendedor, quiero descontar el stock manualmente con un botón si alguien me compra el producto en persona, para que la app no ofrezca piezas que ya no tengo.*
*   **US-05c (Filtros):** *Como comprador, quiero filtrar el feed por Facultad o Categoría para encontrar rápidamente lo que estoy buscando sin ver cosas que me quedan lejos.*

## 3. Épica: Reservas (Core)
*   **US-06 (Apartar Producto):** *Como comprador, quiero apartar un producto desde la app para garantizar que no se agote mientras camino hacia la ubicación del vendedor.*
    *   *Tarea Backend:* Endpoint `POST /reservations`, implementar transacción con **Bloqueo Pesimista** (`SELECT FOR UPDATE`), encolar Job de 20 mins.
    *   *Tarea Frontend:* Botón "Reservar" con manejo de errores (409 Conflict si alguien lo gana).
*   **US-07 (Confirmar Entrega):** *Como vendedor, quiero confirmar en la app cuando entrego el producto físicamente para cerrar el ciclo de la venta.*
*   **US-07b (Cancelar Reserva):** *Como comprador, quiero poder cancelar mi reserva si me surge un imprevisto, para liberar el stock a otros y no perjudicar al vendedor.*
*   **US-08 (Liberación Automática):** *Como sistema, quiero liberar las reservas después de 20 minutos para evitar que el inventario quede secuestrado por compradores fantasma.*

## 4. Épica: Moderación y Comunicación
*   **US-09 (Contacto Rápido):** *Como comprador con reserva, quiero un botón que abra WhatsApp directamente con el vendedor para avisar que voy en camino.*
*   **US-10 (Reportes):** *Como comunidad, quiero poder reportar publicaciones inapropiadas para que el sistema las oculte automáticamente al llegar a 3 quejas.*
