# 0044 — Plan técnico

Estado: Ejecutado; aceptación física pendiente | Especificación: spec.md

## Diseño y dependencias

1. AC-01: edit consume type existente; título específico y selector solo en creación sin tipo. Mantener cuerpo/validaciones, foto y borrador.
2. AC-02/04: MarketplaceViewport posee insets y bloqueo de navegación; Tabs renderiza BottomNavigation una sola vez. Shell se limita a contenido y tiene fallback para montaje aislado. Contenedores flex con minHeight 0; scrolls con contentInsetAdjustmentBehavior never y ajustes automáticos desactivados porque safe area ya se aplica externamente. Barra ocupa espacio en layout, sin superponer contenido.
3. AC-03: campus y encabezados dentro de listas de ventas/reservas; tarjeta de ventas con foto real, precio, stock/zona/horario compartidos. Reloj de reservas alinea urgencia con banner. Autenticación usa marca de campus y mismo patrón de regreso/iconos.
4. AC-04: GlassView, comprobación de disponibilidad y accesibilidad; fondo verde opaco como alternativa; sin dependencia nueva. Sin cambios API/eventos ni modelo de datos, privacidad y operaciones atómicas intactas. Reversión por archivos de UI de este cambio, preservando trabajo previo.
5. AC-05: Jest para rutas, elección de tipo, insets y glass; regresión completa, exportación y capturas auxiliares. Buscar dispositivo local; si no existe, documentar límite.

## Constitución

| Principio | Cumplimiento |
| --- | --- |
| I | Especificación y decisiones previas al código. |
| II | RF/US → AC → T → EV en expediente y documentos globales. |
| III | No modificar tiempos, stock, idempotencia ni servidor. |
| IV | Consumir contratos existentes sin nuevos datos de contacto. |
| V | Evidencia reproducible y separación auxiliar/nativa. |
| VI | Refinamiento autorizado; glass excepcional solo en tabs. |
