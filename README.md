# TapCampus

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
| Categoría | Comida · Snacks · Bebidas · Postres · Otros |
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
| Categoría | Libros · Electrónica · Uniformes/Batas · Material escolar · Otros |
| Precio | Precio de referencia visible en el catálogo |

---

## Funcionalidades Clave

### Sistema de Reservas (solo para ventas en vivo)
- El comprador aparta su porción con un **margen de tolerancia de 20 minutos**.
- Si no se concreta la entrega, el producto se libera automáticamente y vuelve al feed.
- **Confirmación:** el vendedor confirma la entrega con un toque; el stock pasa a "vendido definitivo".
- **Cancelación por el comprador:** libera el stock de inmediato, sin esperar los 20 minutos.
- **Contacto bidireccional por WhatsApp:**  
  - El comprador puede contactar al vendedor desde la publicación en cualquier momento.  
  - En cuanto existe una reserva, el vendedor puede contactar a ese comprador específico. Antes de la reserva, no se expone ningún número.

### Mecanismo Técnico de Concurrencia
La reserva de la última pieza está protegida con una **transacción de base de datos con bloqueo pesimista** (`SELECT ... FOR UPDATE`) sobre la fila del producto. Esto evita condiciones de carrera cuando varios compradores intentan apartar el mismo producto simultáneamente.

La expiración de reservas **no depende de temporizadores en memoria**; se maneja con un **job programado** (BullMQ + Redis, o cron) que revisa reservas vencidas de forma confiable aunque el servidor se reinicie. Este mismo job verifica también las activaciones programadas de precio ganga.

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
| Correo institucional | Solo se permite registro con dominio institucional (p. ej. `@universidad.edu.mx`); validación en el formulario, sin verificación por email adicional |
| Hash de contraseñas | Buenas prácticas de NestJS (bcrypt o similar) |
| JWT con expiración | Tokens de sesión con tiempo de vida limitado |
| Filtro de palabras clave | Se ejecuta al crear una publicación; bloquea términos prohibidos sin perder el contenido; el vendedor debe corregirlos para continuar |
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
| Jobs programados | BullMQ + Redis (o cron) | Expiración de reservas y activación de precio ganga |

---

## Modelo de Datos (Entidades Principales)

### `Usuario`
- `correo` — solo dominio institucional (p. ej. `@universidad.edu.mx`)
- `contraseña` — hasheada
- `nombre`
- `telefono` — habilita los botones de WhatsApp
- `esModerador` — booleano (campo simple, sin rol complejo)
- Puede actuar como **vendedor** y como **comprador** indistintamente.

### `Publicacion` (entidad base)
Dos subtipos: **en vivo** y **estática**.

Campos exclusivos de la publicación en vivo:
- `estado`: `activa` | `finalizada_manualmente` | `expirada`
- `horaInicio`, `horaFin`, `stockInicial`, `stockDisponible`
- `stockReservado`
- `precioGangaHabilitada`, `modoActivacion`, `minutosAnticipacion`, `precioGangaActivada`, `precioMinimo`

### `Reserva`
- Vincula `Usuario` (comprador) con `PublicacionEnVivo`
- `estado`: `reservada` | `vendida` | `cancelada_por_comprador` | `expirada`
- `creadaEn` — timestamp para calcular expiración de 20 min
- `confirmadaPorVendedor` — booleano

### `Zona`
Catálogo predefinido de facultades, edificios y áreas del campus. Referenciado por publicaciones y filtros de búsqueda.

### `Categoria`
Dos conjuntos independientes:
- Ventas en vivo: Comida, Snacks, Bebidas, Postres, Otros
- Ventas estáticas: Libros, Electrónica, Uniformes/Batas, Material escolar, Otros

### `Reporte`
- Vincula `Usuario` (denunciante) con `Publicacion`
- Varias denuncias acumuladas disparan ocultamiento automático

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

### Núcleo indispensable (entregar sí o sí)
- Autenticación con correo institucional
- CRUD de publicaciones editable (vivas y estáticas)
- Sistema de reservas con expiración de 20 min (transacción + bloqueo pesimista)
- Cancelación de reserva por el comprador
- Confirmación de entrega por el vendedor
- Botón de finalizar publicación en vivo manualmente
- Filtro de palabras clave al crear publicación
- **Precio ganga manual o programado** (elemento de innovación)
- Socket.io para inventario en tiempo real
- Filtro por zonas del campus (selección manual)

### Deseable si hay tiempo
- Filtro por categoría en ambos catálogos
- Reportes de la comunidad con ocultamiento automático y rol de moderador
- Perfil y reputación de usuario (historial de cumplimiento, calificación)
- Notificaciones push (recordatorio al vendedor antes de que expire la reserva, stock liberado, reserva por expirar para el comprador)

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
- El campo `telefono` del usuario es obligatorio porque alimenta directamente los botones de WhatsApp.
- Las categorías de ventas en vivo y ventas estáticas son conjuntos **separados e independientes**.
- El rol de moderador es un **campo booleano simple** en la entidad Usuario, sin sistema de roles complejo.