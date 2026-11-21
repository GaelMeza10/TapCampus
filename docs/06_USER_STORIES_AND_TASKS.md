# Historias de Usuario y Tareas (TapCampus)

Este documento traduce los Requerimientos Funcionales en Historias de Usuario (Metodología Ágil) y las divide en tareas técnicas para su implementación.

## 1. Épica: Autenticación y Perfil
Ampliación aprobada 0033 de US-02 y US-09: editar nombre completo/teléfono propios desde Mi cuenta, conservando correo institucional fijo, sesión y contacto vigente en consultas autorizadas. Tareas de API, editor y verificación en el expediente.
*   **US-01 (Registro UABC):** *Como estudiante de la UABC con teléfono mexicano de cualquier región, quiero registrarme usando mi correo institucional y número con o sin `+52` para acceder a un entorno seguro y exclusivo.*
    *   *Tarea Backend:* Crear tabla User, endpoint `POST /auth/register`, validar `@uabc.edu.mx` en servidor, encriptar password con bcrypt.
    *   *Tarea Frontend:* Crear formulario de registro con KeyboardAvoidingView y validación visual de errores.
*   **US-02 (Login):** *Como usuario registrado, quiero iniciar sesión con mis credenciales para acceder a mi cuenta.*
    *   *Tarea Backend:* Crear endpoint `POST /auth/login`, generar JWT.
    *   *Tarea Frontend:* Implementar AuthContext para persistir la sesión con `expo-secure-store`.

## 2. Épica: Publicaciones y Ventas
*   **US-03 (Publicar en Vivo):** *Como vendedor, quiero publicar mis productos con un temporizador y stock inicial para generar urgencia en los compradores.*
    *   *Tarea Backend:* Crear endpoint `POST /publications`, validar fechas de inicio/fin y stock.
    *   *Tarea Frontend:* Crear modal/pantalla de creación de publicación.
*   **US-04 (Catálogo Estático):** *Como vendedor, quiero publicar artículos escolares sin límite de tiempo para que permanezcan en un catálogo hasta que los venda.*
    *   *Tarea Backend:* Crear publicación `STATIC` y transición a `FINISHED` cuando su vendedor la marque «Vendida».
    *   *Tarea Frontend:* Mostrar detalle sin temporizador ni reserva y acción «Marcar como vendida» al propietario.
*   **US-05 (Precio de oferta):** *Como vendedor, quiero activar un "precio de oferta" al final de mi turno para rematar el inventario sobrante rápidamente.*
    *   *Tarea Backend:* Endpoint `PATCH /publications/:id/ganga`, crear Job en BullMQ para activación programada.
    *   *Cierre 0037:* Configuración futura privada del propietario, mínimo menor al normal y cambio/retirada antes de activar, sin trabajos antiguos efectivos ni cambios a precios reservados.
*   **US-05b (Venta Física):** *Como vendedor, quiero descontar el stock manualmente con un botón si alguien me compra el producto en persona, para que la app no ofrezca piezas que ya no tengo.*
*   **US-05c (Búsqueda y filtros):** *Como comprador, quiero buscar por texto y filtrar el feed por Facultad o Categoría para encontrar rápidamente lo que estoy buscando sin ver cosas que me quedan lejos.*
*   **US-05d (Cierre Anticipado):** *Como vendedor, quiero finalizar una publicación en vivo antes del horario previsto para dejar de recibir reservas sin perder las ya activas.*

## 3. Épica: Reservas (Core)
*   **US-06 (Apartar Producto):** *Como comprador, quiero apartar una o varias unidades mediante reservas separadas, cada una a su precio fijado, sin que un reintento accidental me cobre o aparte otra pieza.*
    *   *Tarea Backend:* Endpoint `POST /reservations` con `Idempotency-Key`, precio unitario fijado, transacción con **Bloqueo Pesimista** (`SELECT FOR UPDATE`) y Job de 20 mins; devolver la misma reserva al reintentar la clave.
    *   *Tarea Frontend:* Botón "Reservar" y "Apartar otra unidad", lista de reservas independientes, conservación de clave durante reintentos y manejo de `409`.
*   **US-07 (Confirmar Entrega):** *Como vendedor, quiero confirmar cada reserva dentro de sus 20 minutos, incluso después de la hora de fin de la publicación, para cerrar el ciclo de la venta al precio fijado.*
*   **US-07b (Cancelar Reserva):** *Como comprador, quiero poder cancelar mi reserva si me surge un imprevisto, para liberar el stock a otros y no perjudicar al vendedor.*
*   **US-08 (Liberación Automática):** *Como sistema, quiero liberar las reservas después de 20 minutos para evitar que el inventario quede secuestrado por compradores fantasma.*

## 4. Épica: Moderación y Comunicación
*   **US-09 (Contacto Rápido):** *Como comprador, quiero consultar al vendedor desde una publicación LIVE visible antes de reservar y coordinar la entrega desde mi reserva confirmada, sin que una consulta cree un apartado ni exponga mi teléfono al vendedor.* Cierre 0039; contacto de comprador reservado solo para vendedor relacionado mientras ACTIVE no vencida.
*   **US-10 (Reportes):** *Como comunidad, quiero poder reportar publicaciones inapropiadas para que el sistema las oculte automáticamente al llegar a 3 quejas.*
*   **US-11 (Consulta de Artículo Estático):** *Como comprador, quiero contactar por WhatsApp al vendedor de un artículo estático activo sin hacer una reserva que ese tipo de publicación no admite.*
*   **US-12 (Contenido al Publicar):** *Como vendedor, quiero saber si título o descripción contienen groserías, insultos o términos prohibidos y corregirlos sin perder foto ni formulario, para publicar contenido permitido.* RF-15 → 0038; validación de servidor también al editar texto, política acotada sin subcadenas y mensajes por campo.
