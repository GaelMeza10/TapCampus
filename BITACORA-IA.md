# Bitácora de uso de IA — TapCampus

**Materia:** Aplicaciones Móviles

**Periodo registrado:** 1 de octubre al 22 de noviembre de 2026

Durante el desarrollo utilicé IA para planificar, implementar funcionalidades, revisar interfaces y preparar pruebas. Mi participación consistió en definir las reglas, evaluar propuestas, autorizar cambios y reportar problemas al utilizar la aplicación.

También utilicé mi dispositivo móvil para probar cada funcionalidad de la aplicación y buscar bugs, errores de interfaz o comportamientos que no funcionaran como esperaba. Reporté los problemas encontrados a la IA para orientar las correcciones. Estas pruebas manuales en el teléfono complementaron las pruebas automatizadas y la revisión del diseño.

Los pendientes mencionados en las entradas cronológicas describen el estado de aquella etapa. Las comprobaciones realizadas posteriormente se registran al final de esta bitácora.

## 1 de octubre — Planificación y reglas del proyecto

Pedí completar la documentación antes de programar. La IA organizó especificaciones, planes y tareas, y planteó las reglas que necesitaban aclaración.

Decidí fijar el precio al reservar, permitir varios apartados del mismo comprador, devolver la reserva existente al reintentar y aceptar teléfonos mexicanos con o sin `+52`. También aclaré que documentación completa no significaba aplicación terminada.

**Resultado:** quedó definido el orden de implementación; las pruebas funcionales seguían pendientes.

## 4 de octubre — Infraestructura y base de datos

Pedí implementar la infraestructura conservando los datos y comprobar respaldos antes de migrar. La IA corrigió la compilación, el manejo de errores y las restricciones de stock, precio e idempotencia.

Exigí no deducir precios históricos del precio actual.

**Resultado:** se verificaron respaldo, restauración, migración y repetición del seed con PostgreSQL real. La integración móvil aún faltaba.

## 5 de octubre — Autenticación y publicaciones

Pedí implementar registro UABC, login, rutas protegidas, imágenes, publicaciones LIVE/STATIC y filtros. La IA desarrolló endpoints, permisos, validaciones y operaciones de venta física y vendido.

Mantuve el alcance definido, sin agregar funciones ajenas a la solicitud.

**Resultado:** las pruebas HTTP y de base de datos comprobaron validaciones, filtros y protección del inventario. Se verificó el backend, sin cerrar los recorridos móviles.

## 5 de octubre — Reservas y tiempo real

Pedí reservas de 20 minutos, reintentos seguros, expiración automática, Socket.io y ganga manual/programada. La IA implementó transacciones con bloqueo de fila, trabajos BullMQ/Redis y eventos posteriores a la confirmación de los cambios.

Pedí explorar IDs numéricos, pero después cancelé esa propuesta; se conservaron UUID.

**Resultado:** 50 solicitudes por una última pieza crearon una sola reserva; repetir una misma clave devolvió la misma reserva sin otro descuento. Se probaron reinicio del worker y dos clientes Socket.io. La expiración utilizó tiempos de prueba acelerados; la espera real de 20 minutos quedó pendiente.

## 8–13 de octubre — Navegación y sesión

Pedí navegación, componentes compartidos e interceptor HTTP, sin iniciar servicios porque estaba trabajando con otro proyecto. Pausé el trabajo y lo retomé el 13 de octubre.

La IA corrigió redirecciones y organizó el tema visual, los componentes y el tratamiento de sesiones inválidas.

**Resultado:** aprobaron pruebas en memoria, tipos y exportación. El almacenamiento y algunos servicios estaban simulados; no fue una prueba en teléfono.

## 13 de octubre — Pantallas de comprador y vendedor

Pedí construir acceso, feed, filtros, reservas, formulario con imágenes, Mis ventas y contacto. La IA conectó pantallas con servicios y agregó consultas necesarias para publicaciones propias y reservas.

Reporté que no aparecían productos en un teléfono físico.

**Resultado:** aprobaron pruebas automatizadas con respuestas y permisos simulados. El reporte abrió una revisión de conectividad; los recorridos completos siguieron pendientes.

## 19 de octubre — Datos de ejemplo y reservas legibles

Pedí agregar publicaciones al seed y corregir reservas que mostraban UUID y estados como `ACTIVE`. La IA preparó ocho publicaciones de ejemplo y mostró producto, fecha, precio y referencia por unidad.

Decidí mantener los identificadores internamente, sin mostrarlos al usuario.

**Resultado:** se comprobaron los datos y las acciones sobre la reserva correcta mediante pruebas automatizadas. La presentación completa en dispositivo quedó pendiente.

## 19 de octubre — Revisión del prototipo Figma

Pedí revisar navegación, jerarquía, accesibilidad y estados del prototipo. Propuse reunir los filtros en un botón porque ocupaban demasiado espacio.

La IA planteó una organización más simple y componentes consistentes, conservando las funciones de ambos tipos de publicación.

**Resultado:** se estableció una dirección de mejora. Las revisiones posteriores del prototipo y su implementación en Expo se realizaron por separado.

## 3 de noviembre — SDK 58 y conexión desde iPhone

Pedí ampliar la demo, actualizar Expo SDK 57 a 58 y resolver la carga que no terminaba en mi iPhone. La IA amplió el seed a 24 publicaciones, actualizó dependencias y distinguió la conexión de Expo de la conexión a la API.

Insistí en probar con Expo Go en móvil y confirmé después: «ya funciona, ya se ven los productos».

**Resultado:** se verificó la compatibilidad técnica y confirmé la visualización del feed. La conexión temporal utilizada no era un despliegue final.

## 3–5 de noviembre — Aplicación del diseño de Figma

Pedí mejorar el prototipo y aplicarlo al proyecto, con publicación mediante un botón inferior y cambio de tipo separado de los demás filtros.

La IA revisó formularios, reservas y estados; implementó el diseño en Expo y agregó el precio anterior de la ganga sin inventarlo para registros históricos. Después pedí volver a utilizar la red local.

**Resultado:** aprobaron pruebas, integración de backend y capturas auxiliares. Tras reportar un fallo de registro, reintenté en iPhone y confirmé que pude crear la cuenta con API y base de datos reales. Eso no cerró todas las pruebas de sesión.

## 5–6 de noviembre — Pulido y confirmación antes de apartar

Pedí mejorar iconos, selectores y encabezados, quitar subtítulos innecesarios y aplicar el pulido directamente al código. La IA revisó el prototipo y ajustó componentes.

Solicité un modal antes de apartar y confirmé en iPhone que aparecía y que «Volver» cerraba sin reservar. También señalé que faltaba la foto en Mis reservas.

**Resultado:** se agregó la imagen y aprobaron pruebas automatizadas. Mi confirmación cubrió el comportamiento básico del modal; accesibilidad y otros detalles nativos quedaron pendientes.

## 6–9 de noviembre — Búsqueda, cuenta y pestañas

Pedí agregar búsqueda, retirar el logout de Ventas y mejorar la identificación de la pestaña activa. Elegí un módulo Mi cuenta con datos y salida.

La IA incorporó búsqueda combinada con filtros, perfil propio y mensajes recuperables. Reporté un error técnico visible y advertí que las pestañas se comportaban como una pila; se corrigió la estructura del navegador.

**Resultado:** se verificaron consultas reales y navegación automatizada. La interacción física completa quedó separada de esas pruebas.

## 9–10 de noviembre — Ofertas y estilo fotográfico

Pedí distinguir las gangas con precio anterior tachado, agregar ejemplos y utilizar «Oferta» en el lenguaje visible. Después autoricé adaptar un estilo fotográfico sin carrito.

La IA ajustó tarjetas, precios y vocabulario. Pedí blanco para productos sin oferta y retirar etiquetas repetidas.

**Resultado:** aprobaron pruebas y revisión visual auxiliar. La dirección visual posterior recuperó «GANGA» como insignia, conservando esta decisión inicial como parte de la evolución del diseño.

## 10 de noviembre — Reservas, cuenta y formulario

Pedí mejorar pantallas que se percibían genéricas, permitir editar nombre y teléfono y hacer visibles los errores del formulario.

La IA reorganizó Mis reservas, Mi cuenta y Nueva publicación. Decidí dejar el correo fijo y dar protagonismo a la foto; primero pedí revisar el plan y después autoricé aplicarlo.

**Resultado:** se comprobaron edición y presentación mediante pruebas y capturas auxiliares. La corrección completa de errores persistentes se implementó el 21 de noviembre.

## 16 y 21 de noviembre — Revisión del MVP

Pedí contrastar el proyecto con el plan de la materia y corregir faltantes comenzando por planes. La IA identificó diferencias en privacidad y configuración de ofertas, además de un fallo de tipado.

Autoricé comenzar por el control de ofertas y delegué el análisis inicial de palabras inapropiadas.

**Resultado:** se corrigió el tipado y se protegieron mínimo, modo y programación futuros. Se verificaron cambios de modo, retirada, carreras y reinicio con servicios reales. La aceptación nativa siguió pendiente.

## 21 de noviembre — Errores, contenido y WhatsApp

Pedí continuar con las correcciones del MVP y resolver los errores que no se veían en el formulario. La IA agregó avisos persistentes, errores por campo, conservación del borrador y un filtro local de contenido en creación y edición.

El contacto LIVE, inicialmente disponible después de reservar, se amplió al detalle visible para permitir consultas previas. Contactar no crea una reserva ni expone los datos del comprador.

**Resultado:** aprobaron pruebas técnicas de validación, privacidad y recuperación. La apertura y regreso de WhatsApp en teléfono quedaron pendientes.

## 21 de noviembre — Casos límite del profesor

Pedí preparar y ejecutar pruebas de modo avión, campos vacíos, números inválidos, texto largo, doble toque, permisos y otros usos fuera del camino habitual.

La IA preparó 43 casos y ejecutó una parte con automatización, HTTP y variantes Android. Detectó que el registro aceptaba un nombre compuesto solo por espacios. Reporté problemas de conexión en iPhone y un selector de hora gris que se mostraba incorrectamente.

**Resultado:** quedó una ejecución parcial con el fallo documentado. El nombre vacío se corrigió al día siguiente; el selector recibió un ajuste técnico cuya aceptación visual en iPhone siguió pendiente.

## 21–22 de noviembre — Consistencia de la aplicación

Pedí aplicar DESIGN.md, agregar condición Nuevo/Usado y unificar Explorar, filtros, detalles, cuenta, ventas y reservas. La IA actualizó componentes e incorporó condición explícita.

Reporté nombres desactualizados, selección de tipo duplicada y contenido que bajaba al cambiar de pestaña, incluso después de correcciones anteriores. Pedí liquid glass únicamente en las tabs.

**Resultado:** se corrigieron flujos y se agregaron comprobaciones de consistencia. Aprobaron pruebas y capturas auxiliares, pero el desplazamiento tuvo que reabrirse porque seguía reportándolo en dispositivo.

## 22 de noviembre — Datos adversos y preparación de entrega

Pedí probar datos inválidos en toda la app, mostrar errores claros de conexión, completar el seed y limpiar residuos.

La IA corrigió nombres vacíos, mensajes técnicos, errores ocultos y listas vacías falsas. Preparó cuentas y publicaciones ficticias, comprobando repetición del seed y conservación de datos anteriores.

**Resultado:** aprobaron pruebas automatizadas, integración de backend y revisión visual auxiliar. La aceptación móvil integrada, distribución y pruebas formales con usuarios siguieron pendientes.

## 22 de noviembre — Recogida y actualización del feed

Reporté que otras personas confundían «Anuncios» con publicidad. Pedí mostrar dónde recoger las reservas, actualizar el feed al crearse publicaciones, ampliar categorías y mejorar duración y cierre de sesión.

Aprobé «Productos», entrega por acordar dentro del campus para STATIC y conservación del punto de recogida de cada reserva nueva. La IA implementó estos cambios y amplió la demo a 26 categorías, 107 publicaciones y 24 reservas.

**Resultado:** se comprobaron contratos, migración, seed y eventos con servicios reales. Confirmé que el desplazamiento ya estaba solucionado, sin mediciones separadas por modelo. La evaluación formal de comprensión y los recorridos integrados siguieron pendientes.

## 22 de noviembre — Arranque manual y APK

Pedí ejecutar personalmente Expo y la API, y preparar el APK solicitado por el profesor para utilizarlo desde cualquier lugar.

La IA registró la preferencia de arranque manual y distinguió el instalador de la disponibilidad del backend fuera de la red local.

**Resultado al corte:** no había un APK instalado y aceptado ni un despliegue final acreditado. Las exportaciones anteriores no se registraron como entrega del APK.

## Validación manual confirmada

Posteriormente confirmé que realicé las siguientes pruebas y que los resultados fueron satisfactorios:

- Probé los recorridos de comprador y vendedor en la versión final, incluyendo cámara, permisos, teclado, accesibilidad y WhatsApp.
- Comprobé la expiración de reservas esperando los 20 minutos reales.
- Evalué la comprensión y el uso de la aplicación con participantes registrados.

Estas comprobaciones dejan de estar pendientes en esta bitácora. Corresponden a pruebas manuales realizadas por mí y comunicadas a la IA.

## Pendiente de entrega

- Acreditar el APK instalado y el entorno de entrega accesible fuera de la red local.

Las decisiones principales se reúnen en el [diario de decisiones](DIARIO-DECISIONES.md).
