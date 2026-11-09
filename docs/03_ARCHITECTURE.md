# Arquitectura y Stack Tecnológico (TapCampus)

## 1. Stack Seleccionado
| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Frontend Móvil** | React Native 0.88.1 (Expo SDK 58, React 19.3) | Interfaz nativa ágil, componentes reutilizables, TypeScript. Migración: specs/0013-expo-sdk-58. |
| **Backend API** | NestJS | Arquitectura escalable y orientada a objetos (POO). |
| **Capa de Datos** | Prisma (ORM) | Seguridad de tipado y migraciones declarativas sencillas. |
| **Base de Datos** | PostgreSQL | Manejo de transacciones ACID para el bloqueo pesimista. |
| **Almacenamiento de Archivos** | Multer + Sistema de Archivos Local (MVP) | Almacenar las imágenes de las publicaciones temporalmente en el servidor backend (carpeta estática `/uploads`). Opcionalmente migrable a Cloudinary. |
| **Eventos Real-Time** | Socket.io | Actualizaciones en vivo de stock y temporizadores sin recargar pantallas. |
| **Background Jobs** | BullMQ + Redis | Manejo de colas y cronometrado resistente a reinicios para expiración de reservas y activación programada de Precio Ganga. |

## 2. Diccionario de Datos (Modelo Lógico Prisma)

### `User` (Usuario)
*   `id`: UUID (PK)
*   `email`: String (Unique, validación `@uabc.edu.mx`)
*   `password_hash`: String
*   `name`: String
*   `phone`: String (Obligatorio; canónico `+52XXXXXXXXXX`, cualquier región mexicana)
*   `is_moderator`: Boolean (Default: false)
*   `created_at`: DateTime

### `Publication` (Publicación)
*   `id`: UUID (PK)
*   `type`: Enum `PublicationType` (`LIVE`, `STATIC`)
*   `seller_id`: UUID (FK -> User)
*   `title`: String
*   `description`: Text
*   `price`: Decimal (Precisión: 10,2)
*   `price_before_ganga`: Decimal(10,2) nullable; ampliación aditiva 0016. Se captura del precio real bajo el bloqueo de activación y se expone como string/null para tachar el precio previo; no se edita desde DTO ni se reconstruyen históricos.
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
*   `unit_price`: Decimal(10,2) (precio fijado al confirmar la reserva; esquema/migración verificados en 0010)
*   `idempotency_key`: UUID (clave de solicitud; único por `(buyer_id, idempotency_key)`, esquema/migración verificados en 0010)
*   `resolved_at`: DateTime (Nullable, cuándo se completó/canceló/expiró)

No se impone unicidad por `(buyer_id, publication_id)`: varias reservas activas del mismo comprador y publicación son válidas si hay stock. Los dos campos y el CHECK de stock están migrados y verificados por 0010; la semántica HTTP/transaccional de reservas corresponde a 0001.

### `Report` (Reporte, funcionalidad SHOULD)
*   `reporter_id`: UUID (FK -> User)
*   `publication_id`: UUID (FK -> Publication)
*   `reason`: String
*   `created_at`: DateTime
*   Un mismo usuario cuenta como máximo una vez por publicación: restricción única `(reporter_id, publication_id)` antes de activar RF-14.

**Contrato de nombres:** El modelo Prisma y el contrato REST usan `User`, UUID y campos `email`, `password`, `name`, `phone` (en persistencia `password_hash`). El backend de autenticación ya usa este contrato y compila; el cliente móvil requiere su adaptación en 0002. La migración existente que introduce el modelo nuevo elimina tablas antiguas; conservarla si ya está aplicada y usar la transición segura de 0010 tras inventario/respaldo/ensayo en cada entorno. El estado `FINISHED` representa también una publicación `STATIC` marcada como «Vendida» en la UI; no se necesita un enum adicional para esa acción.

## 3. Contratos de API REST (Endpoints Core)

Para garantizar consistencia, el Backend deberá exponer las siguientes rutas base:

*   **Autenticación**
    *   `GET /auth/me` (JWT, CurrentUser): `{id,name,email,phone}` del propio usuario; 401 sin sesión válida. Proyección explícita, sin hash/token/flags internos, sin parámetro de propietario. Ampliación 0026, sin cambio de login/register.
    *   `POST /auth/register` (Body: email, password, name, phone; diez dígitos mexicanos con o sin `+52`, persistidos como `+52XXXXXXXXXX`)
    *   `POST /auth/login` -> Retorna JWT Token.
*   **Publicaciones**
    *   Búsqueda 0025: `GET /publications` admite `q` opcional (frase hasta 100 caracteres tras trim/normalización de espacios). Coincidencia parcial en título o descripción, case-insensitive, intersectada con type/zoneId/categoryId y visibilidad. Vacío equivale a omitir; arrays/no string/longitud inválida →400. %, _ y barra inversa literales. Misma proyección pública y orden; sin migración ni nueva ruta.
    *   `POST /publications` (Requiere JWT, crea Viva o Estática)
    *   `GET /publications?type=LIVE&zoneId=X` (Filtros por query params)
    *   `GET /publications/mine` (JWT; solo publicaciones del vendedor, incluidas agotadas, futuras y finalizadas; sin teléfonos)
    *   `GET /publications/:id` (Detalle; la exposición de teléfonos depende de RF-06/RF-07)
    *   `PATCH /publications/:id` (Solo vendedor; campos editables según tipo)
    *   `PATCH /publications/:id/ganga` (Activar ganga manualmente; la desactivación posterior no forma parte de RF-11/RF-12)
    *   `POST /publications/:id/finish` (Cierre manual anticipado)
    *   `POST /publications/:id/sold` (Solo `STATIC`; cambia `ACTIVE → FINISHED` y la UI muestra «Vendido»)
    *   `POST /publications/:id/physical-sale` (Solo `LIVE`; decrementa una unidad disponible sin afectar reservas)
    *   `GET /zones` y `GET /categories?type=LIVE|STATIC` (Catálogos para formularios y filtros)
    *   `POST /uploads` (Requiere JWT; devuelve URL de imagen para `image_url`)
*   **Reservas (Transacciones Seguras)**
    *   `POST /reservations` (Body: `{ publicationId }`, JWT y encabezado obligatorio `Idempotency-Key: <UUID>`; clave ausente o inválida: `400`). *Este endpoint es crítico y debe envolverse en un `prisma.$transaction` con bloqueo pesimista.* Primera creación: `201` con `{ id, publicationId, publicationTitle, status, reservedAt, expiresAt, unitPrice, sellerContact }`, donde `unitPrice` es cadena decimal de dos posiciones, fechas ISO 8601 y `sellerContact.phone` es canónico. Mismo comprador/clave/publicación: `200` con la reserva existente y su estado actual, sin otro descuento ni evento; misma clave para otra publicación: `409`. Una acción nueva requiere otra clave y puede crear otra reserva del mismo comprador si hay stock.
    *   `GET /reservations/mine` (JWT; lista de reservas propias, cada una con ID, título, estado, precio fijado y plazo, aun si ya no es pública la publicación; contacto conforme a RF-13).
    *   `GET /publications/:id/reservations` (JWT; solo vendedor propietario, lista de reservas de esa publicación con ID, comprador y estado; teléfono del comprador únicamente según RF-13; ajeno `403`).
    *   `GET /reservations/:id` (JWT; detalle para su comprador o vendedor propietario; ajeno `403`, inexistente `404`).
    *   `POST /reservations/:id/complete` (Solo permitido para el `seller_id`).
    *   `POST /reservations/:id/cancel` (Solo permitido para el `buyer_id`).

## 4. Estándar de Respuestas de Error

Ampliación aditiva de reservas (0023, 2026-11-06): las respuestas autorizadas de creación/reintento, consulta, listados y resolución añaden `publicationImageUrl: string | null`, obtenida de `Publication.image_url` junto a `publicationTitle`. Es la fotografía actual; no representa una instantánea histórica. Sigue disponible para la reserva aunque la publicación deje de ser pública por stock/horario. Sin migración, nuevos endpoints o cambios de permisos/contactos. El cliente normaliza uploads al origen API actual y admite campo ausente en servidores anteriores.

### Contratos concretos de fase 3 — 2026-10-05

- Reservas: JWT en todas las rutas, UUID e Idempotency-Key obligatorios, normalizados en minúsculas. Cuerpos de complete/cancel vacíos; éxito 200, estado terminal o plazo vencido 409; permiso ajeno 403 e inexistente 404. Precio y vencimiento se calculan al reservar bajo bloqueo, plazo fijo 1 200 000 ms; reintento mismo comprador/clave devuelve estado actual 200 sin stock/evento adicionales. Clave cruzada 409, otra clave puede crear otra reserva.
- Lecturas: comprador recibe sellerContact.phone en su reserva confirmada; vendedor relacionado recibe buyer {id,name} y buyerContact.phone solo mientras ACTIVE y antes del vencimiento. Ajeno 403. Feed/LIVE público/eventos no contienen contactos. Apertura WhatsApp móvil permanece en fase 5.
- POST /publications/:id/finish: cuerpo vacío, solo propietario LIVE ACTIVE antes del fin, 200 FINISHED, 403 ajeno, 409 tipo/estado incompatible. Conserva reservas y publica publication_expired tras cierre. Fin natural persiste FINISHED y publica el mismo evento una vez por transición.
- PATCH /publications/:id/ganga: cuerpo vacío, propietario LIVE ACTIVE en horario con modo MANUAL/mínimo configurado/no activada →200. Ajeno 403, inexistente 404, estado/tipo/modo incompatible/repetición 409. SCHEDULED se ejecuta por worker; nuevo precio/evento en cadena decimal de dos posiciones. Feed ordena gangas primero, después created_at/id descendentes.
- Editar horario/configuración reprograma jobs después del commit. Solo crear/reprogramar una ganga aún no activa exige disparo futuro; editar título/stock de una ganga activa no revalida el disparo histórico como futuro. Precio/configuración de ganga activa inmutables.

### Contratos concretos de fase 2 (verificados el 2026-10-05)

- Publicaciones: JSON con campos snake_case de Publication; `price` numérico positivo con hasta dos decimales y máximo 99999999.99, respuesta decimal en cadena de dos posiciones. `seller_id` procede de JWT. LIVE requiere initial_stock >0 e inicio/fin ISO con zona; STATIC rechaza campos LIVE. PATCH admite campos comunes y, en LIVE, current_stock >=0 y horario; type/estado/propietario/initial_stock no se editan. Detalles en [0003](../specs/0003-publicaciones-en-vivo/spec.md) y [0004](../specs/0004-catalogo-estatico/spec.md).
- GET feed/detalle: ACTIVE; LIVE además inicio <= ahora < fin y stock >0. Detalle no visible →404. Feed y LIVE no incluyen teléfono; STATIC ACTIVE en detalle añade `{sellerContact: {phone}}`. Vendedor público solo `{id,name}`.
- Sold/physical-sale: cuerpo vacío, éxito 200, propiedad 403, inexistente 404, estado/tipo/stock incompatible 409. Bloqueo de la fila compartido por edición y venta física. No existe borrado genérico aprobado.
- Upload: JWT, multipart `file` único, JPEG/PNG/WebP detectado por contenido, máximo 5 MiB; 201 `{image_url}` absoluto, 400 formato/campo ausente o inválido, 413 tamaño, 500 escritura. `/uploads` se sirve con nosniff. Imagen en publicación debe existir en almacenamiento local y pertenecer al origen público de la API.
- Catálogos/query: `type` opcional (LIVE/STATIC); zoneId/categoryId enteros positivos, filtros AND, entradas desconocidas/inexistentes/cruzadas →400, coincidencias vacías →200 []. [0005](../specs/0005-catalogos-y-filtros/spec.md).
- Configuración ganga en creación/edición LIVE se valida y guarda como dependencia mínima de RF-11. Activación, encolado, reprogramación y eventos de 0006 pertenecen a fase 3; la configuración sola no acredita RF-11/12 completos.
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
    *   El vendedor puede confirmar una reserva activa previa hasta que venza su plazo de 20 minutos aunque la publicación haya llegado a `end_time`.
    *   Cualquier intento de modificar entidades ajenas debe retornar **403 Forbidden**.
*   **Contacto:** El teléfono de una venta en vivo no aparece en el feed ni en el detalle público; se entrega al comprador solo tras confirmar su reserva. El contacto de una venta estática activa es directo, de acuerdo con RF-06. El teléfono del comprador se entrega únicamente al vendedor relacionado con una reserva activa.

## 6. Diccionario de Eventos en Tiempo Real (Socket.io)
Para evitar asimetrías entre Backend y Frontend, se usarán estrictamente estos nombres de eventos:
*   `Emisión desde Servidor`: 
    *   `stock_updated`: Payload `{ publicationId: UUID, newStock: Int }`. Emitido después de confirmar cualquier cambio efectivo del stock disponible: reserva, cancelación, expiración de reserva o venta física.
    *   `publication_expired`: Payload `{ publicationId: UUID }`. Emitido cuando el temporizador de una publicación llega a 0.
    *   `ganga_activated`: Payload `{ publicationId: UUID, newPrice: Decimal }`.
*   `Suscripción de Cliente`:
    *   El cliente móvil se suscribirá a un "room" global o de zona para escuchar actualizaciones solo de lo que tiene renderizado en su feed.

## 7. Estrategia de Tareas en Segundo Plano (Background Jobs)
*   **Colas (BullMQ + Redis):**
    *   `reservation_queue`: Al crearse una reserva, se encola un trabajo para la fecha límite de 20 minutos. Cancelar el job tras confirmar/cancelar es una optimización; el worker siempre relee estado y vencimiento en BD antes de liberar stock. Una conciliación recupera reservas vencidas si falló el encolado o se reinició el proceso.
    *   `ganga_queue`: Si un vendedor programa el "Precio Ganga" N minutos antes del fin, se encola un trabajo con el *delay* correspondiente. Reprogramar el horario invalida el trabajo anterior; el worker verifica configuración y estado en BD antes de activar.
    *   `publication_queue`: Persiste el fin natural y publica `publication_expired`; comprueba fecha esperada y estado bajo bloqueo. Las tres colas comparten Redis con AOF y política noeviction en desarrollo, jobs con reintentos exponenciales y namespace `BULLMQ_PREFIX` (default tapcampus). QueueService registra errores de encolado sin revertir un commit SQL; JobsService reconcilia por lotes al arrancar y periódicamente. Jobs obsoletos se invalidan por comparación de fecha/configuración en BD. Workers se cierran antes de desconectar Prisma y las colas. Socket.io comparte el puerto REST y agrega cada conexión al room global `feed`.

## 8. Datos Semilla (Data Seeding)
Al inicializar la base de datos (`prisma db seed`), se deben insertar obligatoriamente los siguientes catálogos correspondientes a la UABC:
*   **Zonas:** "Facultad de Ingeniería", "Facultad de Artes", "Biblioteca Central", "Cafetería Principal", "Gimnasio". Esta es la lista de cinco zonas del MVP; seed y remapeo seguro están verificados en 0010. Cada entorno adicional exige inventario/respaldo/ensayo propios.
*   **Categorías (Ventas Vivas):** "Comida Fuerte", "Snacks", "Bebidas", "Postres".
*   **Categorías (Ventas Estáticas):** "Libros", "Material Escolar", "Batas/Uniformes", "Electrónica".

## 9. Variables de Entorno (`.env.example`)

Desarrollo en redes que no permiten LAN: el túnel de Metro sirve el proyecto a Expo Go; la API requiere su propio origen accesible en `EXPO_PUBLIC_API_URL`. HTTP y Socket.io usan ese origen. El cliente resuelve las rutas `/uploads/<uuid>.(png|jpg|webp)` en el origen actual para que imágenes guardadas con una IP previa sigan siendo accesibles. `PUBLIC_BASE_URL` del backend debe coincidir para nuevos uploads. Reiniciar Metro tras cambiar variables y backend tras cambiar su entorno; los túneles son temporales. Ver 0014.
El proyecto Backend requiere la definición estricta de las siguientes variables para operar:
*   `DATABASE_URL` (URL de conexión a PostgreSQL)
*   `JWT_SECRET` (Llave secreta de firma de Tokens)
*   `REDIS_URL` (Conexión al manejador de colas BullMQ)
*   `BULLMQ_PREFIX` (Opcional, predeterminado `tapcampus`; separar por entorno/base de datos para evitar cruzar jobs)
*   `RECONCILIATION_INTERVAL_MS` (Opcional, predeterminado `30000`, entero >=100; conciliación adicional al arranque)
*   `PORT` (Puerto expuesto de NestJS, usualmente 3000)
*   `CORS_ORIGINS` (Orígenes web separados por coma; desarrollo: `http://localhost:8081,http://localhost:19006`; las solicitudes nativas sin Origin siguen disponibles)
*   `UPLOADS_DIR` (Opcional, predeterminado `uploads` relativo al directorio de arranque Backend; directorio local de imágenes)
*   `PUBLIC_BASE_URL` (Opcional, origen público HTTP(S) accesible desde el móvil, sin path; detrás de proxy define la URL externa de imágenes. Sin variable se usa el origen de la petición)

## 10. Estrategia de Despliegue (Deployment)
Para pasar a producción el MVP, se utilizará la siguiente infraestructura:
*   **Base de Datos (PostgreSQL):** Neon.tech o Supabase (Opciones Serverless de capa gratuita generosa).
*   **Backend (NestJS + Redis):** Render (Web Service para Node.js y servicio Redis administrado).
*   **Frontend Móvil (React Native):** Empaquetado a través de EAS Build (Expo Application Services) para generar los binarios `.apk` (Android) y distribución en TestFlight/PlayStore.
