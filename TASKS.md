# TapCampus - Task Tracker Detallado

*Uso de este archivo: Lista de verificación. La IA debe marcar con `[x]` las tareas conforme se vayan completando.*

## FASE 1: Configuración Inicial y Base de Datos (Infraestructura)
- [x] **1.1 Inicializar Backend (NestJS):** Generar el proyecto NestJS base. Configurar `ValidationPipe` global para validar DTOs, configurar CORS y el Global Exception Filter para atrapar errores y formatearlos según `03_ARCHITECTURE.md`.
- [x] **1.2 Configurar Prisma y BD:** Instalar Prisma CLI, inicializarlo y conectar a una base de datos PostgreSQL local o remota mediante el archivo `.env`.
- [x] **1.3 Definir Esquema Prisma:** Traducir el Diccionario de Datos de `03_ARCHITECTURE.md` al archivo `schema.prisma`. Incluir Enums (`PublicationType`, `PublicationStatus`), relaciones y uso de UUIDs.
- [x] **1.4 Script de Migración y Seed:** Crear y ejecutar `prisma migrate dev`. Desarrollar el archivo `seed.ts` para poblar las 5 Zonas y las Categorías base correspondientes a la UABC.

## FASE 2: Backend - Autenticación y API Básica
- [ ] **2.1 Módulo de Autenticación (JWT):** Implementar AuthModule con Passport y JWT. Crear endpoint `POST /auth/register` (validando estrucuralmente regex `@uabc.edu.mx` y hasheando password con bcrypt). Crear `POST /auth/login` para devolver el token.
- [ ] **2.2 Middleware/Guards de Autenticación:** Crear un `JwtAuthGuard` para proteger rutas. Añadir decorador `@CurrentUser()` para inyectar el usuario autenticado en los controladores.
- [ ] **2.3 Subida de Imágenes (Multer):** Configurar Multer para recibir form-data. Guardar la imagen localmente en `/uploads` y retornar la URL estática para guardarla en la base de datos.
- [ ] **2.4 CRUD de Publicaciones (Vendedor):** Implementar `POST /publications` usando DTOs estrictos. Añadir validación de propiedad (Ownership) para permitir editar o borrar (Soft Delete) solo al creador (`seller_id === user.id`).
- [ ] **2.5 Listado y Filtros (Comprador):** Implementar `GET /publications` aceptando Query Params opcionales (`?zoneId=X&categoryId=Y&type=LIVE`) para el filtrado.

## FASE 3: Backend - Core Complejo (Concurrencia y Eventos)
- [ ] **3.1 Módulo de Reservas (Transacción Segura):** Implementar `POST /reservations`. **CRÍTICO:** Usar `$queryRaw` o transacción interactiva de Prisma con `SELECT ... FOR UPDATE` para evitar condiciones de carrera si el `current_stock` es 1. Retornar 409 si falla.
- [ ] **3.2 Acciones de Reserva (Completar/Cancelar):** Crear endpoints para confirmar entrega (solo el vendedor) y cancelar (solo el comprador). Actualizar la Máquina de Estados.
- [ ] **3.3 Configuración de BullMQ (Redis):** Instalar BullMQ, conectar a Redis e instanciar el Worker encargado de procesar la lógica de expiración en segundo plano.
- [ ] **3.4 Job de Expiración (20 mins):** Al crear una reserva, inyectar un trabajo a la `reservation_queue` con un delay de 20 min. Al ejecutarse, verificar si el estado sigue en `ACTIVE` y, de ser así, devolver stock y emitir evento Socket.
- [ ] **3.5 WebSockets Gateway (Socket.io):** Inicializar el Gateway. Implementar emisión de eventos obligatorios: `stock_updated`, `publication_expired` y `ganga_activated`.

## FASE 4: Frontend Móvil - Arquitectura (React Native)
- [ ] **4.1 Configurar Expo y Tema:** Inicializar Expo Router. Crear la estructura de carpetas y configurar el archivo `theme.ts` con todos los colores, tipografías y bordes definidos en la guía UI/UX.
- [ ] **4.2 Componentes Base UI:** Crear componentes reutilizables: `PrimaryButton`, `CustomInput` (con íconos y manejo de errores rojo), y `Card` con sombras (respetando las Heurísticas de Diseño).
- [ ] **4.3 Interceptor HTTP (Axios):** Configurar cliente Axios con interceptor para inyectar el JWT guardado en `AsyncStorage` en todas las peticiones salientes.

## FASE 5: Frontend Móvil - Pantallas
- [ ] **5.1 Pantallas de Auth:** Desarrollar `Login` y `Registro` usando `KeyboardAvoidingView`. Conectar al endpoint y guardar el JWT exitoso.
- [ ] **5.2 Feed Principal (Home):** Pantalla con Tabs (En Vivo / Estático). Renderizar lista de publicaciones usando WebSockets para escuchar cambios de stock sin recargar. Integrar menús de Filtro por Zona.
- [ ] **5.3 Detalle y Reserva (Comprador):** Pantalla o Modal con info del producto. Botón de "Reservar". Si tiene éxito, cambiar interfaz para mostrar el link profundo a WhatsApp (`Linking.openURL`).
- [ ] **5.4 Formulario de Publicación:** Pantalla para el Vendedor. Implementar ImagePicker para la cámara/galería. Formularios con validación (no dejar poner stock negativo).
- [ ] **5.5 Dashboard de Vendedor (Mis Ventas):** Pantalla de control del vendedor. Renderizar botones rápidos para: "Activar Ganga Manual", "-1 Venta Física" y "Finalizar Publicación".

## FASE 6: Validación, QA y Despliegue
- [ ] **6.1 Pruebas de Estrés:** Escribir y ejecutar el script que lance 50 peticiones concurrentes para asegurar la integridad transaccional de las reservas.
- [ ] **6.2 Despliegue Backend:** Subir PostgreSQL y Redis a la nube. Configurar variables de entorno y desplegar la API NestJS en producción.
- [ ] **6.3 Empaquetado Móvil:** Generar APK de prueba usando Expo EAS Build y distribuir localmente.
