# TapCampus

**Preparación de la entrega:** [instalación, seed, accesos y recorrido](docs/11_DELIVERY_GUIDE.md). Desde Backend, `npm run db:seed:delivery` añade seis cuentas ficticias, 48 publicaciones y doce reservas sobre doce categorías, conservando datos anteriores. Los accesos se guardan en Backend/.local/demo-access.json. [Verificación y limpieza 0046](specs/0046-seed-entrega-y-limpieza/verification.md).

Aplicación móvil universitaria que conecta vendedores y compradores dentro del campus en tiempo real. Permite publicar productos con stock en vivo, temporizador de disponibilidad y un sistema de reservas temporales, eliminando la dependencia de grupos de WhatsApp o redes sociales para coordinar ventas entre estudiantes.

---

## Problema que Resuelve

En los campus universitarios muchos estudiantes venden comida, snacks o materiales escolares como fuente de ingreso. Hoy toda esa coordinación ocurre por WhatsApp, Facebook o Instagram: el comprador no sabe dónde está el vendedor, si aún tiene stock o hasta qué hora estará disponible. TapCampus centraliza esa información en una sola app con datos en tiempo real.

---

## Tipos de Publicación

### Venta en Vivo (para comida y consumibles)
Tiene temporizador y stock reactivo. Desaparece del feed cuando el tiempo se agota o el stock llega a cero.

| Campo | Detalle |
|---|---|
| Foto | Obligatoria (al menos una imagen) |
| Título | Nombre corto del producto |
| Descripción | Texto libre (ingredientes, variantes, etc.) |
| Categoría | Comida Fuerte · Snacks · Bebidas · Postres |
| Precio | Precio normal por pieza/porción |
| Stock inicial | Piezas disponibles al publicar |
| Lugar | Zona del campus (selección de catálogo) |
| Hora inicio / fin | Lapso en que el vendedor estará en el punto |
| Precio ganga | Opcional; define precio mínimo al publicar |
| Modo activación | Manual (botón) o Programado (N minutos antes del fin) |

### Venta Fija o Estática (para material escolar, libros, electrónica)
Permanece activa hasta que el vendedor la marque como vendida. No tiene temporizador ni reservas; el contacto y la entrega se coordinan por WhatsApp directo desde la publicación.

| Campo | Detalle |
|---|---|
| Foto | Obligatoria y es el campo más importante |
| Título | Nombre descriptivo del artículo |
| Descripción | Estado (nuevo/usado), características |
| Categoría | Libros · Electrónica · Batas/Uniformes · Material Escolar |
| Precio | Precio de referencia visible en el catálogo |
| Lugar | Zona del campus (catálogo manual, sin GPS) |

---

## Funcionalidades Clave

### Sistema de Reservas (solo para ventas en vivo)
- El comprador aparta su porción con un **margen de tolerancia de 20 minutos**.
- Cada reserva fija el precio vigente al confirmarse; una ganga o edición posterior no cambia ese precio.
- El mismo comprador puede tener varias reservas activas de una publicación si hay stock. Una acción nueva crea otra reserva; reintentar la misma devuelve la existente sin otro descuento.
- Si no se concreta la entrega, la pieza se libera automáticamente; vuelve al feed si la publicación sigue activa y dentro de horario.
- Al terminar el horario, se bloquean reservas nuevas, pero el vendedor puede confirmar las previas dentro de sus respectivos 20 minutos.
- **Confirmación:** el vendedor confirma la entrega con un toque; el stock pasa a "vendido definitivo".
- **Cancelación por el comprador:** libera el stock de inmediato, sin esperar los 20 minutos.
- **Contacto bidireccional por WhatsApp:**
  - Contacto 0039 implementado técnicamente: en ventas en vivo visibles puede consultar al vendedor antes de reservar y coordinar desde la reserva confirmada después. La consulta previa no crea un apartado; apertura y retorno nativos pendientes de aceptación.
  - En cuanto existe una reserva, el vendedor puede contactar a ese comprador específico.

### Mecanismo Técnico de Concurrencia
La reserva de la última pieza está protegida con una **transacción de base de datos con bloqueo pesimista** (`SELECT ... FOR UPDATE`) sobre la fila del producto. Esto evita condiciones de carrera cuando varios compradores intentan apartar el mismo producto simultáneamente.

La expiración de reservas **no depende de temporizadores en memoria**; se maneja con **BullMQ + Redis** y una conciliación de reservas vencidas para recuperarse de reinicios o fallos de encolado. También se programan las activaciones de precio ganga.

### Precio Ganga (Elemento de Innovación)
- El vendedor puede habilitar un precio ganga al publicar, definiendo un precio mínimo.
- **No hay descuento gradual.** El precio baja de forma instantánea al activarse, manteniendo la incertidumbre para el comprador (no sabe cuándo ni si se activará).
- **Modo manual:** el vendedor presiona un botón cuando decide activarlo.
- **Modo programado:** se activa automáticamente N minutos antes de la hora de fin (configurable por el vendedor; puede cambiarse mientras la publicación esté activa).
- Al activarse, la publicación **sube de posición en el feed** y recibe un estilo visual distintivo (etiqueta/color) para maximizar la visibilidad.

### Botón de Finalizar Publicación
El vendedor puede cerrar su publicación en vivo manualmente antes de que expire el horario. Las nuevas reservas se bloquean de inmediato, pero las reservas activas en ese momento se respetan.

### Ajuste Manual de Stock (ventas en físico)
Si alguien compra directamente sin usar la app, el vendedor descuenta la pieza con un toque. Este descuento **solo afecta al stock disponible**, nunca a piezas ya reservadas en la app.

### Filtros de Búsqueda
- **Por zona del campus:** facultades, edificios o áreas (selección de catálogo predefinido, sin GPS).
- **Por categoría:** cada tipo de publicación usa su propio conjunto de categorías (no se mezclan comida con material escolar).

### Edición de Publicaciones
El vendedor puede editar precio, descripción, stock, horario y configuración de precio ganga mientras la publicación siga activa.

---

## Seguridad y Moderación

| Mecanismo | Descripción |
|---|---|
| Correo institucional | Solo se permite registro con `@uabc.edu.mx`; validación también en el servidor, sin verificación por email adicional |
| Teléfono mexicano | Se aceptan diez dígitos nacionales con o sin `+52`, de cualquier región de México; se guarda como `+52XXXXXXXXXX` |
| Hash de contraseñas | Buenas prácticas de NestJS (bcrypt o similar) |
| JWT con expiración | Tokens de sesión con tiempo de vida limitado |
| Filtro de palabras clave | RF-15 MUST, 0038 implementado técnicamente en creación/edición LIVE/STATIC; política v1, error por campo y borrador conservado. Aceptación nativa pendiente |
| Reportes de la comunidad | Varias denuncias acumuladas ocultan la publicación automáticamente para revisión |
| Rol de moderador | Campo booleano en `Usuario`; sin panel dedicado en el MVP (puede ser una vista simple o consulta directa a BD) |

---

## Stack Tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend móvil | React Native (Expo) | Interfaz nativa Android/iOS |
| Backend | NestJS (TypeScript) | API REST modular con principios de POO |
| ORM | Prisma | Puente tipado entre backend y base de datos |
| Base de datos | PostgreSQL | Modelo relacional de toda la lógica de negocio |
| Tiempo real | Socket.io | Eventos de inventario en vivo hacia la app móvil |
| Jobs programados | BullMQ + Redis | Expiración de reservas y activación de precio ganga |

---

## Modelo de Datos (Entidades Principales)

El contrato detallado y los nombres físicos vigentes están en [arquitectura](docs/03_ARCHITECTURE.md) y `Backend/prisma/schema.prisma`:

- `User`: UUID, `email` institucional, `password_hash`, `name`, `phone` e `is_moderator`. Una persona puede comprar y vender.
- `Publication`: `LIVE` o `STATIC`; pertenece a un vendedor, zona y categoría. `LIVE` añade horario, stock disponible y configuración de ganga. `ACTIVE` y `FINISHED` controlan su visibilidad; «Vendido» de una `STATIC` se guarda como `FINISHED`.
- `Reservation`: vincula comprador con publicación `LIVE` y pasa de `ACTIVE` a `COMPLETED`, `CANCELLED` o `EXPIRED`. Conserva `unit_price` y `idempotency_key`; las unidades reservadas se representan mediante reservas activas y stock disponible, sin columna `stock_reservado`.
- `Zone` y `Category`: catálogos de zonas y categorías separadas por tipo de publicación.
- `Report`: vincula denunciante y publicación para moderación SHOULD; antes de usarla se requiere unicidad por par de IDs.

---

## Requisitos No Funcionales

| Atributo | Descripción |
|---|---|
| Tiempo real | Actualizaciones de stock y temporizadores sin recargar pantalla (Socket.io) |
| Concurrencia | Bloqueo pesimista (`SELECT ... FOR UPDATE`) para evitar doble reserva de la misma pieza |
| Disponibilidad | Expiración de reservas mediante job programado (resistente a reinicios del servidor) |
| Seguridad | Acceso exclusivo con correo institucional; JWT; hash de contraseñas |
| Usabilidad | Flujos de publicar, reservar y confirmar en pocos pasos (contexto de uso entre clases) |
| Sin pagos digitales | Todas las transacciones monetarias son en físico; la app solo gestiona logística |

---

## Priorización del MVP

La prioridad vinculante está en `docs/02_REQUIREMENTS.md`, reconciliado con el plan integral el 2026-11-21. El núcleo MUST comprende autenticación UABC, publicaciones LIVE/STATIC editables, venta física, filtros de zona/categoría, reserva/expiración de 20 minutos, cancelación/entrega, cierre anticipado, bloqueo pesimista, oferta manual/programada privada, filtro RF-15, contacto WhatsApp previo y desde reserva y Socket.io. Los cierres 0037–0040 están planificados; esa lista no acredita implementación completa.

Moderación/reportes permanecen SHOULD en 0009. Reputación y notificaciones push requieren requisitos separados. El filtro RF-15 y los errores del formulario están implementados y verificados técnicamente en 0038/0034; edición propia de nombre/teléfono está incorporada en 0033. No se declara completo el MVP sin aceptación móvil y evidencia de entrega/UAT.

### Fuera de alcance
- Geolocalización real por GPS (el filtrado de zona es manual, por catálogo)
- Panel de moderación elaborado (historial, filtros por motivo/frecuencia)
- Pagos digitales (tarjetas, transferencias)

---

## Fases de Desarrollo

| Fase | Contenido |
|---|---|
| **Fase 1** — Diseño y Modelado | Wireframes de pantallas principales + Diagrama Entidad-Relación (DER) incluyendo estados de reserva |
| **Fase 2** — Backend | Configuración de NestJS, modelos en Prisma, conexión a PostgreSQL, endpoints de autenticación y CRUD de publicaciones |
| **Fase 3** — Frontend Móvil | Maquetado UI en React Native, navegación e integración de consumo de datos con la API REST |
| **Fase 4** — Concurrencia y Tiempo Real | Reservas con `SELECT ... FOR UPDATE`, job de expiración de 20 min (extiende también a activación programada de precio ganga), Socket.io |
| **Fase 5** — Pruebas y Cierre | Pruebas en dispositivos físicos, debugging y entrega final |

---

## Notas para la IA

- El proyecto es un **MVP**; priorizamos que lo esencial funcione bien sobre cubrir todos los casos borde.
- El **precio ganga es el elemento diferenciador/innovador** del proyecto; debe implementarse correctamente.
- **No hay geolocalización GPS.** El filtro de zona es siempre por selección de catálogo.
- **No hay pagos digitales.** La app es pura logística; el dinero cambia de mano en físico.
- El vendedor **confirma** la entrega; el comprador **no necesita hacer nada** en el intercambio físico.
- La expiración de reservas **debe sobrevivir reinicios del servidor** (job externo, no setTimeout en memoria).
- El campo `phone` del usuario es obligatorio porque alimenta directamente los botones de WhatsApp.
- Las categorías de ventas en vivo y ventas estáticas son conjuntos **separados e independientes**.
- El rol de moderador es un **campo booleano simple** en la entidad Usuario, sin sistema de roles complejo.

---

## Proceso de desarrollo

El trabajo nuevo sigue la [constitución](.specify/memory/constitution.md) y el [proceso de desarrollo](docs/08_DEVELOPMENT_WORKFLOW.md): especificar, planificar, desglosar tareas, implementar, verificar y converger. El [registro de funcionalidades](specs/README.md) contiene plantillas, ocho expedientes que cubren documentalmente los requisitos MUST y uno opcional para reportes. La [auditoría](docs/09_PROJECT_AUDIT.md) registra las decisiones resueltas y brechas técnicas; la [matriz de trazabilidad](docs/10_TRACEABILITY.md) muestra qué requisitos carecen de evidencia ejecutada. `node scripts/check-sdd.mjs` comprueba estructura y referencias básicas; cada feature requiere además pruebas reales y revisión de sus criterios de aceptación.
