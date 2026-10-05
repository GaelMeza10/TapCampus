# TapCampus - Task Tracker Detallado

*Uso de este archivo: Lista de verificación. La IA debe marcar con `[x]` las tareas conforme se vayan completando.*

El proceso de desarrollo y la evidencia por feature están en `docs/08_DEVELOPMENT_WORKFLOW.md` y `specs/`. En FASE 0, `[x]` indica documento completado; en las demás fases, comportamiento implementado y verificado. La presencia de un archivo o una pantalla no basta. La auditoría está en `docs/09_PROJECT_AUDIT.md`.

## FASE 0: Análisis y documentación
- [x] **0.1 Constitución y proceso:** Definir principios, artefactos, puertas de calidad, cambios y convergencia.
- [x] **0.2 Plantillas y trazabilidad:** Crear plantillas `spec/plan/tasks/decisions/verification`, índice y comprobador de referencias.
- [x] **0.3 Línea base documental:** Registrar discrepancias y ocho expedientes de funcionalidades; no confundir documentación con implementación completada.
- [x] **0.4 Matriz de trazabilidad:** Relacionar todos los RF/RNF con historias, backlog, features y estado de evidencia en `docs/10_TRACEABILITY.md`.
- [x] **0.5 Cerrar decisiones de producto y contratos documentales:** Incorporar las cuatro decisiones del usuario y sincronizar requisitos, arquitectura, flujos, expedientes y trazabilidad. Los GAP técnicos de implementación siguen pendientes.

**Orden para comenzar:** inspeccionar backend, BD y datos de 1.1–1.4 sin ejecutar migraciones → 0002 autenticación (2.1–2.2, 4.3, 5.1) para corregir el contrato y la compilación → cerrar 1.1–1.4 con migración y seed seguros → 0005 catálogos (2.7) → imágenes y publicaciones 0003/0004 con filtros 0005 (2.3–2.6) → base del gateway 0007 (3.5) → 0001 reservas (3.1–3.4) → 0006 ganga (3.6) → integrar eventos 0007 y contacto 0008 (5.6) → pantallas restantes y validación. Dentro de cada funcionalidad, seguir su `spec.md`, `plan.md`, `tasks.md` y `verification.md`; las casillas globales agrupan trabajo de varios expedientes y solo se cierran con evidencia.

## FASE 1: Configuración Inicial y Base de Datos (Infraestructura)
- [x] **1.1 Inicializar Backend (NestJS):** Build, arranque con PORT, ValidationPipe estricto, filtro global y CORS configurado comprobados en 0010 EV-01.
- [x] **1.2 Configurar Prisma y BD:** PostgreSQL 16.15 y conexión Prisma reales; validate, status y diff coherentes, build aprobado (0010 EV-01/02).
- [x] **1.3 Definir Esquema Prisma:** CHECK de stock, precio Decimal(10,2), clave UUID única por comprador y migración segura comprobados en PostgreSQL; ningún precio histórico se deduce del actual (0010 EV-03/04).
- [x] **1.4 Script de Migración y Seed:** Respaldo restaurado, transición conservadora, ensayo vacío/poblado y aplicación local comprobados; seed doble con cinco zonas/ocho categorías y FK conservadas (0010 EV-04/05).

## FASE 2: Backend - Autenticación y API Básica
- [ ] **2.1 Módulo de Autenticación (JWT):** Implementar AuthModule con Passport y JWT. Crear `POST /auth/register` con correo `@uabc.edu.mx`, teléfono mexicano con o sin `+52` normalizado y contraseña hasheada. Crear `POST /auth/login` para devolver el token.
- [ ] **2.2 Middleware/Guards de Autenticación:** Crear un `JwtAuthGuard` para proteger rutas. Añadir decorador `@CurrentUser()` para inyectar el usuario autenticado en los controladores.
- [ ] **2.3 Subida de Imágenes (Multer):** Configurar Multer para recibir form-data. Guardar la imagen localmente en `/uploads` y retornar la URL estática para guardarla en la base de datos.
- [ ] **2.4 Publicaciones (Vendedor):** Implementar creación/edición con DTOs estrictos y propiedad; usar transiciones `FINISHED` solo para «Vendido» de `STATIC` o cierre `LIVE` documentado. El borrado genérico requiere un RF nuevo.
- [ ] **2.5 Listado y Filtros (Comprador):** Implementar `GET /publications` aceptando Query Params opcionales (`?zoneId=X&categoryId=Y&type=LIVE`) para el filtrado.
- [ ] **2.6 Venta estática y venta física:** Implementar `POST /publications/:id/sold` para `STATIC` y `POST /publications/:id/physical-sale` para `LIVE`, con propiedad y stock atómico.
- [ ] **2.7 Catálogos:** Exponer `GET /zones` y `GET /categories?type=...`; la subida y servicio de imagen pertenecen a 2.3.

## FASE 3: Backend - Core Complejo (Concurrencia y Eventos)
- [ ] **3.1 Módulo de Reservas (Transacción Segura):** Implementar `POST /reservations` y consultas de reservas propias, detalle y listado del vendedor con permisos. Fijar precio, usar clave de idempotencia y permitir varias reservas del mismo comprador. **CRÍTICO:** Usar transacción interactiva con `SELECT ... FOR UPDATE`; devolver 200 y la reserva original al reintentar la misma clave, o 409 si no hay stock para una acción nueva.
- [ ] **3.2 Acciones de Reserva (Completar/Cancelar):** Crear endpoints para confirmar entrega (solo el vendedor, también tras `end_time` dentro de sus 20 minutos) y cancelar (solo el comprador). Actualizar la máquina de estados.
- [ ] **3.3 Configuración de BullMQ (Redis):** Instalar BullMQ, conectar a Redis e instanciar el Worker encargado de procesar la lógica de expiración en segundo plano.
- [ ] **3.4 Job de Expiración (20 mins):** Al crear una reserva, inyectar un trabajo a la `reservation_queue` con un delay de 20 min. Al ejecutarse, verificar si el estado sigue en `ACTIVE` y, de ser así, devolver stock y emitir evento Socket.
- [ ] **3.5 WebSockets Gateway (Socket.io):** Inicializar el Gateway. Implementar emisión de eventos obligatorios: `stock_updated`, `publication_expired` y `ganga_activated`.
- [ ] **3.6 Precio ganga programado:** Encolar, reprogramar y ejecutar la activación con BullMQ/Redis; impedir activación de publicaciones finalizadas y emitir `ganga_activated` tras confirmar el cambio.

## FASE 4: Frontend Móvil - Arquitectura (React Native)
- [ ] **4.1 Configurar Expo y Tema:** Expo Router y `theme.js` ya existen; revisar la cobertura de todos los tokens de UI/UX y la navegación real antes de cerrar la casilla.
- [ ] **4.2 Componentes Base UI:** Crear componentes reutilizables: `PrimaryButton`, `CustomInput` (con íconos y manejo de errores rojo), y `Card` con sombras (respetando las Heurísticas de Diseño).
- [ ] **4.3 Interceptor HTTP (Axios):** Existe el interceptor que lee JWT de `expo-secure-store`; falta verificación de integración con una ruta protegida.

## FASE 5: Frontend Móvil - Pantallas
- [ ] **5.1 Pantallas de Auth:** Desarrollar `Login` y `Registro` usando `KeyboardAvoidingView`; aceptar teléfonos de cualquier región mexicana con diez dígitos o `+52`. Conectar al endpoint y guardar el JWT exitoso.
- [ ] **5.2 Feed Principal (Home):** Pantalla con Tabs (En Vivo / Estático). Renderizar lista de publicaciones usando WebSockets para escuchar cambios de stock sin recargar. Integrar menús de Filtro por Zona.
- [ ] **5.3 Detalle y Reserva (Comprador):** Mostrar reservas independientes con precio y plazo propios; conservar la clave en reintentos, generar otra al apartar otra unidad y mostrar WhatsApp tras confirmación de cada reserva.
- [ ] **5.4 Formulario de Publicación:** Pantalla para el Vendedor. Implementar ImagePicker para la cámara/galería. Formularios con validación (no dejar poner stock negativo).
- [ ] **5.5 Dashboard de Vendedor (Mis Ventas):** Mostrar reservas activas por separado, incluso varias del mismo comprador, y permitir confirmar cada entrega dentro de sus 20 minutos. Añadir controles de "Activar Ganga Manual", "-1 Venta Física" y "Finalizar Publicación".
- [ ] **5.6 Contacto WhatsApp:** Integrar enlace directo en `STATIC` y enlace tras reserva confirmada en `LIVE`; proteger teléfonos en respuestas públicas y probar URL/errores conforme a 0008.

## FASE 6: Validación, QA y Despliegue
- [ ] **6.1 Pruebas de Estrés:** Ejecutar 50 reservas concurrentes con claves distintas para la última pieza y comprobar 1×201/49×409; probar aparte reintentos concurrentes con la misma clave, sin doble descuento. Registrar resultados en 0001 `verification.md`.
- [ ] **6.2 Despliegue Backend:** Subir PostgreSQL y Redis a la nube. Configurar variables de entorno y desplegar la API NestJS en producción.
- [ ] **6.3 Empaquetado Móvil:** Generar APK de prueba usando Expo EAS Build y distribuir localmente.
- [ ] **6.4 Moderación SHOULD:** Si se incluye RF-14, cerrar 0009 DEC-01/02 antes de implementar; después añadir unicidad de denunciante/publicación, reporte, ocultamiento al tercer denunciante distinto y revisión del moderador. Registrar EV-01..03 de 0009.
