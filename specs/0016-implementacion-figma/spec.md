# 0016 — Implementación móvil del prototipo Figma

Estado: **Verificado** (implementación y comprobaciones técnicas) | Fecha: 2026-11-04

## Objetivo y alcance

Implementar el prototipo aprobado en 0015 en Expo Go SDK 58, con prioridad iPhone, reutilizando servicios REST/Socket.io y protecciones existentes. Fuente: Figma XvTMHHlXw8yfnd6x0v7Ulh, página 3:2. Referencias RF-01, RF-02, RF-03, RF-04, RF-05, RF-05b, RF-05c, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-12, RF-13, RNF-01, RNF-02, RNF-03; US-01, US-02, US-03, US-04, US-05, US-05b, US-05c, US-06, US-07, US-08, US-09, US-11; TASKS 5.8.

### AC-01 — Sistema visual
Paleta aprobada, Inter local (regular/medium/semibold/bold), fondo cálido, tarjetas blancas, CTA oscuro, radios, espaciado y texto compartidos. Layout adaptable con safe areas, teclado y controles accesibles de 44 puntos como mínimo; sin imágenes de pantallas aplanadas.

### AC-02 — Acceso y navegación
Login/registro conservan validaciones, carga, errores y JWT. Explorar/Reservas/Mis ventas tienen navegación inferior persistente con estado activo y rutas protegidas. El + de 56 puntos abre el formulario del tipo visible, arriba de la barra inferior.

### AC-03 — Feed y filtros
Disponibles ahora/Catálogo sobre Filtros. Hoja con zonas/categorías obtenidas de API, selección provisional, aplicar/restablecer/cerrar y combinación AND. Cambiar tipo reinicia categoría y conserva zona. Una respuesta antigua no sustituye resultados del filtro actual. Carga/error/vacío mantienen navegación y recuperación; actualización fallida conserva datos del mismo filtro.

### AC-04 — Detalle y reserva
Imagen dinámica, ubicación real, descripción, precio/stock/reloj; STATIC contacto directo sin reservas. LIVE fija precio/20 minutos por unidad, conserva clave en reintento y genera otra al apartar otra unidad. Éxito muestra precio/plazo/WhatsApp de la reserva confirmada; nunca contacto LIVE público. Agotada/finalizada/error presentan recuperación y acceso a reservas.

### AC-05 — Mis reservas
Tarjetas separadas con estados españoles, precio fijado, reloj por unidad y acciones accesibles, sin UUID visible. Cancelación exige confirmación. Vencimiento retira acciones y reconsulta servidor. Historial permanece legible.

### AC-06 — Publicación y ganga
Formulario desplazable con descripción, imagen/cámara/galería, campos rotulados y precio/stock; tipo STATIC omite campos LIVE. Zona/categoría seleccionables; horario mediante controles nativos legibles. Configuración sin ganga/manual/programada muestra precio mínimo y minutos antes del fin con vista previa. Guardar valida y conserva borrador ante fallos; edición respeta restricciones de ganga activa/programada del backend.

### AC-07 — Ventas
Tipos con gestión propia; LIVE muestra disponibilidad/estado y lista completa de reservas ordenada por vencimiento con confirmaciones separadas, incluso después del cierre de venta. Acciones inválidas ocultas/deshabilitadas. STATIC ofrece editar/marcar vendido con confirmación y estado terminal sin controles LIVE. Sesión puede cerrarse.

### AC-08 — Tiempo real y consistencia
Eventos y regreso a primer plano resincronizan las pantallas relevantes; relojes solo representan plazos del servidor. Operaciones pendientes bloquean duplicación; errores no anuncian éxito. Reservas históricas no cambian de precio.

### AC-09 — Precio previo verificable
Persistir price_before_ganga nullable en la misma transacción de activación antes de reemplazar price; exponer decimal en lecturas sin aceptar edición del campo. UI tacha solo el dato conocido cuando es mayor al vigente. Filas históricas sin evidencia conservan NULL; nunca inferir un precio. Migración aditiva, inventario y respaldo antes de aplicarla.

### AC-10 — Verificación y entrega
Tipos, pruebas funcionales dirigidas a filtros/errores/reservas/ventas/formularios y bundles móviles. Revisión visual renderizada a dimensiones de móvil contra Figma y check-sdd. Registrar por separado comprobaciones automatizadas y las comprobaciones físicas de iPhone que requieren acceso al dispositivo; no cerrar aceptación global con simulaciones.

Fuera de alcance: pagos/GPS, moderación, cambios de plazos o reservas, despliegue y nuevas categorías. Imágenes de productos provienen de API; los dibujos de productos del prototipo son muestras de contenido.
