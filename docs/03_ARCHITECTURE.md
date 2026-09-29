# Arquitectura y Stack Tecnológico (TapCampus)

## 1. Stack Seleccionado
| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Frontend Móvil** | React Native (Expo) | Interfaz nativa ágil, componentes reutilizables, TypeScript. |
| **Backend API** | NestJS | Arquitectura escalable y orientada a objetos (POO). |
| **Capa de Datos** | Prisma (ORM) | Seguridad de tipado y migraciones declarativas sencillas. |
| **Base de Datos** | PostgreSQL | Manejo de transacciones ACID para el bloqueo pesimista. |
| **Almacenamiento de Archivos** | Multer + Sistema de Archivos Local (MVP) | Almacenar las imágenes de las publicaciones temporalmente en el servidor backend (carpeta estática `/uploads`). Opcionalmente migrable a Cloudinary. |
| **Eventos Real-Time** | Socket.io | Actualizaciones en vivo de stock y temporizadores sin recargar pantallas. |
| **Background Jobs** | BullMQ + Redis (o Cron) | Manejo de colas y cronometrado resistente a reinicios para expiración de reservas y activación programada de Precio Ganga. |

## 2. Diccionario de Datos (Modelo Lógico Prisma)

### `User` (Usuario)
*   `id`: UUID (PK)
*   `email`: String (Unique, validación `@uabc.edu.mx`)
*   `password_hash`: String
*   `name`: String
*   `phone`: String (Obligatorio)
*   `is_moderator`: Boolean (Default: false)
*   `created_at`: DateTime

### `Publication` (Publicación)
*   `id`: UUID (PK)
*   `type`: Enum `PublicationType` (`LIVE`, `STATIC`)
*   `seller_id`: UUID (FK -> User)
*   `title`: String
*   `description`: Text
*   `price`: Decimal (Precisión: 10,2)
*   `image_url`: String
*   `status`: Enum `PublicationStatus` (`ACTIVE`, `FINISHED`, `HIDDEN_BY_REPORTS`)
*   `zone_id`: Int (FK -> Zone)
*   `category_id`: Int (FK -> Category)
*   *-- Campos exclusivos para `LIVE` --*
*   `initial_stock`: Int (Nullable)
*   `current_stock`: Int (Nullable, Check >= 0)
*   `start_time`: DateTime (Nullable)
*   `end_time`: DateTime (Nullable)
*   `is_ganga_active`: Boolean (Default: false)
*   `ganga_min_price`: Decimal (Nullable)
*   `ganga_activation_mode`: Enum (`MANUAL`, `SCHEDULED`, Nullable)
*   `ganga_minutes_before`: Int (Nullable)
*   `created_at`: DateTime

### `Reservation` (Reserva - Manejo Crítico de Estado)
*   `id`: UUID (PK)
*   `buyer_id`: UUID (FK -> User)
*   `publication_id`: UUID (FK -> Publication)
*   `status`: Enum `ReservationStatus` (`ACTIVE`, `COMPLETED`, `CANCELLED`, `EXPIRED`)
*   `reserved_at`: DateTime (Timestamp de inicio para los 20 mins)
*   `resolved_at`: DateTime (Nullable, cuándo se completó/canceló/expiró)

## 3. Contratos de API REST (Endpoints Core)

Para garantizar consistencia, el Backend deberá exponer las siguientes rutas base:

*   **Autenticación**
    *   `POST /auth/register` (Body: email, password, name, phone)
    *   `POST /auth/login` -> Retorna JWT Token.
*   **Publicaciones**
    *   `POST /publications` (Requiere JWT, crea Viva o Estática)
    *   `GET /publications?type=LIVE&zoneId=X` (Filtros por query params)
    *   `PATCH /publications/:id/ganga` (Activar/desactivar ganga manualmente)
    *   `POST /publications/:id/finish` (Cierre manual anticipado)
*   **Reservas (Transacciones Seguras)**
    *   `POST /reservations` (Body: publicationId). *Este endpoint es crítico y debe envolverse en un `prisma.$transaction` con Bloqueo Pesimista.*
    *   `POST /reservations/:id/complete` (Solo permitido para el `seller_id`).
    *   `POST /reservations/:id/cancel` (Solo permitido para el `buyer_id`).

## 4. Estándar de Respuestas de Error
Toda la API debe retornar errores siguiendo el formato estándar de NestJS (HttpException):
```json
{
  "statusCode": 400,
  "message": ["El email debe pertenecer al dominio uabc.edu.mx"],
  "error": "Bad Request"
}
```
## 5. Seguridad y Control de Acceso (RBAC)
*   **Autenticación:** Toda ruta protegida debe requerir un **JWT Bearer Token** en el header de autorización.
*   **Propiedad de los Datos (Ownership):** 
    *   Una publicación solo puede ser editada, finalizada o aplicarle "Ganga" por el usuario dueño de la misma (`seller_id === jwt.user.id`).
    *   Una reserva solo puede ser cancelada por su creador (`buyer_id === jwt.user.id`).
    *   Cualquier intento de modificar entidades ajenas debe retornar **403 Forbidden**.

## 6. Diccionario de Eventos en Tiempo Real (Socket.io)
Para evitar asimetrías entre Backend y Frontend, se usarán estrictamente estos nombres de eventos:
*   `Emisión desde Servidor`: 
    *   `stock_updated`: Payload `{ publicationId: UUID, newStock: Int }`. Emitido cuando alguien reserva o cancela.
    *   `publication_expired`: Payload `{ publicationId: UUID }`. Emitido cuando el temporizador de una publicación llega a 0.
    *   `ganga_activated`: Payload `{ publicationId: UUID, newPrice: Decimal }`.
*   `Suscripción de Cliente`:
    *   El cliente móvil se suscribirá a un "room" global o de zona para escuchar actualizaciones solo de lo que tiene renderizado en su feed.

## 7. Estrategia de Tareas en Segundo Plano (Background Jobs)
*   **Colas (BullMQ + Redis):**
    *   `reservation_queue`: Al crearse una reserva, se encola un trabajo con un *delay* exacto de 20 minutos. Si el usuario confirma o cancela antes, el trabajo se elimina de la cola. Si el trabajo se ejecuta, se marca la reserva como `EXPIRED` y se libera el stock.
    *   `ganga_queue`: Si un vendedor programa el "Precio Ganga" 15 minutos antes de acabar su turno, se encola un trabajo con el *delay* correspondiente para activar la oferta de manera desatendida.

## 8. Datos Semilla (Data Seeding)
Al inicializar la base de datos (`prisma db seed`), se deben insertar obligatoriamente los siguientes catálogos correspondientes a la UABC:
*   **Zonas:** "Facultad de Ingeniería", "Facultad de Artes", "Biblioteca Central", "Cafetería Principal", "Gimnasio".
*   **Categorías (Ventas Vivas):** "Comida Fuerte", "Snacks", "Bebidas", "Postres".
*   **Categorías (Ventas Estáticas):** "Libros", "Material Escolar", "Batas/Uniformes", "Electrónica".

## 9. Variables de Entorno (`.env.example`)
El proyecto Backend requiere la definición estricta de las siguientes variables para operar:
*   `DATABASE_URL` (URL de conexión a PostgreSQL)
*   `JWT_SECRET` (Llave secreta de firma de Tokens)
*   `REDIS_URL` (Conexión al manejador de colas BullMQ)
*   `PORT` (Puerto expuesto de NestJS, usualmente 3000)

## 10. Estrategia de Despliegue (Deployment)
Para pasar a producción el MVP, se utilizará la siguiente infraestructura:
*   **Base de Datos (PostgreSQL):** Neon.tech o Supabase (Opciones Serverless de capa gratuita generosa).
*   **Backend (NestJS + Redis):** Render (Web Service para Node.js y servicio Redis administrado).
*   **Frontend Móvil (React Native):** Empaquetado a través de EAS Build (Expo Application Services) para generar los binarios `.apk` (Android) y distribución en TestFlight/PlayStore.
