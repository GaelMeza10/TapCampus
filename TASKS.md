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
- [x] **1.5 Publicaciones de demostración (opcional):** 24 ejemplos en PostgreSQL local (12 LIVE/12 STATIC, 16 fotografías ilustrativas nuevas); seed repetido 16→0, feed HTTP y PNG 200 verificados en 0012 EV-04..07. Los ocho ejemplos originales conservan EV-01..03.

- [x] **1.6 Gangas de demostración:** 0027 EV-01..03: tres LIVE Demo con precio previo/actual y fotos; seed real 3→0, hashes de datos anteriores intactos y feed/fotos HTTP 200. Solo datos locales, sin cerrar UAT.

## FASE 2: Backend - Autenticación y API Básica
- [x] **2.1 Módulo de Autenticación (JWT):** Registro/login reutilizados y verificados: dominio UABC, hash bcrypt, teléfono canónico, duplicados y JWT. 0002 EV-08.
- [x] **2.2 Middleware/Guards de Autenticación:** Passport JwtStrategy, JwtAuthGuard y @CurrentUser verificados en rutas protegidas; tokens inválidos/expirados →401. 0002 EV-08.
- [x] **2.3 Subida de Imágenes (Multer):** Multipart autenticado, JPEG/PNG/WebP por contenido y límite 5 MiB; URL estática y errores verificados. 0003 EV-08.
- [x] **2.4 Publicaciones (Vendedor):** Creación/edición LIVE/STATIC, DTO estrictos, propiedad y validaciones; sin borrado genérico. 0003 EV-09/10 y 0004 EV-06. Cierre manual LIVE queda en fase posterior.
- [x] **2.5 Listado y Filtros (Comprador):** GET feed/detalle con visibilidad y filtros opcionales type/zoneId/categoryId AND, sin contacto LIVE público. 0003 EV-09 y 0005 EV-06.
- [x] **2.6 Venta estática y venta física:** Sold STATIC y physical-sale LIVE verificados con propiedad/estado y PostgreSQL: última pieza 1×200/24×409, reservas intactas. 0003 EV-10 y 0004 EV-06.
- [x] **2.7 Catálogos:** GET zones/categories usa catálogos de fase 1, exactitud/queries verificadas. 0005 EV-06.

**Cierre fase 2 (2026-10-05):** build, tsc, 9 unitarias, 1 E2E existente, suite HTTP/SQL test:phase2 y check-sdd aprobados. Base original intacta. Esto cierra el backend 2.1–2.7; 0002–0005 conservan criterios móviles/eventos/reservas de fases posteriores pendientes.

## FASE 3: Backend - Core Complejo (Concurrencia y Eventos)
- [x] **3.1 Módulo de Reservas (Transacción Segura):** Implementar `POST /reservations` y consultas de reservas propias, detalle y listado del vendedor con permisos. Fijar precio, usar clave de idempotencia y permitir varias reservas del mismo comprador. **CRÍTICO:** Usar transacción interactiva con `SELECT ... FOR UPDATE`; devolver 200 y la reserva original al reintentar la misma clave, o 409 si no hay stock para una acción nueva.
- [x] **3.2 Acciones de Reserva (Completar/Cancelar):** Crear endpoints para confirmar entrega (solo el vendedor, también tras `end_time` dentro de sus 20 minutos) y cancelar (solo el comprador). Actualizar la máquina de estados.
- [x] **3.3 Configuración de BullMQ (Redis):** Instalar BullMQ, conectar a Redis e instanciar el Worker encargado de procesar la lógica de expiración en segundo plano.
- [x] **3.4 Job de Expiración (20 mins):** Al crear una reserva, inyectar un trabajo a la `reservation_queue` con un delay de 20 min. Al ejecutarse, verificar si el estado sigue en `ACTIVE` y, de ser así, devolver stock y emitir evento Socket.
- [x] **3.5 WebSockets Gateway (Socket.io):** Inicializar el Gateway. Implementar emisión de eventos obligatorios: `stock_updated`, `publication_expired` y `ganga_activated`.
- [x] **3.6 Precio ganga programado:** Encolar, reprogramar y ejecutar la activación con BullMQ/Redis; impedir activación de publicaciones finalizadas y emitir `ganga_activated` tras confirmar el cambio.

**Cierre fase 3 (2026-10-05):** 3.1–3.6 y estrés 6.1 aprobados: 50 claves distintas 1×201/49×409; misma clave 1×201/49×200/un ID. Worker/reinicio/conciliación/carreras, dos clientes Socket.io y ganga/reprogramación aprobados. Build/tsc/lint, 9 unitarias/1 E2E, fases 2/3 y check-sdd aprobados. AC→T→EV en 0001/0003/0006/0007/0008 y phase3.json; UI/Linking pendientes.

## FASE 4: Frontend Móvil - Arquitectura (React Native)
- [x] **4.4 Actualizar Expo SDK 58:** Dependencias alineadas, Doctor 20/20, tipos, 32 pruebas y exportación Android/iOS/web aprobados; 0013 EV-01..03. Ejecución nativa sigue en fase 5/6.3.
- [x] **4.1 Configurar Expo y Tema:** Expo Router con guardas y ancla sin bucles; `theme.js` fuera de rutas, tokens de UI/UX completos. 0011 EV-01/02/04.
- [x] **4.2 Componentes Base UI:** `PrimaryButton`, `CustomInput` con ícono/error y `Card` con `RADIUS.lg`/`SHADOW.card` reutilizados y probados. 0011 EV-02/03.
- [x] **4.3 Interceptor HTTP (Axios):** Bearer presente/ausente y 401 probados contra `GET /reservations/mine` protegido, con sesión/navegación en memoria. 0002 EV-09.

**Cierre fase 4 (2026-10-13):** Frontend tsc, 2 suites/9 pruebas, exportación Expo Router y prueba HTTP Nest en memoria aprobados; check-sdd aprobado. No se inició app/backend ni se usaron puertos por indicación del usuario. La aceptación de formularios completos y el uso en dispositivo corresponden a fase 5.

## FASE 5: Frontend Móvil - Pantallas
- [ ] **5.1 Pantallas de Auth:** Desarrollar `Login` y `Registro` usando `KeyboardAvoidingView`; aceptar teléfonos de cualquier región mexicana con diez dígitos o `+52`. Conectar al endpoint y guardar el JWT exitoso.
- [ ] **5.2 Feed Principal (Home):** Pantalla con Tabs (En Vivo / Estático). Renderizar lista de publicaciones usando WebSockets para escuchar cambios de stock sin recargar. Integrar menús de Filtro por Zona.
- [ ] **5.3 Detalle y Reserva (Comprador):** Mostrar reservas independientes con precio y plazo propios, estado en español y sin UUID visible; conservar la clave en reintentos, generar otra al apartar otra unidad y mostrar WhatsApp tras confirmación de cada reserva.
- [ ] **5.4 Formulario de Publicación:** Pantalla para el Vendedor. Implementar ImagePicker para la cámara/galería. Formularios con validación (no dejar poner stock negativo).
- [ ] **5.5 Dashboard de Vendedor (Mis Ventas):** Mostrar reservas activas por separado, incluso varias del mismo comprador, con etiquetas en español y sin IDs visibles; permitir confirmar cada entrega dentro de sus 20 minutos. Añadir controles de "Activar Ganga Manual", "-1 Venta Física" y "Finalizar Publicación".
- [ ] **5.6 Contacto WhatsApp:** Integrar enlace directo en `STATIC` y enlace tras reserva confirmada en `LIVE`; proteger teléfonos en respuestas públicas y probar URL/errores conforme a 0008.
- [x] **5.7 Mejoras del prototipo Figma:** Ocho mejoras UX aplicadas y revisadas en 0015 EV-01..09: formularios, estados de venta, catálogos, tiempos, reservas, ganga, gestión estática y navegación. Cubre diseño; implementación y aceptación móvil siguen en 5.1–5.6.
- [x] **5.8 Implementación del rediseño Figma (técnica):** 0016 EV-01..10: pantallas reales, tema/Inter, filtros, navegación, formularios, reservas y ventas; precio previo aditivo migrado; 40 pruebas frontend, 9 backend, 311 solicitudes de integración y 18 capturas revisadas; bundles iOS/Android aprobados. No cierra 5.1–5.6 ni UAT sin recorrido físico.
- [x] **5.9 Iconos del prototipo:** 0017 EV-01..03: brújula/comprobante/bolsa en las 17 barras; 51 vectores, tres capturas y navegación inspeccionados. Alcance Figma.
- [x] **5.10 Selector de Mis ventas (prototipo):** 0018 EV-01..03: pestañas explícitas Con horario/Catálogo en siete estados, navegación y capturas revisadas; entregas completas con ganga. Alcance Figma.
- [x] **5.11 Auditoría integral de diseño Figma:** 0019 EV-01..05: tres páginas copiadas; 47 pantallas revisadas y ocho estados añadidos; tarjetas/campos/navegación reutilizables, texto adaptable y 416 destinos inspeccionados. Solo diseño y estructura; recorrido completo del reproductor y dispositivo por realizar.
- [x] **5.12 Encabezados compactos (Figma):** 0019 AC-05/T-05/EV-06: retirados 25 subtítulos en 20 pantallas y variantes; contenido reacomodado, cinco capturas revisadas y 416 destinos válidos. Copias revisadas; alcance visual.
- [x] **5.13 Aplicar prototipo revisado a Expo:** 0020 EV-01..04: navegación con SVG locales y selector Con horario/Catálogo, tarjetas uniformes, encabezados compactos y formularios/confirmaciones adaptables. 43 pruebas, tipos, 31 capturas a tres anchos y bundles Android/iOS aprobados. Aceptación física de 5.1–5.6 sigue separada.
- [x] **5.14 Impeccable: contexto, crítica y pulido en código:** 0021 EV-01..04: contexto confirmado, crítica y dos correcciones implementadas; 44 pruebas, tipos, 33 capturas auxiliares, exportaciones Android/iOS y convergencia documental aprobados. Teclado/foco nativos y aceptación de 5.1–5.6 siguen separados.
- [ ] **5.15 Confirmación antes de apartar:** 0022 implementa modal previo para primera/otra unidad, cierre sin efectos, envío único y reintento con misma clave; EV-01..06 técnica: 54 pruebas, tipos, 38 capturas y exportaciones Android/iOS aprobados. Falta aceptación nativa de foco/lector/texto ampliado (AC-05). Código, sin Figma.
- [x] **5.16 Foto del producto en Mis reservas (técnica):** 0023 EV-01..03: proyección autorizada con imagen, URLs al origen actual y miniatura con alternativa. 56 pruebas frontend, 10 backend, 40 capturas, tipos/build/lint/exports y lectura real aprobados; API actualizada para iPhone. Confirmación física de imagen por separado; no cierra 5.3.
- [x] **5.17 Cuenta y cierre de sesión (técnica):** 0024 EV-01..04 mueve logout a Cuenta global y aplica Impeccable/ui-ux-pro-max: foco/retorno, anuncios, objetivos Android y movimiento reducido. 62 pruebas, tipos, 47 capturas, exports y convergencia aprobados. Aceptación física por separado.
- [x] **5.18 Barra de búsqueda (técnica):** 0025 EV-01..05: q servidor por título/descripción combinado con filtros, barra/limpiar y estados. 66 pruebas frontend, 12 backend, 51 capturas, GET real y tipos/build/lint/exports aprobados. API activa actualizada; aceptación en iPhone por separado, no cierra 5.2.

- [x] **5.19 Navegación y Mi cuenta (técnica):** 0026 EV-01..04: cuarta pestaña, fondo translúcido e icono de persona; perfil propio real, errores sin mensajes técnicos y logout. 77 pruebas frontend/13 backend, 54 capturas, tipos/build/lint/exports y perfil HTTP aprobados. Sustituye hoja 0024; aceptación física separada.

**Avance fase 5 (2026-10-13):** Pantallas, servicios y contratos implementados; frontend tsc, exportación Expo, 8 suites/25 pruebas y contrato HTTP Nest en memoria aprobados. No se inició app/backend ni se usaron puertos de aplicación, según la restricción vigente registrada en el cierre de fase 4. Las casillas 5.1–5.6 siguen abiertas hasta comprobar flujos en dispositivo y contra API/BD/Redis/Socket.io reales; consultar EV nuevos de 0001–0008 y auditoría.

**Corrección de conexión móvil (2026-11-03):** 0014 añade timeout de 15 s y resolución de imágenes en el origen actual; API/PNG/Socket.io por túnel HTTPS y 35 pruebas aprobados. El usuario confirmó productos visibles en iPhone (EV-04); 5.2 sigue abierta por el resto de la aceptación integrada.

**Reanudación del recorrido móvil (2026-11-05):** 0016 EV-11: cinco migraciones aplicadas, servicios y dos túneles renovados; API LIVE 8/STATIC 12, imagen y Socket.io aprobados por HTTPS; bundle iOS 200 con origen nuevo verificado. QR temporal fuera del repositorio entregado al usuario, que confirmó disponer del iPhone. Las casillas 5.1–5.6 conservan su estado hasta obtener evidencia del recorrido en Expo Go.

**Registro en iPhone (2026-11-05):** 0002 EV-11 acredita reintento exitoso por red local tras reiniciar API fuera del entorno restringido: HTTP 201, una cuenta nueva en PostgreSQL y confirmación del usuario. 5.1 sigue abierta para los demás recorridos de sesión y validación móvil.

- [x] **5.20 Pestañas sin pila (técnica):** 0028 EV-01/02: Tabs protegidas reales, estado conservado y retornos desde detalle/formulario con dismissTo; 84 pruebas, tipos, bundles Android/iOS y check-sdd PASS. Gestos y aceptación física separados.

- [x] **5.21 Gangas reconocibles (técnica):** 0029 EV-01/02: precio actual primero, anterior tachado a la derecha, ahorro, etiqueta e identidad naranja en feed/detalle/ventas; 96 pruebas, 66 capturas auxiliares, tipos y exportaciones Android/iOS PASS. Reservas con precio fijado conservado; aceptación física separada.

- [x] **5.22 Oferta en lenguaje visible:** 0030 EV-01..03: textos de comprador/vendedor y tres títulos Demo actualizados; naranja y contratos conservados. 96 pruebas, tipos, 66 capturas, feed real y bundle iOS 200 con nuevo texto. Aceptación física separada.

## FASE 6: Validación, QA y Despliegue




- [x] **6.1 Pruebas de Estrés:** Ejecutar 50 reservas concurrentes con claves distintas para la última pieza y comprobar 1×201/49×409; probar aparte reintentos concurrentes con la misma clave, sin doble descuento. Registrar resultados en 0001 `verification.md`.
- [ ] **6.2 Despliegue Backend:** Subir PostgreSQL y Redis a la nube. Configurar variables de entorno y desplegar la API NestJS en producción.
- [ ] **6.3 Empaquetado Móvil:** Generar APK de prueba usando Expo EAS Build y distribuir localmente.
- [ ] **6.4 Moderación SHOULD:** Si se incluye RF-14, cerrar 0009 DEC-01/02 antes de implementar; después añadir unicidad de denunciante/publicación, reporte, ocultamiento al tercer denunciante distinto y revisión del moderador. Registrar EV-01..03 de 0009.
