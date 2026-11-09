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

- Registro con nombre, correo institucional @uabc.edu.mx, teléfono mexicano y contraseña. Sesión persistente y rutas protegidas.
- Explorar disponibles ahora y catálogo; búsqueda por título/descripción combinada con filtros de tipo, zona y categoría (0025). Sin GPS ni pagos digitales.
- LIVE: contacto después de reserva confirmada; STATIC: contacto directo. Varias reservas por comprador permitidas, cada una con precio/plazo propio e idempotencia en reintentos.
- Vendedor: crear/editar, descontar venta física, configurar/activar ganga, finalizar y confirmar entregas. Finalizar no elimina apartados vigentes.
- Moderación opcional conserva decisiones abiertas en su expediente; no ampliarla como parte de un refinamiento visual.
- Español de México, importes en pesos y etiquetas comprensibles sin identificadores técnicos.

## Brand Commitments

Conservar TapCampus y la identidad aprobada en las copias Figma revisadas. Respetar colores y tipografía existentes, encabezados compactos y componentes compartidos. eBay y Facebook Marketplace son referencias de organización, sin ampliar funciones. La autoridad visual está en docs/04_UI_UX_GUIDELINES.md y specs/0019/0020, no en una estética nueva propuesta por una herramienta.

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
