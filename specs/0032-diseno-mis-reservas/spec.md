# 0032 — Mis reservas con jerarquía de recogida

Estado: Verificado (técnico y composición auxiliar; aceptación nativa separada) | Fecha: 2026-11-10

RF-07/09/10/13; RNF-02/03; US-06/07b/08/09; TASKS 5.3/5.24. Fuentes: docs02/04/05/07/08/09/10, constitución, PRODUCT.md, DESIGN.md y specs/0001/0023/0031.

Solicitud explícita: mejorar Mis reservas con Impeccable en código, heredando el marketplace fotográfico. Hoy las miniaturas de 80 puntos, frases de igual peso y tarjetas idénticas mezclan pendientes e historial. Incluye composición, estados, accesibilidad y verificación; excluye API, datos, reglas, nuevos filtros/acciones, Figma y rediseño de Mis ventas/detalle.

### AC-01 — Primero lo que falta recoger

Agrupar en Por recoger (estado ACTIVE, incluso pendiente de actualización) y Anteriores (estados terminales), omitiendo secciones vacías. Ordenar pendientes por vencimiento y anteriores por fecha descendente. Calcular etiquetas de unidad antes de agrupar; conservar todas las reservas y sus IDs internos. Encabezado desplazable y lista virtualizada.

### AC-02 — Producto y precio reconocibles

Tarjeta del comprador con foto mayor, título flexible, unidad cuando corresponda y precio reservado de unitPrice. Conservar alternativa Sin foto sin consultas nuevas al detalle público. Tiempo restante y vencimiento propios en bloque sereno verde; sin alertas animadas, porcentajes inventados ni cambios al plazo. Historial compacto con texto/icono distinto por estado y fecha real. ACTIVE fuera de plazo muestra Plazo terminado; actualizando sin asumir EXPIRED.

### AC-03 — Acciones y recuperación intactas

WhatsApp autorizado y cancelación con confirmación solo en reservas accionables. Cada acción apunta a la unidad elegida. Conservar bloqueo durante envío, sincronización, actualización al vencer y datos previos tras error. Carga con esqueleto estático accesible, vacío con acceso a Explorar y error con Reintentar; no inventar reservas.

### AC-04 — Adaptabilidad y evidencia

Mantener Inter, verde UABC, tokens y navegación. Texto escalable, lectura sin truncar, controles de 48 puntos y separación de ocho, safe areas. Verificar tipos, pruebas significativas de agrupación/acciones/estados, composición auxiliar a 320/375/430 y horizontal, títulos largos y aumento de texto. Exportar Android/iOS y revisar con Impeccable. Registrar por separado ausencia de simuladores/hardware y aceptación nativa pendiente.
