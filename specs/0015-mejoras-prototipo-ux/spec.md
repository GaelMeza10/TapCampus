# 0015 — Mejoras priorizadas del prototipo

Estado: **Verificado** | Fecha: 2026-11-04

## Necesidad y alcance

Aplicar las ocho mejoras aceptadas por el usuario al archivo Figma `XvTMHHlXw8yfnd6x0v7Ulh`, conservando estilo, componentes, botón + y selector Disponibles ahora/Catálogo. Referencias: RF-03/04/05/05b/05c/06/07/08/11/12/13, RNF-02/03; US-03/04/05/05c/06/07/09/11; TASKS 5.7.

La entrega es un prototipo editable y navegable. La implementación Expo, API, migraciones y prueba UAT en estudiantes son trabajos distintos; no se cierran TASKS 5.1–5.6.

### AC-01 — Descripciones
Dado cada formulario, debe existir descripción multilínea y acceso por desplazamiento a todos sus campos y botón de publicación, sin superponerse al encabezado.

### AC-02 — Venta finalizada
Dada una publicación finalizada, no aparecen acciones de venta física, edición o ganga. Las reservas vigentes mantienen confirmación individual dentro de su propio plazo.

### AC-03 — Catálogos reales
Los filtros muestran las cinco zonas y las cuatro categorías de cada tipo de Backend/prisma/catalogs.ts; se elimina Ciencias/Apuntes. Las etiquetas abreviadas conservan correspondencia explícita.

### AC-04 — Temporizadores
El tiempo restante de venta se distingue del vencimiento del apartado; cada reserva conserva sus propios 20 minutos y precio.

### AC-05 — Reservas del vendedor
Se muestran las reservas pendientes juntas, ordenadas por vencimiento, con unidad, comprador, precio y acción individual; confirmar una no confirma la otra.

### AC-06 — Ganga
El prototipo permite recorrer configuración desactivada/manual/programada, precio mínimo y minutos antes del fin. La ganga activa muestra precio previo tachado y actual; no altera el precio histórico de reservas.

### AC-07 — Gestión del catálogo
Mis ventas incluye acceso al catálogo, tarjeta activa sin stock/horario/reservas/ganga, confirmación para marcar vendido y estado vendido sin acciones inválidas.

### AC-08 — Estados y navegación
Cargando, vacío y error conservan selector, filtros, FAB y navegación. Vacío y reserva vencida utilizan símbolos neutrales. Se pueden abrir filtros, cambiar de catálogo, publicar y reintentar donde corresponda.

## Casos límite

Fin de venta con dos reservas vigentes; reservas del mismo comprador a precios distintos; selección sin resultados; pérdida de conexión; artículo vendido. Los tiempos y valores son ejemplos visuales: la autoridad de producción sigue siendo el servidor.
