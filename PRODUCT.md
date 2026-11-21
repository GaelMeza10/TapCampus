# TapCampus

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Estudiantes de la UABC que compran y venden dentro del campus. Comprador y vendedor tienen igual prioridad, confirmado por el usuario durante init. Usan el teléfono para encontrar una publicación, coordinar la recogida y gestionar inventario y entregas.

## Product Purpose

Centralizar la compraventa informal del campus para reducir información dispersa y productos anunciados sin disponibilidad. Permitir encontrar productos, conocer precio y lugar, apartar cuando corresponda y contactar al vendedor.

## Positioning

Ventas con horario y stock, apartados independientes de 20 minutos y precio fijado por reserva. Precio ganga manual/programado para nuevas reservas. Catálogo de artículos sin temporizador ni reserva.

## Operating Context

App React Native/Expo para iOS y Android, con controles de fecha y comportamiento de teclado según plataforma. Entrega física y coordinación por WhatsApp. La API NestJS/PostgreSQL/Redis es la autoridad de stock, precios y plazos. Web es superficie auxiliar de revisión; sus capturas no acreditan comportamiento nativo.

## Capabilities and Constraints

- Mi cuenta permite editar nombre completo y teléfono mexicano propios (0033); correo institucional de solo lectura. El contacto actualizado se usa en siguientes lecturas autorizadas de publicaciones/reservas existentes.

- Registro con nombre, correo institucional @uabc.edu.mx, teléfono mexicano y contraseña. Sesión persistente y rutas protegidas.
- Explorar disponibles ahora y catálogo; búsqueda por título/descripción combinada con filtros de tipo, zona y categoría (0025). Sin GPS ni pagos digitales.
- Contacto 0039 implementado técnicamente: detalle visible LIVE/STATIC permite consulta previa; reserva confirmada conserva contacto aunque desaparezca el detalle. Feed/mine/eventos sin teléfonos y comprador protegido. Varias reservas por comprador, cada una con precio/plazo propio e idempotencia en reintentos. Apertura/retorno en dispositivo pendientes de aceptación.
- Vendedor: crear/editar, descontar venta física, configurar/activar ganga, finalizar y confirmar entregas. Finalizar no elimina apartados vigentes.
- Creación/edición LIVE/STATIC aplica filtro de contenido v1 del servidor (0038); errores visibles por campo y reintentos conservan borrador y foto (0034). Verificado técnicamente, aceptación nativa pendiente.
- Moderación opcional conserva decisiones abiertas en su expediente; no ampliarla como parte de un refinamiento visual.
- Español de México, importes en pesos y etiquetas comprensibles sin identificadores técnicos.

## Brand Commitments

Conservar TapCampus, verde UABC e Inter local. El usuario autoriza en 0031 adaptar el estilo de su referencia Oakory: fondo casi blanco, tarjetas fotográficas, buscador/filtros redondeados y navegación sencilla. Sustituye fondo beige y filas horizontales de 0020; conserva encabezados compactos y componentes compartidos. Sin carrito, favoritos ni calificaciones. La autoridad visual vigente está en docs/04_UI_UX_GUIDELINES.md, DESIGN.md y specs/0031-estilo-marketplace; los prototipos anteriores son evidencia histórica de flujos.

## Evidence on Hand

Documentación de producto docs/01..10; TASKS.md y expedientes specs/0001..0020. Figma XvTMHHlXw8yfnd6x0v7Ulh, página revisada 78:292. 0020 registra 43 pruebas, bundles Android/iOS y capturas web a tres anchos. Los recorridos físicos pendientes están separados de esa evidencia. Fotografías de productos proceden de API; no fijar ilustraciones del prototipo ni inventar testimonios o afirmaciones comerciales.

## Product Principles

1. Dar igual importancia a encontrar/comprar y publicar/entregar.
2. Mostrar disponibilidad, precio y plazo con procedencia real.
3. Facilitar recuperación y reintentos sin perder datos ni duplicar apartados.
4. Mantener interfaz familiar, breve y consistente con controles accesibles.
5. Conservar alcance y documentar límites de verificación.

## Accessibility & Inclusion

Etiquetas persistentes, errores accionables y estado seleccionado accesible. Texto escalable, safe areas y áreas táctiles adecuadas a cada plataforma. Verificar lectores de pantalla y tipografía ampliada en dispositivo; no declararlos comprobados mediante el navegador.
