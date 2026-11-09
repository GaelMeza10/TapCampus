# 0023 — Fotografías en Mis reservas

Estado: Verificado (técnico y visual auxiliar; prueba física de imagen pendiente) | Fecha: 2026-11-06

Solicitud: el comprador reconoce mejor el producto si su reserva muestra la fotografía. Usar ui-ux-pro-max conservando identidad actual. RF-07/13; US-06/09; TASKS 5.3/5.16. Fuentes: docs02/03/04/05/07/08/09/10, constitución y 0001. La API actual solo incluye publicationTitle; buscar el detalle público para cada foto fallaría tras agotar stock o terminar venta. Ampliación aditiva, sin cambiar reservas/inventario ni migraciones.

### AC-01 — Imagen autorizada disponible con publicación oculta

Las proyecciones autorizadas de reserva incluyen `publicationImageUrl: string | null` desde la publicación relacionada, también tras agotarse/finalizarse. Se conservan permisos/contactos y contrato existente; sin llamadas adicionales por tarjeta al detalle público. Es la foto actual de la publicación, no un archivo histórico inmutable.

### AC-02 — Tarjeta reconocible y adaptable

Mis reservas muestra miniatura del producto junto a título/unidad y precio fijado, con estado, plazo y acciones legibles debajo. Mantener componentes, Inter y paleta; títulos flexibles y acciones accesibles a 320/390/430. Reutilizar PublicationPhoto con tamaño reservado, etiqueta descriptiva y «Sin foto» si falta o falla. Conservar comportamiento de reservas múltiples, cancelación y WhatsApp. La rama compacta de entregas del vendedor permanece igual.

### AC-03 — Compatibilidad de origen y verificación

El cliente normaliza rutas de uploads al origen API actual, igual que las fotos del feed, para todas las respuestas de reserva. Acepta servidores anteriores sin el campo. Verificar imagen/fallo/ausencia, estados, precios/acciones, proyección autorizada y regresión; documentar evidencia técnica, visual y límites nativos. No afirmar prueba en iPhone sin confirmación.
