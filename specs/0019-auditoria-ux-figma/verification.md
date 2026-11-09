# 0019 — Verificación

Estado: Verificado (diseño y estructura del prototipo) | Fecha: 2026-11-05

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 | EV-01 | PASS |
| AC-02 | T-02 | EV-02/04 | PASS |
| AC-03 | T-03 | EV-03 | PASS (simulación de estados) |
| AC-04 | T-04 | EV-04/05 | PASS (estructura y revisión visual) |
| AC-05 | T-05 | EV-06 | PASS |

## EV-01 — Inventario y copias

Sesión Figma 5e8de999-0913-43b5-a3e9-e3d579bc44a7, archivo XvTMHHlXw8yfnd6x0v7Ulh. Originales 0:1, 3:2 (47 pantallas), 5:128 conservados. Copias 78:2 fundamentos, 78:43 confirmaciones, 78:292 flujos (55 pantallas: 47 revisadas + ocho estados). Las copias se identifican con «Revisión UX 05 nov». Se remapearon reacciones, incluidos destinos condicionales y puntos iniciales, y componentes a las copias. Auditoría final sin dependencias de componentes originales.

## EV-02 — Hallazgos y correcciones

Prioridad alta: encabezados/listado con posiciones rígidas y jerarquía inconsistente (3:42/3:87), tarjetas con precio mezclado con disponibilidad y ubicación, acciones de 24 puntos y estados S4/S5/S6 sin salida. Se aplicaron encabezados Auto Layout, seis instancias de Tarjeta / Publicación con precio/ubicación/contexto separados, botones compartidos, regreso de 44 puntos y recuperación en estados terminales. El listado conserva desplazamiento y espacio inferior para acceder al último producto.

Prioridad media: formularios con campos de 44/48 puntos y estructura desigual; detalles con texto en cajas fijas; modales con acciones manuales. Se reemplazaron campos por componentes de 52 puntos con etiquetas persistentes, descripción multilínea aislada, detalles y reservas desplazables, confirmaciones con Auto Layout y hotspots realineados. Se corrigió el crecimiento de texto tras comprobar que resize restablecía textAutoResize a NONE. Navegación inferior compartida en 17 pantallas; se conservan iconos, colores y tres destinos. Biblioteca copiada ordenada, variantes separadas y badges con altura de 32 puntos.

Activos: tarjeta 79:16; campos 81:108; navegación 83:437; descripción 83:2224; botones 78:3. Se reutilizaron variables locales de color/espaciado/radio y componentes existentes. No se importaron kits externos. Las ilustraciones existentes se conservan; cuatro ejemplos sin fotografía usan «Sin foto» y no una imagen inventada.

## EV-03 — Estados

Ocho pantallas adicionales: errores 83:1606/1666/1754/1898 y envío 83:1633/1703/1815/1948. Error junto al campo con instrucción de corrección; envío con CTA y campos deshabilitados. Botones base → envío → destino confirmado tras 1,2 s, como simulación del prototipo. Los estados de validación tienen puntos iniciales propios y permiten regresar al formulario. Se conservaron estados existentes de carga, vacío, error, agotado, finalizado y vencido. El envío temporizado no prueba una solicitud real.

## EV-04 — Revisión visual y estructura

Captura global de las 47 pantallas originales y de las 55 revisadas; capturas detalladas de listados, detalle, formularios, registro con error, gestión y confirmación. Capturas de ambas páginas de componentes copiadas. Muestras temporales a 320 puntos (listado y detalle con título largo) y 430 (registro con error), eliminadas después. Se detectó y corrigió el recorte del selector a 320; la captura posterior muestra ambas pestañas completas. El detalle largo mantiene desplazamiento y CTA accesible. No se ejecutó Dynamic Type, orientación horizontal ni lector de pantalla nativo.

[Auditoría estructural](evidence/figma-audit.json): 55 pantallas, 416 destinos internos, cero destinos ausentes/fuera de página, cero controles conectados menores de 44×44, cero componentes dependientes de originales, solo Inter. Capas principales: 548 FRAME, 849 TEXT, 197 INSTANCE, 159 VECTOR; sin captura aplanada de interfaz como entregable.

Reproducción: use_figma sobre 78:292; recorrer findAll, comparar cada destinationId recursivo con IDs de página, medir nodos con reactions, resolver getMainComponentAsync y su página, inventariar fontName.family. Estos son enlaces inspeccionados; no un recorrido manual completo en el reproductor.

## EV-05 — Convergencia documental

`node scripts/check-sdd.mjs`: PASS (salida 0). `git diff --check`: PASS (salida 0; avisos LF→CRLF sin errores de espacios).

## EV-06 — Encabezados compactos, revisión del usuario

Retirados 25 textos de apoyo en 20 pantallas/variantes de la copia 78:292: frases debajo de TapCampus, subtítulos de listados, reservas, ventas y autenticación. Se mantienen mensajes funcionales de resultado, errores, condiciones de ganga y datos del producto. [IDs y resultado](evidence/subtitulos.json).

Encabezados Explorar/Catálogo reducidos: viewport de productos y=281, h=487; Mis reservas y=104, h=648; ventas sin subtítulo y=140, h=612; registro y=156, h=664. Se ajustaron también las variantes de carga, vacío, error y envío. No se modificaron las páginas originales, los componentes, colores ni tipografías.

Capturas revisadas de Explorar, Mis ventas, Mis reservas, Registro y Sin resultados. Auditoría posterior: 55 pantallas, 416 destinos válidos, cero destinos ausentes, cero controles conectados menores de 44 puntos y ninguna de las frases redundantes buscadas. `node scripts/check-sdd.mjs` y `git diff --check`: PASS, salida 0.

## Límites vigentes

No se comprobó apertura de WhatsApp, cámara/galería, entrada de texto real, selección nativa de zona/categoría/horario, respuesta de API, Socket.io ni reloj real. Esas interacciones no se acreditan mediante inspección de conexiones. Solo los dos ejemplos con detalle existente conservan acceso a ese detalle; no se inventaron destinos para los otros cuatro productos ilustrativos. No se añadió buscador textual por GAP-11. La aceptación de flujos en dispositivo y el recorrido manual completo del reproductor continúan por realizar. No hay cambios en Expo ni se cierran TASKS 5.1–5.6.
