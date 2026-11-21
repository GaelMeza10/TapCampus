# 0031 — Estilo de marketplace fotográfico

Estado: Verificado (técnico y composición web auxiliar; revisión nativa pendiente) | Fecha: 2026-11-09

RF-05c/06/07/11/12; RNF-03; US-04/05/05c/06; TASKS 5.23.
Fuentes: docs/01/04/05/08/09/10, constitución y referencia visual suministrada por el usuario (Oakory, https://i.pinimg.com/1200x/20/e0/5e/20e05e0ab88c5630e33a099631b74797.jpg).

El usuario solicita aplicar el estilo a la aplicación usando skills de diseño, excluyendo el carrito. Conservar identidad UABC, información real y flujos actuales. Sustituir la composición de filas de 0020 por tarjetas fotográficas; actualizar la autoridad visual de docs04 y PRODUCT.md.

### AC-01 — Sistema visual coherente

Fondo casi blanco, superficies blancas, separaciones sutiles, Inter local y verde UABC. Entradas y selectores redondeados, navegación de cuatro destinos y estados seleccionados legibles. Extender el sistema compartido a autenticación, detalle, formularios, reservas, ventas y cuenta, sin cambiar sus acciones.

### AC-02 — Explorar fotográfico y adaptable

Tarjetas con foto superior, título, precio, zona y disponibilidad/plazo. Dos columnas en teléfonos con ancho suficiente y texto normal; una con texto ampliado o ancho reducido. Mantener FlatList, foto alternativa, ofertas con comparación/ahorro y datos de API. Destacar una publicación real con fotografía, solo en exploración sin búsqueda/filtros; no inventar productos, reseñas ni promociones. El encabezado y controles se desplazan con la lista para liberar espacio en horizontal.

### AC-03 — Compatibilidad y evidencia

Conservar búsqueda/debounce, filtros provisionales, cambio de tipo, navegación protegida, precios fijados y confirmaciones de apartados. Sin carrito, favoritos, pagos ni nuevos contratos. Ejecutar tipos, pruebas existentes, revisión visual auxiliar a varios anchos, bundles móviles y check-sdd. Documentar por separado limitaciones de hardware.

### AC-04 — Catálogo sin etiqueta repetida (2026-11-10)

En Explorar, las tarjetas STATIC omiten la etiqueta «Catálogo» y su espacio; el nombre del producto inicia el contenido debajo de la foto. Conservar el título y selector del catálogo, precio, zona, contacto directo y estados LIVE/Oferta. Petición explícita del usuario; sin decisiones pendientes.

### AC-05 — Tarjetas sin leyenda de contacto (2026-11-10)

Por petición adicional del usuario, retirar también «Contacto directo» de las tarjetas STATIC, sin reservar una fila vacía. Conservar precio, zona, apertura del detalle y disponibilidad de LIVE. Sustituye únicamente la conservación de esa leyenda indicada en AC-04; el contacto desde detalle sigue vigente.

### AC-06 — Productos normales sobre blanco (2026-11-10)

En Explorar, todas las publicaciones sin oferta, incluido el destacado, usan fondo blanco como las tarjetas de Catálogo. Reservar gangaSoft para publicaciones con is_ganga_active, también en el destacado. Conservar fotografía, precio, navegación y colores de los controles. Petición explícita del usuario; sin decisiones pendientes.
